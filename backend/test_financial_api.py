"""
Test script for the Financial Analysis API
This demonstrates how to use the new financial report endpoints
"""

import requests
import json

# API base URL
BASE_URL = "http://localhost:5000"

def test_financial_report(symbol="AAPL", benchmark="^GSPC"):
    """Test the comprehensive financial report endpoint"""
    url = f"{BASE_URL}/financial_report"
    
    payload = {
        "symbol": symbol,
        "benchmark": benchmark
    }
    
    try:
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Financial Report for {symbol}:")
            print(json.dumps(data, indent=2))
            return data
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.json())
            return None
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the Flask server is running on localhost:5000")
        return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def test_stock_data(symbol="AAPL"):
    """Test the basic stock data endpoint"""
    url = f"{BASE_URL}/stock_data"
    
    payload = {
        "symbol": symbol
    }
    
    try:
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Stock Data for {symbol}:")
            print(json.dumps(data, indent=2))
            return data
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.json())
            return None
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the Flask server is running on localhost:5000")
        return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

def test_health_check():
    """Test the health check endpoint"""
    url = f"{BASE_URL}/health"
    
    try:
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Health Check:")
            print(json.dumps(data, indent=2))
            return data
        else:
            print(f"❌ Error: {response.status_code}")
            return None
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the Flask server is running on localhost:5000")
        return None
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return None

if __name__ == "__main__":
    print("🧪 Testing Financial Analysis API\n")
    
    # Test health check
    print("1. Testing Health Check...")
    test_health_check()
    print("\n" + "="*50 + "\n")
    
    # Test basic stock data
    print("2. Testing Basic Stock Data...")
    test_stock_data("AAPL")
    print("\n" + "="*50 + "\n")
    
    # Test comprehensive financial report
    print("3. Testing Comprehensive Financial Report...")
    test_financial_report("AAPL", "^GSPC")
    
    print("\n🎯 API Testing Complete!")
    print("\nTo test with different stocks, try:")
    print("- US Stocks: AAPL, MSFT, GOOGL, TSLA")
    print("- Indian Stocks: RELIANCE.NS, TCS.NS, INFY.NS")
    print("- Benchmarks: ^GSPC (S&P 500), ^NSEI (Nifty 50)")
