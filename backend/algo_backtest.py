"""
Algorithmic Strategy Backtesting Engine
Real market data backtesting with actual technical indicators
"""

import yfinance as yf
import pandas as pd
import numpy as np
from typing import Dict, List, Any
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')


def calculate_sma(data: pd.Series, period: int) -> pd.Series:
    """Calculate Simple Moving Average"""
    return data.rolling(window=period).mean()


def calculate_ema(data: pd.Series, period: int) -> pd.Series:
    """Calculate Exponential Moving Average"""
    return data.ewm(span=period, adjust=False).mean()


def calculate_rsi(data: pd.Series, period: int = 14) -> pd.Series:
    """Calculate Relative Strength Index"""
    delta = data.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi


def calculate_macd(data: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> Dict[str, pd.Series]:
    """Calculate MACD"""
    ema_fast = data.ewm(span=fast, adjust=False).mean()
    ema_slow = data.ewm(span=slow, adjust=False).mean()
    macd = ema_fast - ema_slow
    signal_line = macd.ewm(span=signal, adjust=False).mean()
    histogram = macd - signal_line
    
    return {
        'macd': macd,
        'signal': signal_line,
        'histogram': histogram
    }


def calculate_bollinger_bands(data: pd.Series, period: int = 20, std_dev: int = 2) -> Dict[str, pd.Series]:
    """Calculate Bollinger Bands"""
    sma = data.rolling(window=period).mean()
    std = data.rolling(window=period).std()
    upper_band = sma + (std * std_dev)
    lower_band = sma - (std * std_dev)
    
    return {
        'upper': upper_band,
        'middle': sma,
        'lower': lower_band
    }


def evaluate_condition(condition: Dict[str, Any], price: float, indicators: Dict[str, Any], prev_price: float) -> bool:
    """Evaluate if a condition is met"""
    condition_id = condition['id']
    params = condition['params']
    
    if condition_id == 'crossover':
        # Price crossover condition
        indicator = params.get('indicator2', 'sma')
        direction = params.get('direction', 'above')
        
        if indicator in indicators:
            indicator_value = indicators[indicator]
            if direction == 'above':
                return price > indicator_value and prev_price <= indicator_value
            else:
                return price < indicator_value and prev_price >= indicator_value
        return False
    
    elif condition_id == 'threshold':
        # Threshold condition
        indicator = params.get('indicator', 'rsi')
        operator = params.get('operator', '<')
        value = params.get('value', 30)
        
        if indicator in indicators:
            indicator_value = indicators[indicator]
            if operator == '<':
                return indicator_value < value
            elif operator == '>':
                return indicator_value > value
            elif operator == '=':
                return abs(indicator_value - value) < 1
        return False
    
    elif condition_id == 'priceChange':
        # Price change percentage
        percentage = params.get('percentage', 5)
        direction = params.get('direction', 'up')
        
        change_pct = ((price - prev_price) / prev_price) * 100
        if direction == 'up':
            return change_pct >= percentage
        else:
            return change_pct <= -percentage
    
    return False


def backtest_strategy(symbol: str, strategy_blocks: List[Dict[str, Any]], 
                     start_date: str = None, end_date: str = None,
                     initial_capital: float = 100000) -> Dict[str, Any]:
    """
    Run backtest on real Indian market data with actual technical indicators
    
    Args:
        symbol: Stock symbol (e.g., 'RELIANCE.NS', 'TCS.NS')
        strategy_blocks: List of strategy blocks with indicators, conditions, actions
        start_date: Start date for backtest (YYYY-MM-DD)
        end_date: End date for backtest (YYYY-MM-DD)
        initial_capital: Starting capital in INR
    
    Returns:
        Dictionary with backtest results, equity curve, trades, and metrics
    """
    
    # Set default dates if not provided
    if not end_date:
        end_date = datetime.now().strftime('%Y-%m-%d')
    if not start_date:
        start_date = (datetime.now() - timedelta(days=365)).strftime('%Y-%m-%d')
    
    # Add .NS suffix for Indian stocks if not present
    if not symbol.endswith('.NS') and not symbol.endswith('.BO'):
        symbol = f"{symbol}.NS"
    
    try:
        # Fetch real market data
        stock = yf.Ticker(symbol)
        df = stock.history(start=start_date, end=end_date)
        
        if df.empty:
            return {
                "success": False,
                "error": f"No data available for {symbol}. Check symbol or date range."
            }
        
        # Separate blocks by type
        indicators = [b for b in strategy_blocks if b.get('type') == 'indicator']
        conditions = [b for b in strategy_blocks if b.get('type') == 'condition']
        actions = [b for b in strategy_blocks if b.get('type') == 'action']
        
        # Calculate all indicators
        indicator_values = {}
        
        for ind in indicators:
            ind_id = ind['id']
            params = ind['params']
            
            if ind_id == 'sma':
                period = params.get('period', 20)
                indicator_values['sma'] = calculate_sma(df['Close'], period)
            
            elif ind_id == 'ema':
                period = params.get('period', 20)
                indicator_values['ema'] = calculate_ema(df['Close'], period)
            
            elif ind_id == 'rsi':
                period = params.get('period', 14)
                indicator_values['rsi'] = calculate_rsi(df['Close'], period)
            
            elif ind_id == 'macd':
                fast = params.get('fast', 12)
                slow = params.get('slow', 26)
                signal = params.get('signal', 9)
                macd_data = calculate_macd(df['Close'], fast, slow, signal)
                indicator_values['macd'] = macd_data['macd']
                indicator_values['macd_signal'] = macd_data['signal']
                indicator_values['macd_histogram'] = macd_data['histogram']
            
            elif ind_id == 'bollinger':
                period = params.get('period', 20)
                std_dev = params.get('stdDev', 2)
                bb_data = calculate_bollinger_bands(df['Close'], period, std_dev)
                indicator_values['bb_upper'] = bb_data['upper']
                indicator_values['bb_middle'] = bb_data['middle']
                indicator_values['bb_lower'] = bb_data['lower']
        
        # Initialize tracking variables
        capital = initial_capital
        position = 0  # Number of shares held
        entry_price = 0
        trades = []
        equity_curve = []
        peak_equity = initial_capital
        max_drawdown = 0
        
        # Find stop loss and take profit percentages
        stop_loss_pct = None
        take_profit_pct = None
        
        for action in actions:
            if action['id'] == 'stopLoss':
                stop_loss_pct = action['params'].get('percentage', 5) / 100
            elif action['id'] == 'takeProfit':
                take_profit_pct = action['params'].get('percentage', 10) / 100
        
        # Run backtest day by day
        for i in range(1, len(df)):
            date = df.index[i]
            price = df['Close'].iloc[i]
            prev_price = df['Close'].iloc[i-1]
            
            # Get current indicator values
            current_indicators = {}
            for ind_name, ind_series in indicator_values.items():
                if i < len(ind_series):
                    current_indicators[ind_name] = ind_series.iloc[i]
            
            # Check stop loss and take profit if holding position
            if position > 0:
                current_pl_pct = (price - entry_price) / entry_price
                
                # Stop loss
                if stop_loss_pct and current_pl_pct <= -stop_loss_pct:
                    capital += position * price
                    pl = (price - entry_price) * position
                    trades.append({
                        'date': date.strftime('%Y-%m-%d'),
                        'type': 'SELL',
                        'reason': 'Stop Loss',
                        'shares': position,
                        'price': round(price, 2),
                        'pl': round(pl, 2),
                        'pl_pct': round(current_pl_pct * 100, 2)
                    })
                    position = 0
                    entry_price = 0
                
                # Take profit
                elif take_profit_pct and current_pl_pct >= take_profit_pct:
                    capital += position * price
                    pl = (price - entry_price) * position
                    trades.append({
                        'date': date.strftime('%Y-%m-%d'),
                        'type': 'SELL',
                        'reason': 'Take Profit',
                        'shares': position,
                        'price': round(price, 2),
                        'pl': round(pl, 2),
                        'pl_pct': round(current_pl_pct * 100, 2)
                    })
                    position = 0
                    entry_price = 0
            
            # Evaluate conditions
            conditions_met = True
            if conditions:
                conditions_met = all(
                    evaluate_condition(cond, price, current_indicators, prev_price)
                    for cond in conditions
                )
            
            # Execute actions if conditions met
            if conditions_met:
                for action in actions:
                    action_id = action['id']
                    params = action['params']
                    
                    if action_id == 'buy' and position == 0:
                        # Buy action
                        quantity_type = params.get('quantity', 'percentage')
                        value = params.get('value', 10)
                        
                        if quantity_type == 'percentage':
                            amount_to_invest = capital * (value / 100)
                        else:
                            amount_to_invest = min(value * price, capital)
                        
                        shares_to_buy = int(amount_to_invest / price)
                        
                        if shares_to_buy > 0:
                            cost = shares_to_buy * price
                            capital -= cost
                            position = shares_to_buy
                            entry_price = price
                            
                            trades.append({
                                'date': date.strftime('%Y-%m-%d'),
                                'type': 'BUY',
                                'reason': 'Strategy Signal',
                                'shares': shares_to_buy,
                                'price': round(price, 2),
                                'cost': round(cost, 2)
                            })
                    
                    elif action_id == 'sell' and position > 0:
                        # Sell action
                        quantity = params.get('quantity', 'all')
                        
                        if quantity == 'all':
                            shares_to_sell = position
                        else:
                            shares_to_sell = int(position * 0.5)
                        
                        revenue = shares_to_sell * price
                        capital += revenue
                        pl = (price - entry_price) * shares_to_sell
                        pl_pct = ((price - entry_price) / entry_price) * 100
                        
                        trades.append({
                            'date': date.strftime('%Y-%m-%d'),
                            'type': 'SELL',
                            'reason': 'Strategy Signal',
                            'shares': shares_to_sell,
                            'price': round(price, 2),
                            'pl': round(pl, 2),
                            'pl_pct': round(pl_pct, 2)
                        })
                        
                        position -= shares_to_sell
                        if position == 0:
                            entry_price = 0
            
            # Calculate current equity
            current_equity = capital + (position * price)
            equity_curve.append({
                'date': date.strftime('%Y-%m-%d'),
                'equity': round(current_equity, 2),
                'capital': round(capital, 2),
                'position_value': round(position * price, 2)
            })
            
            # Track max drawdown
            if current_equity > peak_equity:
                peak_equity = current_equity
            drawdown = (peak_equity - current_equity) / peak_equity
            max_drawdown = max(max_drawdown, drawdown)
        
        # Close any open position at the end
        if position > 0:
            final_price = df['Close'].iloc[-1]
            capital += position * final_price
            pl = (final_price - entry_price) * position
            pl_pct = ((final_price - entry_price) / entry_price) * 100
            
            trades.append({
                'date': df.index[-1].strftime('%Y-%m-%d'),
                'type': 'SELL',
                'reason': 'End of Backtest',
                'shares': position,
                'price': round(final_price, 2),
                'pl': round(pl, 2),
                'pl_pct': round(pl_pct, 2)
            })
            position = 0
        
        # Calculate metrics
        final_equity = capital + (position * df['Close'].iloc[-1])
        total_return = ((final_equity - initial_capital) / initial_capital) * 100
        
        # Calculate win rate
        sell_trades = [t for t in trades if t['type'] == 'SELL' and 'pl' in t]
        winning_trades = [t for t in sell_trades if t['pl'] > 0]
        win_rate = (len(winning_trades) / len(sell_trades) * 100) if sell_trades else 0
        
        # Calculate Sharpe ratio (simplified)
        if len(equity_curve) > 1:
            returns = pd.Series([equity_curve[i]['equity'] for i in range(len(equity_curve))]).pct_change().dropna()
            if len(returns) > 0 and returns.std() > 0:
                sharpe_ratio = (returns.mean() / returns.std()) * np.sqrt(252)
            else:
                sharpe_ratio = 0
        else:
            sharpe_ratio = 0
        
        # Calculate profit factor
        total_profit = sum([t['pl'] for t in sell_trades if t['pl'] > 0]) if sell_trades else 0
        total_loss = abs(sum([t['pl'] for t in sell_trades if t['pl'] < 0])) if sell_trades else 0
        profit_factor = total_profit / total_loss if total_loss > 0 else (total_profit if total_profit > 0 else 1)
        
        return {
            "success": True,
            "symbol": symbol,
            "period": f"{start_date} to {end_date}",
            "initial_capital": initial_capital,
            "final_equity": round(final_equity, 2),
            "metrics": {
                "total_return": round(total_return, 2),
                "total_return_amount": round(final_equity - initial_capital, 2),
                "final_capital": round(final_equity, 2),
                "win_rate": round(win_rate, 2),
                "total_trades": len(trades),
                "winning_trades": len(winning_trades),
                "losing_trades": len(sell_trades) - len(winning_trades),
                "sharpe_ratio": round(sharpe_ratio, 2),
                "max_drawdown": round(max_drawdown * 100, 2),
                "profit_factor": round(profit_factor, 2),
                "avg_trade": round(total_return / len(sell_trades), 2) if sell_trades else 0
            },
            "equity_curve": equity_curve[-100:],  # Last 100 days for frontend
            "trades": trades[-50:],  # Last 50 trades
            "total_trades_count": len(trades)
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def get_indian_stocks() -> List[Dict[str, str]]:
    """Get list of popular Indian stocks"""
    return [
        {"symbol": "RELIANCE.NS", "name": "Reliance Industries"},
        {"symbol": "TCS.NS", "name": "Tata Consultancy Services"},
        {"symbol": "HDFCBANK.NS", "name": "HDFC Bank"},
        {"symbol": "INFY.NS", "name": "Infosys"},
        {"symbol": "HINDUNILVR.NS", "name": "Hindustan Unilever"},
        {"symbol": "ICICIBANK.NS", "name": "ICICI Bank"},
        {"symbol": "SBIN.NS", "name": "State Bank of India"},
        {"symbol": "BHARTIARTL.NS", "name": "Bharti Airtel"},
        {"symbol": "ITC.NS", "name": "ITC Limited"},
        {"symbol": "KOTAKBANK.NS", "name": "Kotak Mahindra Bank"},
        {"symbol": "LT.NS", "name": "Larsen & Toubro"},
        {"symbol": "AXISBANK.NS", "name": "Axis Bank"},
        {"symbol": "ASIANPAINT.NS", "name": "Asian Paints"},
        {"symbol": "MARUTI.NS", "name": "Maruti Suzuki"},
        {"symbol": "TITAN.NS", "name": "Titan Company"},
        {"symbol": "WIPRO.NS", "name": "Wipro"},
        {"symbol": "ULTRACEMCO.NS", "name": "UltraTech Cement"},
        {"symbol": "SUNPHARMA.NS", "name": "Sun Pharmaceutical"},
        {"symbol": "NESTLEIND.NS", "name": "Nestle India"},
        {"symbol": "TECHM.NS", "name": "Tech Mahindra"}
    ]
