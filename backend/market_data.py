"""
Market Data Module
Fetches real-time market data using yfinance for Indian indices and stocks
"""

import yfinance as yf
from datetime import datetime, timedelta
import pandas as pd
from typing import Dict, List, Any
import logging

# Suppress yfinance warnings
logging.getLogger('yfinance').setLevel(logging.CRITICAL)

# Indian Market Indices with their Yahoo Finance tickers
INDIAN_INDICES = {
    'NIFTY 50': '^NSEI',
    'SENSEX': '^BSESN',
    'NIFTY BANK': '^NSEBANK',
    'NIFTY IT': '^CNXIT'
}

# Top Indian stocks for gainers/losers tracking
TOP_STOCKS = [
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
    'HINDUNILVR.NS', 'ITC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS',
    'LT.NS', 'AXISBANK.NS', 'BAJFINANCE.NS', 'MARUTI.NS', 'ASIANPAINT.NS',
    'WIPRO.NS', 'HCLTECH.NS', 'TITAN.NS', 'SUNPHARMA.NS', 'ULTRACEMCO.NS',
    'NESTLEIND.NS', 'POWERGRID.NS', 'NTPC.NS', 'TATAMOTORS.NS', 'M&M.NS',
    'TECHM.NS', 'ONGC.NS', 'BAJAJFINSV.NS', 'DIVISLAB.NS', 'ADANIPORTS.NS'
]


def get_index_data(ticker: str, name: str) -> Dict[str, Any]:
    """
    Fetch current data for a single index
    """
    try:
        index = yf.Ticker(ticker)
        hist = index.history(period='2d')
        
        if hist.empty or len(hist) < 1:
            return None
        
        current_price = hist['Close'].iloc[-1]
        previous_close = hist['Close'].iloc[-2] if len(hist) >= 2 else current_price
        
        change = current_price - previous_close
        change_pct = (change / previous_close) * 100 if previous_close != 0 else 0
        
        return {
            'symbol': name,
            'ticker': ticker,
            'last': round(current_price, 2),
            'change': round(change, 2),
            'changePct': round(change_pct, 2),
            'high': round(hist['High'].iloc[-1], 2),
            'low': round(hist['Low'].iloc[-1], 2),
            'volume': int(hist['Volume'].iloc[-1]) if hist['Volume'].iloc[-1] > 0 else 0,
            'previousClose': round(previous_close, 2)
        }
    except Exception:
        # Silently skip failed indices
        return None


def get_all_indices() -> List[Dict[str, Any]]:
    """
    Fetch data for all configured Indian indices
    """
    indices_data = []
    
    for name, ticker in INDIAN_INDICES.items():
        data = get_index_data(ticker, name)
        if data:
            indices_data.append(data)
    
    return indices_data


def get_stock_data(ticker: str) -> Dict[str, Any]:
    """
    Fetch current data for a single stock
    """
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period='2d')
        
        if hist.empty or len(hist) < 1:
            return None
        
        current_price = hist['Close'].iloc[-1]
        previous_close = hist['Close'].iloc[-2] if len(hist) >= 2 else current_price
        
        change = current_price - previous_close
        change_pct = (change / previous_close) * 100 if previous_close != 0 else 0
        
        # Get stock name (remove .NS suffix for display)
        symbol = ticker.replace('.NS', '').replace('.BO', '')
        
        volume = hist['Volume'].iloc[-1]
        volume_str = f"{int(volume) / 1000000:.1f}M" if volume >= 1000000 else f"{int(volume) / 1000:.0f}K"
        
        return {
            'symbol': symbol,
            'ticker': ticker,
            'last': round(current_price, 2),
            'change': round(change, 2),
            'changePct': round(change_pct, 2),
            'volume': volume_str,
            'high': round(hist['High'].iloc[-1], 2),
            'low': round(hist['Low'].iloc[-1], 2)
        }
    except Exception:
        # Silently skip failed stocks
        return None


def get_top_gainers_losers(limit: int = 5) -> tuple:
    """
    Fetch top gainers and losers from configured stock list
    """
    stocks_data = []
    
    # Fetch data with error suppression
    for ticker in TOP_STOCKS:
        try:
            data = get_stock_data(ticker)
            if data and abs(data['changePct']) < 50:  # Filter out anomalies
                stocks_data.append(data)
        except Exception as e:
            # Silently skip failed tickers
            pass
    
    # Need at least some stocks to show
    if len(stocks_data) < limit * 2:
        return [], []
    
    # Sort by change percentage
    stocks_data.sort(key=lambda x: x['changePct'], reverse=True)
    
    gainers = stocks_data[:limit]
    losers = stocks_data[-limit:]
    losers.reverse()  # Show worst performer first
    
    return gainers, losers


def get_historical_data(ticker: str, period: str = '1mo', interval: str = '1d') -> List[Dict[str, Any]]:
    """
    Fetch historical OHLC data for charting
    
    Args:
        ticker: Yahoo Finance ticker symbol
        period: Data period (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
        interval: Data interval (1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo)
    """
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period, interval=interval)
        
        data = []
        for index, row in hist.iterrows():
            data.append({
                'date': index.strftime('%Y-%m-%d'),
                'timestamp': int(index.timestamp() * 1000),
                'open': round(row['Open'], 2),
                'high': round(row['High'], 2),
                'low': round(row['Low'], 2),
                'close': round(row['Close'], 2),
                'volume': int(row['Volume'])
            })
        
        return data
    except Exception as e:
        print(f"Error fetching historical data for {ticker}: {e}")
        return []


def get_intraday_data(ticker: str) -> List[Dict[str, Any]]:
    """
    Fetch intraday data (1 day, 5-minute intervals)
    """
    return get_historical_data(ticker, period='1d', interval='5m')


def get_market_overview() -> Dict[str, Any]:
    """
    Get complete market overview including indices, gainers, and losers
    """
    try:
        indices = get_all_indices()
        gainers, losers = get_top_gainers_losers(limit=5)
        
        return {
            'success': True,
            'indices': indices,
            'topGainers': gainers,
            'topLosers': losers,
            'lastUpdated': datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error in get_market_overview: {e}")
        return {
            'success': False,
            'error': str(e)
        }


def get_stock_info(ticker: str) -> Dict[str, Any]:
    """
    Get detailed information about a specific stock
    """
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        
        return {
            'success': True,
            'symbol': info.get('symbol', ticker),
            'name': info.get('longName', ''),
            'sector': info.get('sector', ''),
            'industry': info.get('industry', ''),
            'marketCap': info.get('marketCap', 0),
            'currentPrice': info.get('currentPrice', 0),
            'dayHigh': info.get('dayHigh', 0),
            'dayLow': info.get('dayLow', 0),
            'fiftyTwoWeekHigh': info.get('fiftyTwoWeekHigh', 0),
            'fiftyTwoWeekLow': info.get('fiftyTwoWeekLow', 0),
            'volume': info.get('volume', 0),
            'avgVolume': info.get('averageVolume', 0),
            'pe': info.get('trailingPE', 0),
            'eps': info.get('trailingEps', 0),
            'dividendYield': info.get('dividendYield', 0) * 100 if info.get('dividendYield') else 0
        }
    except Exception as e:
        print(f"Error fetching stock info for {ticker}: {e}")
        return {
            'success': False,
            'error': str(e)
        }
