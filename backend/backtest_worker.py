"""
Backtesting Engine - Simulates strategy on historical data
Bar-by-bar execution with stop loss, take profit, and metrics calculation
"""
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import uuid

from indicators import IndicatorEngine, ConditionEvaluator


class BacktestEngine:
    """Execute backtest on historical data"""
    
    def __init__(self, strategy: Dict, symbol: str, start_date: str, 
                 end_date: str, initial_capital: float = 100000):
        self.strategy = strategy
        self.symbol = symbol
        self.start_date = start_date
        self.end_date = end_date
        self.initial_capital = initial_capital
        
        # Trading state
        self.cash = initial_capital
        self.position = None  # {qty, avgPrice, stopLoss, takeProfit}
        self.trades = []
        self.equity_curve = []
        
        # Indicator cache
        self.indicators = {}
        self.indicator_blocks = []
        self.condition_blocks = []
        self.action_blocks = []
    
    def run(self) -> Dict[str, Any]:
        """
        Execute full backtest and return results
        
        Returns:
            Dict with equityCurve, trades, metrics
        """
        try:
            # 1. Fetch historical data
            df = self._fetch_historical_data()
            if df is None or len(df) == 0:
                raise ValueError("No historical data available")
            
            print(f"📊 Backtesting {self.symbol}: {len(df)} bars from {df.index[0]} to {df.index[-1]}")
            
            # 2. Parse strategy blocks
            self._parse_strategy_blocks()
            print(f"📋 Strategy blocks: {len(self.indicator_blocks)} indicators, {len(self.condition_blocks)} conditions, {len(self.action_blocks)} actions")
            
            # 3. Calculate all indicators
            self._calculate_indicators(df)
            print(f"📈 Calculated {len(self.indicators)} indicators")
            
            # 4. Simulate bar-by-bar
            self._simulate_bars(df)
            print(f"💼 Executed {len(self.trades)} trades")
            
            # 5. Close any open position at end
            if self.position:
                self._close_position(
                    df.iloc[-1]['close'], 
                    df.index[-1], 
                    'end-of-backtest'
                )
            
            # 6. Calculate metrics
            metrics = self._calculate_metrics(df)
            
            return {
                'equityCurve': self.equity_curve,
                'trades': [self._trade_to_dict(t) for t in self.trades],
                'metrics': metrics,
                'status': 'completed'
            }
        
        except Exception as e:
            return {
                'status': 'failed',
                'error': str(e)
            }
    
    def _fetch_historical_data(self) -> pd.DataFrame:
        """Fetch OHLCV data from yfinance"""
        try:
            ticker = yf.Ticker(self.symbol)
            df = ticker.history(start=self.start_date, end=self.end_date)
            
            # Rename columns to lowercase
            df.columns = [c.lower() for c in df.columns]
            
            # Ensure we have required columns
            required = ['open', 'high', 'low', 'close', 'volume']
            if not all(col in df.columns for col in required):
                raise ValueError(f"Missing required columns: {required}")
            
            return df
        
        except Exception as e:
            print(f"Error fetching data for {self.symbol}: {e}")
            return None
    
    def _parse_strategy_blocks(self):
        """Separate blocks by type"""
        for block in self.strategy.get('blocks', []):
            block_type = block.get('type')
            if block_type == 'indicator':
                self.indicator_blocks.append(block)
            elif block_type == 'condition':
                self.condition_blocks.append(block)
            elif block_type == 'action':
                self.action_blocks.append(block)
    
    def _calculate_indicators(self, df: pd.DataFrame):
        """Pre-calculate all indicators"""
        for block in self.indicator_blocks:
            block_id = block['id']
            indicator_type = block['indicator']
            params = block.get('params', {})
            
            result = IndicatorEngine.calculate(df, indicator_type, params)
            
            # Handle indicators that return multiple series (MACD, Bollinger)
            if isinstance(result, dict):
                for key, series in result.items():
                    self.indicators[f"{block_id}_{key}"] = series
                # Use main series as default
                self.indicators[block_id] = result.get('macd') or result.get('middle')
            else:
                self.indicators[block_id] = result
    
    def _simulate_bars(self, df: pd.DataFrame):
        """Simulate trading bar by bar"""
        for idx in range(len(df)):
            timestamp = df.index[idx]
            bar = df.iloc[idx]
            
            # Update equity curve
            portfolio_value = self.cash
            if self.position:
                portfolio_value += self.position['qty'] * bar['close']
            self.equity_curve.append({
                'timestamp': timestamp.isoformat(),
                'value': portfolio_value
            })
            
            # Check stop loss / take profit on existing position
            if self.position:
                if self._check_stop_loss(bar):
                    self._close_position(self.position['stopLoss'], timestamp, 'stop-loss')
                    continue
                
                if self._check_take_profit(bar):
                    self._close_position(self.position['takeProfit'], timestamp, 'take-profit')
                    continue
            
            # Evaluate conditions
            for condition_block in self.condition_blocks:
                condition_expr = condition_block.get('expr')
                if not condition_expr:
                    continue
                
                if ConditionEvaluator.evaluate(condition_expr, self.indicators, idx):
                    # Condition met - execute associated actions
                    self._execute_actions(bar, timestamp, idx)
                    break  # Only execute first matching condition per bar
    
    def _check_stop_loss(self, bar: pd.Series) -> bool:
        """Check if stop loss is hit"""
        if not self.position or not self.position.get('stopLoss'):
            return False
        return bar['low'] <= self.position['stopLoss']
    
    def _check_take_profit(self, bar: pd.Series) -> bool:
        """Check if take profit is hit"""
        if not self.position or not self.position.get('takeProfit'):
            return False
        return bar['high'] >= self.position['takeProfit']
    
    def _execute_actions(self, bar: pd.Series, timestamp, idx: int):
        """Execute action blocks (BUY, SELL, EXIT)"""
        for action_block in self.action_blocks:
            action_type = action_block.get('action')
            params = action_block.get('params', {})
            
            if action_type == 'BUY' and not self.position:
                self._open_buy_position(bar['close'], timestamp, params)
            
            elif action_type == 'SELL' and self.position:
                self._close_position(bar['close'], timestamp, 'logic')
            
            elif action_type == 'EXIT_ALL' and self.position:
                self._close_position(bar['close'], timestamp, 'exit-all')
    
    def _open_buy_position(self, price: float, timestamp, params: Dict):
        """Open a buy position"""
        size_pct = params.get('sizePct', 0.25)
        stop_loss_pct = params.get('stopLossPct', 0.05)
        take_profit_pct = params.get('takeProfitPct', 0.10)
        
        position_value = self.cash * size_pct
        qty = position_value / price
        
        if qty <= 0:
            return
        
        self.position = {
            'qty': qty,
            'avgPrice': price,
            'stopLoss': price * (1 - stop_loss_pct) if stop_loss_pct else None,
            'takeProfit': price * (1 + take_profit_pct) if take_profit_pct else None,
            'entryTime': timestamp
        }
        
        self.cash -= position_value
    
    def _close_position(self, price: float, timestamp, reason: str):
        """Close the current position"""
        if not self.position:
            return
        
        qty = self.position['qty']
        entry_price = self.position['avgPrice']
        position_value = qty * price
        
        pnl = position_value - (qty * entry_price)
        pnl_pct = (pnl / (qty * entry_price)) * 100
        
        self.cash += position_value
        
        # Record trade
        trade = {
            'id': str(uuid.uuid4()),
            'symbol': self.symbol,
            'side': 'BUY',
            'qty': qty,
            'entryPrice': entry_price,
            'exitPrice': price,
            'stopLoss': self.position.get('stopLoss'),
            'takeProfit': self.position.get('takeProfit'),
            'pnl': pnl,
            'pnlPct': pnl_pct,
            'exitReason': reason,
            'entryTime': self.position['entryTime'].isoformat() if hasattr(self.position['entryTime'], 'isoformat') else str(self.position['entryTime']),
            'exitTime': timestamp.isoformat() if hasattr(timestamp, 'isoformat') else str(timestamp)
        }
        
        self.trades.append(trade)
        self.position = None
    
    def _trade_to_dict(self, trade: Dict) -> Dict:
        """Convert trade to serializable dict"""
        return trade
    
    def _calculate_metrics(self, df: pd.DataFrame) -> Dict[str, float]:
        """Calculate backtest performance metrics"""
        if len(self.equity_curve) == 0:
            print("⚠️ Warning: Empty equity curve, returning default metrics")
            return {
                'totalReturnPct': 0,
                'cagr': 0,
                'sharpeRatio': 0,
                'maxDrawdown': 0,
                'winRate': 0,
                'profitFactor': 0,
                'totalTrades': 0,
                'winningTrades': 0,
                'losingTrades': 0,
                'avgWin': 0,
                'avgLoss': 0,
                'finalValue': self.initial_capital
            }
        
        equity_values = [e['value'] for e in self.equity_curve]
        returns = pd.Series(equity_values).pct_change().dropna()
        
        final_value = equity_values[-1]
        total_return = ((final_value - self.initial_capital) / self.initial_capital) * 100
        
        print(f"💰 Initial: ₹{self.initial_capital:,.2f} → Final: ₹{final_value:,.2f} ({total_return:+.2f}%)")
        
        # Calculate CAGR
        days = len(df)
        years = days / 252  # Trading days per year
        cagr = (((final_value / self.initial_capital) ** (1 / years)) - 1) * 100 if years > 0 else 0
        
        # Sharpe Ratio
        if len(returns) > 0 and returns.std() > 0:
            sharpe_ratio = (returns.mean() / returns.std()) * np.sqrt(252)
        else:
            sharpe_ratio = 0
        
        # Max Drawdown
        equity_series = pd.Series(equity_values)
        cummax = equity_series.cummax()
        drawdown = (equity_series - cummax) / cummax * 100
        max_drawdown = drawdown.min()
        
        # Trade statistics
        winning_trades = [t for t in self.trades if t['pnl'] > 0]
        losing_trades = [t for t in self.trades if t['pnl'] < 0]
        
        win_rate = (len(winning_trades) / len(self.trades) * 100) if self.trades else 0
        
        # Calculate gross profit and gross loss
        gross_profit = sum([t['pnl'] for t in winning_trades]) if winning_trades else 0
        gross_loss = abs(sum([t['pnl'] for t in losing_trades])) if losing_trades else 0
        
        # Profit factor = Gross Profit / Gross Loss
        profit_factor = (gross_profit / gross_loss) if gross_loss > 0 else (gross_profit if gross_profit > 0 else 0)
        
        avg_win = (gross_profit / len(winning_trades)) if winning_trades else 0
        avg_loss = (gross_loss / len(losing_trades)) if losing_trades else 0
        
        return {
            'totalReturnPct': round(total_return, 2),
            'cagr': round(cagr, 2),
            'sharpeRatio': round(sharpe_ratio, 2),
            'maxDrawdown': round(max_drawdown, 2),
            'winRate': round(win_rate, 2),
            'profitFactor': round(profit_factor, 2),
            'totalTrades': len(self.trades),
            'winningTrades': len(winning_trades),
            'losingTrades': len(losing_trades),
            'avgWin': round(avg_win, 2),
            'avgLoss': round(avg_loss, 2),
            'finalValue': round(final_value, 2)
        }


def run_backtest(strategy: Dict, symbol: str, start_date: str, 
                 end_date: str, initial_capital: float = 100000) -> Dict:
    """
    Convenience function to run a backtest
    
    Args:
        strategy: Strategy JSON with blocks
        symbol: Stock symbol (e.g., 'RELIANCE.NS')
        start_date: Start date (YYYY-MM-DD)
        end_date: End date (YYYY-MM-DD)
        initial_capital: Starting capital
    
    Returns:
        Backtest results dict
    """
    engine = BacktestEngine(strategy, symbol, start_date, end_date, initial_capital)
    return engine.run()
