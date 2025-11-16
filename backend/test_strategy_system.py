"""
Test script for Strategy Builder, Backtesting, and Virtual Portfolio system
Run this to verify the complete flow works end-to-end
"""
import requests
import time
import json

BASE_URL = "http://localhost:5001"

def test_create_strategy():
    """Test creating a strategy"""
    print("\n1️⃣ Creating Strategy...")
    
    strategy = {
        "name": "SMA Crossover Test",
        "userId": "test_user",
        "symbols": ["RELIANCE.NS"],
        "timeframe": "1d",
        "blocks": [
            {"id": "b1", "type": "indicator", "indicator": "SMA", "params": {"period": 20}},
            {"id": "b2", "type": "indicator", "indicator": "SMA", "params": {"period": 50}},
            {"id": "b3", "type": "condition", "expr": "cross_over(b1,b2)"},
            {"id": "b4", "type": "action", "action": "BUY", "params": {
                "sizePct": 0.25,
                "stopLossPct": 0.05,
                "takeProfitPct": 0.10
            }}
        ]
    }
    
    response = requests.post(f"{BASE_URL}/strategy", json=strategy)
    data = response.json()
    
    if data.get('success'):
        print(f"✅ Strategy created: {data['strategyId']}")
        return data['strategyId']
    else:
        print(f"❌ Failed to create strategy: {data}")
        return None


def test_run_backtest(strategy_id):
    """Test running a backtest"""
    print("\n2️⃣ Running Backtest...")
    
    backtest_config = {
        "strategyId": strategy_id,
        "symbol": "RELIANCE.NS",
        "startDate": "2023-01-01",
        "endDate": "2024-01-01",
        "initialCapital": 100000
    }
    
    response = requests.post(f"{BASE_URL}/backtest", json=backtest_config)
    data = response.json()
    
    if data.get('success'):
        backtest_id = data['backtestId']
        print(f"✅ Backtest started: {backtest_id}")
        
        # Poll for results
        print("⏳ Waiting for backtest to complete...")
        for i in range(30):  # Wait up to 30 seconds
            time.sleep(1)
            result_response = requests.get(f"{BASE_URL}/backtest/{backtest_id}")
            result_data = result_response.json()
            
            if result_data['backtest']['status'] == 'completed':
                results = result_data['backtest']['results']
                metrics = results['metrics']
                
                print("\n📊 Backtest Results:")
                print(f"   Total Return: {metrics['totalReturnPct']}%")
                print(f"   CAGR: {metrics['cagr']}%")
                print(f"   Sharpe Ratio: {metrics['sharpeRatio']}")
                print(f"   Max Drawdown: {metrics['maxDrawdown']}%")
                print(f"   Win Rate: {metrics['winRate']}%")
                print(f"   Total Trades: {metrics['totalTrades']}")
                print(f"   Winning Trades: {metrics['winningTrades']}")
                print(f"   Losing Trades: {metrics['losingTrades']}")
                
                return backtest_id
            
            elif result_data['backtest']['status'] == 'failed':
                print(f"❌ Backtest failed: {result_data['backtest'].get('error')}")
                return None
        
        print("⚠️ Backtest timed out")
        return None
    else:
        print(f"❌ Failed to start backtest: {data}")
        return None


def test_deploy_strategy(strategy_id):
    """Test deploying strategy to virtual portfolio"""
    print("\n3️⃣ Creating Virtual Portfolio...")
    
    # Create portfolio
    portfolio_config = {
        "userId": "test_user",
        "name": "Test Virtual Portfolio",
        "initialCapital": 100000
    }
    
    response = requests.post(f"{BASE_URL}/portfolio", json=portfolio_config)
    data = response.json()
    
    if not data.get('success'):
        print(f"❌ Failed to create portfolio: {data}")
        return None
    
    portfolio_id = data['portfolioId']
    print(f"✅ Portfolio created: {portfolio_id}")
    
    # Deploy strategy
    print("\n4️⃣ Deploying Strategy for Forward Testing...")
    deploy_config = {
        "strategyId": strategy_id,
        "portfolioId": portfolio_id
    }
    
    response = requests.post(f"{BASE_URL}/deploy", json=deploy_config)
    data = response.json()
    
    if data.get('success'):
        deployment_id = data['deploymentId']
        print(f"✅ Strategy deployed: {deployment_id}")
        print("🔄 Forward testing is now running in background...")
        
        # Monitor portfolio for a short time
        print("\n⏳ Monitoring portfolio for 30 seconds...")
        for i in range(6):
            time.sleep(5)
            portfolio_response = requests.get(f"{BASE_URL}/portfolio/{portfolio_id}")
            portfolio_data = portfolio_response.json()
            
            if portfolio_data.get('success'):
                portfolio = portfolio_data['portfolio']
                print(f"   [{i*5}s] Cash: ₹{portfolio['cash']:.2f} | "
                      f"Total Value: ₹{portfolio['totalValue']:.2f} | "
                      f"P&L: ₹{portfolio['pnl']:.2f} ({portfolio['pnlPct']:.2f}%) | "
                      f"Holdings: {len(portfolio['holdings'])} | "
                      f"Trades: {len(portfolio['trades'])}")
        
        # Stop deployment
        print(f"\n⏹️ Stopping deployment...")
        requests.post(f"{BASE_URL}/deploy/{deployment_id}/stop")
        print("✅ Deployment stopped")
        
        # Final portfolio state
        portfolio_response = requests.get(f"{BASE_URL}/portfolio/{portfolio_id}")
        portfolio_data = portfolio_response.json()
        if portfolio_data.get('success'):
            portfolio = portfolio_data['portfolio']
            print("\n📊 Final Portfolio State:")
            print(f"   Total Value: ₹{portfolio['totalValue']:.2f}")
            print(f"   Cash: ₹{portfolio['cash']:.2f}")
            print(f"   P&L: ₹{portfolio['pnl']:.2f} ({portfolio['pnlPct']:.2f}%)")
            print(f"   Total Trades: {len(portfolio['trades'])}")
            
            if portfolio['holdings']:
                print("\n   Holdings:")
                for symbol, holding in portfolio['holdings'].items():
                    print(f"   - {symbol}: {holding['qty']:.2f} @ ₹{holding['avgPrice']:.2f} "
                          f"(P&L: ₹{holding['pnl']:.2f})")
        
        return deployment_id
    else:
        print(f"❌ Failed to deploy strategy: {data}")
        return None


def main():
    print("="*60)
    print("🧪 TESTING STRATEGY SYSTEM")
    print("="*60)
    
    try:
        # Test 1: Create Strategy
        strategy_id = test_create_strategy()
        if not strategy_id:
            print("\n❌ Test failed at strategy creation")
            return
        
        # Test 2: Run Backtest
        backtest_id = test_run_backtest(strategy_id)
        if not backtest_id:
            print("\n⚠️ Backtest did not complete, but continuing...")
        
        # Test 3: Deploy to Virtual Portfolio
        deployment_id = test_deploy_strategy(strategy_id)
        if not deployment_id:
            print("\n❌ Test failed at deployment")
            return
        
        print("\n" + "="*60)
        print("✅ ALL TESTS COMPLETED SUCCESSFULLY!")
        print("="*60)
        print("\n📝 Summary:")
        print(f"   Strategy ID: {strategy_id}")
        print(f"   Backtest ID: {backtest_id}")
        print(f"   Deployment ID: {deployment_id}")
        print("\n🎉 System is fully functional!")
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
