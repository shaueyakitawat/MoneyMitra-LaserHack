#!/usr/bin/env python3
"""
Test script for algo builder backtest integration
"""

from algo_backtest import backtest_strategy, get_indian_stocks
import json

def test_get_stocks():
    """Test getting Indian stocks"""
    print("Testing get_indian_stocks()...")
    stocks = get_indian_stocks()
    print(f"✅ Found {len(stocks)} stocks")
    print(f"   First stock: {stocks[0]}")
    print()

def test_simple_rsi_strategy():
    """Test a simple RSI oversold strategy"""
    print("Testing RSI oversold strategy (RSI < 30)...")
    
    strategy_blocks = [
        {
            "type": "indicator",
            "id": "rsi",
            "params": {"period": 14}
        },
        {
            "type": "condition",
            "id": "threshold",
            "params": {
                "indicator": "rsi",
                "operator": "<",
                "value": 30
            }
        },
        {
            "type": "action",
            "id": "buy",
            "params": {
                "quantity": "percentage",
                "value": 20
            }
        }
    ]
    
    result = backtest_strategy(
        symbol="RELIANCE.NS",
        strategy_blocks=strategy_blocks,
        start_date="2024-01-01",
        end_date="2024-11-14",
        initial_capital=100000
    )
    
    if result['success']:
        print("✅ Backtest successful!")
        print(f"   Symbol: {result['symbol']}")
        print(f"   Period: {result['period']}")
        print(f"   Initial: ₹{result['initial_capital']:,.2f}")
        print(f"   Final: ₹{result['final_equity']:,.2f}")
        print(f"   Return: {result['metrics']['total_return']:.2f}%")
        print(f"   Trades: {result['metrics']['total_trades']}")
        print(f"   Win Rate: {result['metrics']['win_rate']:.2f}%")
        print(f"   Sharpe: {result['metrics']['sharpe_ratio']:.2f}")
    else:
        print(f"❌ Backtest failed: {result['error']}")
    print()

def test_sma_crossover():
    """Test SMA crossover strategy"""
    print("Testing SMA crossover strategy (Price crosses above SMA20)...")
    
    strategy_blocks = [
        {
            "type": "indicator",
            "id": "sma",
            "params": {"period": 20}
        },
        {
            "type": "condition",
            "id": "crossover",
            "params": {
                "indicator1": "price",
                "indicator2": "sma",
                "direction": "above"
            }
        },
        {
            "type": "action",
            "id": "buy",
            "params": {
                "quantity": "percentage",
                "value": 25
            }
        }
    ]
    
    result = backtest_strategy(
        symbol="TCS.NS",
        strategy_blocks=strategy_blocks,
        start_date="2024-06-01",
        end_date="2024-11-14",
        initial_capital=100000
    )
    
    if result['success']:
        print("✅ Backtest successful!")
        print(f"   Symbol: {result['symbol']}")
        print(f"   Return: {result['metrics']['total_return']:.2f}%")
        print(f"   Trades: {result['metrics']['total_trades']}")
        print(f"   Max Drawdown: {result['metrics']['max_drawdown']:.2f}%")
    else:
        print(f"❌ Backtest failed: {result['error']}")
    print()

if __name__ == "__main__":
    print("=" * 60)
    print("ALGO BUILDER BACKTEST TESTS")
    print("=" * 60)
    print()
    
    test_get_stocks()
    test_simple_rsi_strategy()
    test_sma_crossover()
    
    print("=" * 60)
    print("All tests completed!")
    print("=" * 60)
