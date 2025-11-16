"""
Forward Testing Runner - Live paper trading with real-time market data
Evaluates strategies in real-time and executes trades in virtual portfolio
"""
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import time
import threading
import uuid

from indicators import IndicatorEngine, ConditionEvaluator
from models import Portfolio, Trade, DeployedStrategy, portfolios_db, trades_db, deployments_db


class ForwardRunner:
    """Execute strategy in real-time on live market data"""
    
    def __init__(self, strategy: Dict, portfolio_id: str, deployment_id: str):
        self.strategy = strategy
        self.portfolio_id = portfolio_id
        self.deployment_id = deployment_id
        self.symbols = strategy.get('symbols', [])
        self.timeframe = strategy.get('timeframe', '1d')
        
        # Trading state
        self.is_running = False
        self.thread = None
        
        # Historical data for indicator calculation (rolling window)
        self.data_windows = {}  # symbol -> DataFrame
        self.window_size = 100  # Keep last 100 bars
        
        # Indicator cache
        self.indicators = {}
        self.indicator_blocks = []
        self.condition_blocks = []
        self.action_blocks = []
        
        # Parse strategy
        self._parse_strategy_blocks()
    
    def start(self):
        """Start forward testing in background thread"""
        if self.is_running:
            return
        
        self.is_running = True
        self.thread = threading.Thread(target=self._run_loop, daemon=True)
        self.thread.start()
        print(f"Forward runner started for deployment {self.deployment_id}")
    
    def stop(self):
        """Stop forward testing"""
        self.is_running = False
        if self.thread:
            self.thread.join(timeout=5)
        print(f"Forward runner stopped for deployment {self.deployment_id}")
    
    def _run_loop(self):
        """Main execution loop - polls market data and evaluates strategy"""
        while self.is_running:
            try:
                for symbol in self.symbols:
                    # 1. Fetch latest market data
                    self._update_market_data(symbol)
                    
                    # 2. Calculate indicators
                    self._calculate_indicators(symbol)
                    
                    # 3. Check stop loss / take profit on existing positions
                    self._check_exit_conditions(symbol)
                    
                    # 4. Evaluate strategy conditions
                    self._evaluate_strategy(symbol)
                
                # Update deployment timestamp
                if self.deployment_id in deployments_db:
                    deployments_db[self.deployment_id].last_update = datetime.utcnow()
                
                # Sleep based on timeframe
                sleep_seconds = self._get_sleep_interval()
                time.sleep(sleep_seconds)
            
            except Exception as e:
                print(f"Error in forward runner loop: {e}")
                time.sleep(60)  # Wait 1 minute on error
    
    def _get_sleep_interval(self) -> int:
        """Get polling interval based on timeframe"""
        intervals = {
            '1m': 60,
            '5m': 300,
            '15m': 900,
            '1h': 3600,
            '1d': 300  # Poll every 5 minutes for daily data
        }
        return intervals.get(self.timeframe, 300)
    
    def _update_market_data(self, symbol: str):
        """Fetch latest market data and update rolling window"""
        try:
            ticker = yf.Ticker(symbol)
            
            # Fetch recent data based on timeframe
            period = '5d' if self.timeframe == '1d' else '1d'
            interval = self.timeframe
            
            df = ticker.history(period=period, interval=interval)
            
            if df is None or len(df) == 0:
                return
            
            # Rename columns to lowercase
            df.columns = [c.lower() for c in df.columns]
            
            # Update rolling window
            if symbol not in self.data_windows:
                self.data_windows[symbol] = df
            else:
                # Append new data and keep last window_size bars
                self.data_windows[symbol] = pd.concat([
                    self.data_windows[symbol], df
                ]).tail(self.window_size)
            
            # Remove duplicates
            self.data_windows[symbol] = self.data_windows[symbol][
                ~self.data_windows[symbol].index.duplicated(keep='last')
            ]
        
        except Exception as e:
            print(f"Error fetching data for {symbol}: {e}")
    
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
    
    def _calculate_indicators(self, symbol: str):
        """Calculate all indicators for the symbol"""
        if symbol not in self.data_windows:
            return
        
        df = self.data_windows[symbol]
        indicators_key = symbol
        
        if indicators_key not in self.indicators:
            self.indicators[indicators_key] = {}
        
        for block in self.indicator_blocks:
            block_id = block['id']
            indicator_type = block['indicator']
            params = block.get('params', {})
            
            result = IndicatorEngine.calculate(df, indicator_type, params)
            
            # Handle indicators that return multiple series
            if isinstance(result, dict):
                for key, series in result.items():
                    self.indicators[indicators_key][f"{block_id}_{key}"] = series
                self.indicators[indicators_key][block_id] = result.get('macd') or result.get('middle')
            else:
                self.indicators[indicators_key][block_id] = result
    
    def _check_exit_conditions(self, symbol: str):
        """Check stop loss and take profit on existing positions"""
        portfolio = portfolios_db.get(self.portfolio_id)
        if not portfolio:
            return
        
        holding = portfolio.holdings.get(symbol)
        if not holding:
            return
        
        # Get current price
        current_price = self._get_current_price(symbol)
        if not current_price:
            return
        
        # Update current price in holding
        holding['currentPrice'] = current_price
        holding['pnl'] = (current_price - holding['avgPrice']) * holding['qty']
        holding['pnlPct'] = ((current_price - holding['avgPrice']) / holding['avgPrice']) * 100
        
        # Check stop loss
        if 'stopLoss' in holding and holding['stopLoss']:
            if current_price <= holding['stopLoss']:
                self._close_position(symbol, current_price, 'stop-loss')
                return
        
        # Check take profit
        if 'takeProfit' in holding and holding['takeProfit']:
            if current_price >= holding['takeProfit']:
                self._close_position(symbol, current_price, 'take-profit')
                return
    
    def _evaluate_strategy(self, symbol: str):
        """Evaluate strategy conditions and execute actions"""
        if symbol not in self.data_windows:
            return
        
        df = self.data_windows[symbol]
        if len(df) == 0:
            return
        
        indicators_key = symbol
        if indicators_key not in self.indicators:
            return
        
        current_idx = len(df) - 1
        
        # Evaluate conditions
        for condition_block in self.condition_blocks:
            condition_expr = condition_block.get('expr')
            if not condition_expr:
                continue
            
            if ConditionEvaluator.evaluate(
                condition_expr, 
                self.indicators[indicators_key], 
                current_idx
            ):
                # Condition met - execute actions
                current_price = df.iloc[-1]['close']
                self._execute_actions(symbol, current_price)
                break
    
    def _execute_actions(self, symbol: str, price: float):
        """Execute action blocks"""
        portfolio = portfolios_db.get(self.portfolio_id)
        if not portfolio:
            return
        
        has_position = symbol in portfolio.holdings
        
        for action_block in self.action_blocks:
            action_type = action_block.get('action')
            params = action_block.get('params', {})
            
            if action_type == 'BUY' and not has_position:
                self._open_position(symbol, price, params)
            
            elif action_type == 'SELL' and has_position:
                self._close_position(symbol, price, 'logic')
            
            elif action_type == 'EXIT_ALL' and has_position:
                self._close_position(symbol, price, 'exit-all')
    
    def _open_position(self, symbol: str, price: float, params: Dict):
        """Open a new position"""
        portfolio = portfolios_db.get(self.portfolio_id)
        if not portfolio:
            return
        
        size_pct = params.get('sizePct', 0.25)
        stop_loss_pct = params.get('stopLossPct', 0.05)
        take_profit_pct = params.get('takeProfitPct', 0.10)
        
        position_value = portfolio.cash * size_pct
        qty = position_value / price
        
        if qty <= 0 or position_value > portfolio.cash:
            return
        
        # Update portfolio
        portfolio.cash -= position_value
        portfolio.holdings[symbol] = {
            'qty': qty,
            'avgPrice': price,
            'currentPrice': price,
            'pnl': 0,
            'pnlPct': 0,
            'stopLoss': price * (1 - stop_loss_pct) if stop_loss_pct else None,
            'takeProfit': price * (1 + take_profit_pct) if take_profit_pct else None
        }
        
        # Record trade
        trade = Trade(
            trade_id=str(uuid.uuid4()),
            portfolio_id=self.portfolio_id,
            symbol=symbol,
            side='BUY',
            quantity=qty,
            price=price,
            stop_loss=portfolio.holdings[symbol]['stopLoss'],
            take_profit=portfolio.holdings[symbol]['takeProfit']
        )
        
        trades_db[trade.trade_id] = trade
        portfolio.trades.append(trade.to_dict())
        
        print(f"Opened position: {symbol} @ {price}, qty: {qty}")
    
    def _close_position(self, symbol: str, price: float, reason: str):
        """Close an existing position"""
        portfolio = portfolios_db.get(self.portfolio_id)
        if not portfolio or symbol not in portfolio.holdings:
            return
        
        holding = portfolio.holdings[symbol]
        qty = holding['qty']
        entry_price = holding['avgPrice']
        
        position_value = qty * price
        pnl = position_value - (qty * entry_price)
        
        # Update portfolio
        portfolio.cash += position_value
        del portfolio.holdings[symbol]
        
        # Update trade record
        for trade_dict in portfolio.trades:
            if (trade_dict['symbol'] == symbol and 
                trade_dict['status'] == 'open'):
                trade_dict['status'] = 'closed'
                trade_dict['exitPrice'] = price
                trade_dict['exitReason'] = reason
                trade_dict['pnl'] = pnl
                trade_dict['pnlPct'] = (pnl / (qty * entry_price)) * 100
                trade_dict['exitTime'] = datetime.utcnow().isoformat()
                break
        
        # Update equity curve
        total_value = portfolio.cash + sum(
            h['qty'] * h['currentPrice'] 
            for h in portfolio.holdings.values()
        )
        portfolio.equity_curve.append({
            'timestamp': datetime.utcnow().isoformat(),
            'value': total_value
        })
        
        print(f"Closed position: {symbol} @ {price}, P&L: {pnl:.2f} ({reason})")
    
    def _get_current_price(self, symbol: str) -> Optional[float]:
        """Get current market price"""
        if symbol in self.data_windows and len(self.data_windows[symbol]) > 0:
            return self.data_windows[symbol].iloc[-1]['close']
        return None


# Global registry of active runners
active_runners = {}


def deploy_strategy(strategy: Dict, portfolio_id: str, deployment_id: str) -> ForwardRunner:
    """
    Deploy a strategy for forward testing
    
    Args:
        strategy: Strategy JSON
        portfolio_id: Portfolio to trade in
        deployment_id: Unique deployment ID
    
    Returns:
        ForwardRunner instance
    """
    runner = ForwardRunner(strategy, portfolio_id, deployment_id)
    runner.start()
    active_runners[deployment_id] = runner
    return runner


def stop_deployment(deployment_id: str):
    """Stop a deployed strategy"""
    if deployment_id in active_runners:
        active_runners[deployment_id].stop()
        del active_runners[deployment_id]
