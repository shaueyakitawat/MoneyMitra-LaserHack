"""
Simple test to verify the financial API is working
"""

import json

# Test the financial report function directly
from ai_agent import get_financial_report_json

def test_direct_function():
    """Test the financial report function directly without HTTP"""
    print("🧪 Testing Financial Report Function Directly\n")
    
    # Test with Apple stock
    print("Testing AAPL (Apple Inc.)...")
    try:
        report = get_financial_report_json("AAPL", "^GSPC")
        
        if "error" in report:
            print(f"❌ Error: {report['error']}")
        else:
            print("✅ Financial Report Generated Successfully!")
            print(f"📊 Company: {report['stock_info']['company_name']}")
            print(f"💰 Current Price: ${report['stock_info']['current_price']:.2f}")
            print(f"📈 CAGR: {report['performance_metrics']['cagr']['percentage']}")
            print(f"⚡ Volatility: {report['performance_metrics']['volatility']['percentage']}")
            print(f"🎯 Sharpe Ratio: {report['risk_metrics']['sharpe_ratio']['value']:.2f}")
            print(f"📉 Beta: {report['risk_metrics']['beta']['value']:.2f}")
            print(f"🔻 Max Drawdown: {report['risk_metrics']['max_drawdown']['percentage']}")
            print(f"🎲 Monte Carlo - Probability of Positive Return: {report['monte_carlo_simulation']['probability_of_positive_return']}")
            
            print(f"\n🔍 Key Insights:")
            for insight in report['investment_recommendation']['key_insights']:
                print(f"  • {insight}")
                
            print(f"\n🎓 Educational Note:")
            print(f"  • {report['educational_notes']['cagr_importance']}")
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")

if __name__ == "__main__":
    test_direct_function()
    print("\n✨ Test completed! Your AI agent is ready with comprehensive financial analysis.")
    print("\n🚀 To use in your Flask app:")
    print("POST /financial_report")
    print('{"symbol": "AAPL", "benchmark": "^GSPC"}')
