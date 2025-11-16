"""
Technical indicator calculations for backtesting and forward testing
All indicators work on pandas DataFrames with OHLCV data
"""
import pandas as pd
import numpy as np
from typing import Dict, Any


class IndicatorEngine:
    """Compute technical indicators from OHLCV data"""
    
    @staticmethod
    def calculate(df: pd.DataFrame, indicator: str, params: Dict[str, Any]) -> pd.Series:
        """
        Calculate indicator based on type and parameters
        
        Args:
            df: DataFrame with columns ['open', 'high', 'low', 'close', 'volume']
            indicator: Type of indicator (SMA, EMA, RSI, etc.)
            params: Indicator parameters (e.g., {'period': 20})
        
        Returns:
            pandas Series with indicator values
        """
        indicator = indicator.upper()
        
        if indicator == 'SMA':
            return IndicatorEngine.sma(df, params.get('period', 20))
        elif indicator == 'EMA':
            return IndicatorEngine.ema(df, params.get('period', 20))
        elif indicator == 'RSI':
            return IndicatorEngine.rsi(df, params.get('period', 14))
        elif indicator == 'MACD':
            return IndicatorEngine.macd(df, 
                                       params.get('fast', 12),
                                       params.get('slow', 26),
                                       params.get('signal', 9))
        elif indicator == 'BOLLINGER':
            return IndicatorEngine.bollinger(df,
                                            params.get('period', 20),
                                            params.get('std', 2))
        elif indicator == 'VWAP':
            return IndicatorEngine.vwap(df)
        elif indicator == 'ATR':
            return IndicatorEngine.atr(df, params.get('period', 14))
        else:
            raise ValueError(f"Unknown indicator: {indicator}")
    
    @staticmethod
    def sma(df: pd.DataFrame, period: int) -> pd.Series:
        """Simple Moving Average"""
        return df['close'].rolling(window=period).mean()
    
    @staticmethod
    def ema(df: pd.DataFrame, period: int) -> pd.Series:
        """Exponential Moving Average"""
        return df['close'].ewm(span=period, adjust=False).mean()
    
    @staticmethod
    def rsi(df: pd.DataFrame, period: int = 14) -> pd.Series:
        """Relative Strength Index"""
        delta = df['close'].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    @staticmethod
    def macd(df: pd.DataFrame, fast: int = 12, slow: int = 26, signal: int = 9) -> Dict[str, pd.Series]:
        """MACD indicator - returns dict with macd, signal, histogram"""
        ema_fast = df['close'].ewm(span=fast, adjust=False).mean()
        ema_slow = df['close'].ewm(span=slow, adjust=False).mean()
        macd_line = ema_fast - ema_slow
        signal_line = macd_line.ewm(span=signal, adjust=False).mean()
        histogram = macd_line - signal_line
        
        return {
            'macd': macd_line,
            'signal': signal_line,
            'histogram': histogram
        }
    
    @staticmethod
    def bollinger(df: pd.DataFrame, period: int = 20, std: float = 2) -> Dict[str, pd.Series]:
        """Bollinger Bands - returns dict with upper, middle, lower"""
        middle = df['close'].rolling(window=period).mean()
        std_dev = df['close'].rolling(window=period).std()
        upper = middle + (std_dev * std)
        lower = middle - (std_dev * std)
        
        return {
            'upper': upper,
            'middle': middle,
            'lower': lower
        }
    
    @staticmethod
    def vwap(df: pd.DataFrame) -> pd.Series:
        """Volume Weighted Average Price"""
        typical_price = (df['high'] + df['low'] + df['close']) / 3
        vwap = (typical_price * df['volume']).cumsum() / df['volume'].cumsum()
        return vwap
    
    @staticmethod
    def atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
        """Average True Range"""
        high_low = df['high'] - df['low']
        high_close = np.abs(df['high'] - df['close'].shift())
        low_close = np.abs(df['low'] - df['close'].shift())
        
        true_range = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
        atr = true_range.rolling(window=period).mean()
        return atr


class ConditionEvaluator:
    """Evaluate trading conditions and rules"""
    
    @staticmethod
    def evaluate(condition_expr: str, indicators: Dict[str, pd.Series], 
                 current_idx: int) -> bool:
        """
        Evaluate a condition expression at a specific bar
        
        Args:
            condition_expr: Expression like "cross_over(b1,b2)" or "b1 > 70"
            indicators: Dict mapping block_id to indicator series
            current_idx: Current bar index
        
        Returns:
            Boolean result
        """
        try:
            # Handle cross over/under
            if 'cross_over' in condition_expr:
                return ConditionEvaluator._evaluate_crossover(
                    condition_expr, indicators, current_idx, True
                )
            elif 'cross_under' in condition_expr:
                return ConditionEvaluator._evaluate_crossover(
                    condition_expr, indicators, current_idx, False
                )
            
            # Handle comparisons (b1 > 70, b1 < b2, etc.)
            return ConditionEvaluator._evaluate_comparison(
                condition_expr, indicators, current_idx
            )
        
        except Exception as e:
            print(f"Error evaluating condition '{condition_expr}': {e}")
            return False
    
    @staticmethod
    def _evaluate_crossover(expr: str, indicators: Dict, idx: int, is_over: bool) -> bool:
        """Evaluate crossover/crossunder conditions"""
        # Extract block IDs from expression like "cross_over(b1,b2)"
        import re
        matches = re.findall(r'b\d+', expr)
        if len(matches) != 2:
            return False
        
        series1 = indicators.get(matches[0])
        series2 = indicators.get(matches[1])
        
        if series1 is None or series2 is None or idx < 1:
            return False
        
        # Check if series1 crosses series2
        prev_below = series1.iloc[idx - 1] < series2.iloc[idx - 1]
        curr_above = series1.iloc[idx] > series2.iloc[idx]
        
        if is_over:
            return prev_below and curr_above
        else:
            return (not prev_below) and (not curr_above)
    
    @staticmethod
    def _evaluate_comparison(expr: str, indicators: Dict, idx: int) -> bool:
        """Evaluate comparison conditions like 'b1 > 70' or 'b1 < b2'"""
        import re
        
        # Replace block IDs with actual values
        expr_eval = expr
        for block_id, series in indicators.items():
            if block_id in expr_eval:
                value = series.iloc[idx] if idx < len(series) else np.nan
                if pd.isna(value):
                    return False
                expr_eval = expr_eval.replace(block_id, str(value))
        
        # Safely evaluate the expression
        try:
            return eval(expr_eval)
        except:
            return False
