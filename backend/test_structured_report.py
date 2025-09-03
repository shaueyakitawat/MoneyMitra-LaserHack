"""
Test the new structured financial report route
"""

import requests
import json
from datetime import datetime

def test_structured_report(symbol="AAPL", benchmark="^GSPC"):
    """Test the new /generate_report endpoint"""
    url = "http://localhost:5000/generate_report"
    
    payload = {
        "symbol": symbol,
        "benchmark": benchmark
    }
    
    try:
        print(f"🧪 Testing Structured Financial Report for {symbol}")
        print(f"📅 Request Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*60)
        
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            data = response.json()
            
            # Display Executive Summary
            print("📊 EXECUTIVE SUMMARY")
            print("-" * 30)
            exec_summary = data["executive_summary"]
            print(f"Company: {exec_summary['company_name']}")
            print(f"Sector: {exec_summary['sector']}")
            print(f"Current Price: ${exec_summary['current_price']:.2f} {exec_summary['currency']}")
            print(f"Market Cap: ${exec_summary['market_cap']:,}" if isinstance(exec_summary['market_cap'], int) else f"Market Cap: {exec_summary['market_cap']}")
            print(f"Overall Rating: {exec_summary['overall_rating']}")
            print(f"Risk Level: {exec_summary['investment_grade']}")
            print(f"Suitable For: {exec_summary['suitable_for']}")
            
            # Display Performance Analysis
            print(f"\n📈 PERFORMANCE ANALYSIS")
            print("-" * 30)
            perf = data["performance_analysis"]
            print(f"CAGR: {perf['returns']['cagr']['percentage']} ({perf['returns']['cagr']['interpretation']})")
            print(f"Volatility: {perf['risk_metrics']['volatility']['percentage']} ({perf['risk_metrics']['volatility']['risk_level']})")
            print(f"Sharpe Ratio: {perf['risk_metrics']['sharpe_ratio']['value']:.2f} ({perf['risk_metrics']['sharpe_ratio']['rating']})")
            print(f"Beta: {perf['risk_metrics']['beta']['value']:.2f} ({perf['risk_metrics']['beta']['market_sensitivity']})")
            print(f"Max Drawdown: {perf['risk_metrics']['maximum_drawdown']['percentage']} ({perf['risk_metrics']['maximum_drawdown']['severity']})")
            
            # Display Advanced Analysis
            print(f"\n🎯 ADVANCED ANALYSIS")
            print("-" * 30)
            advanced = data["advanced_analysis"]
            print(f"CAPM Expected Return: {advanced['capm_model']['expected_return_percentage']}")
            print(f"Monte Carlo - Most Likely: {advanced['monte_carlo_simulation']['projected_scenarios']['most_likely_outcome']:.2f}x")
            print(f"Monte Carlo - Worst Case (5%): {advanced['monte_carlo_simulation']['projected_scenarios']['worst_case_5th_percentile']:.2f}x")
            print(f"Monte Carlo - Best Case (95%): {advanced['monte_carlo_simulation']['projected_scenarios']['best_case_95th_percentile']:.2f}x")
            print(f"Positive Return Probability: {advanced['monte_carlo_simulation']['probability_analysis']['positive_return_probability']}")
            
            # Display Investment Recommendation
            print(f"\n💡 INVESTMENT RECOMMENDATION")
            print("-" * 30)
            recommendation = data["investment_recommendation"]
            print(f"Recommendation: {recommendation['recommendation']}")
            print(f"Risk Assessment: {recommendation['risk_assessment']['overall_risk']}")
            
            print(f"\n🔍 Key Insights:")
            for insight in recommendation['key_insights']:
                print(f"  • {insight}")
            
            print(f"\n🎯 Action Points:")
            for action in recommendation['action_points']:
                print(f"  • {action}")
            
            # Display Risk Factors
            print(f"\n⚠️ Risk Factors:")
            for risk in recommendation['risk_assessment']['key_risk_factors']:
                print(f"  • {risk}")
            
            print(f"\n📚 Educational Content Available:")
            education = data["educational_content"]
            print(f"  • {len(education['key_concepts'])} Key Financial Concepts Explained")
            print(f"  • {len(education['learning_resources']['beginner_concepts'])} Beginner Topics")
            print(f"  • {len(education['learning_resources']['advanced_concepts'])} Advanced Topics")
            
            print(f"\n📋 Technical Details:")
            tech = data["technical_details"]
            print(f"  • Data Source: {tech['data_source']}")
            print(f"  • Analysis Method: {tech['analysis_methodology']}")
            print(f"  • Data Points: {tech['data_points_analyzed']}")
            print(f"  • Benchmark: {tech['benchmark_index']}")
            
            print(f"\n✅ Report Generated Successfully!")
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

def save_report_to_file(report_data, filename="financial_report.json"):
    """Save the report to a JSON file"""
    if report_data:
        with open(filename, 'w') as f:
            json.dump(report_data, f, indent=2)
        print(f"\n💾 Report saved to {filename}")

if __name__ == "__main__":
    print("🚀 Testing Structured Financial Report API")
    print("="*60)
    
    # Test with Apple
    report = test_structured_report("AAPL", "^GSPC")
    
    if report:
        save_report_to_file(report, "apple_financial_report.json")
        
        print(f"\n🎯 Try testing with other stocks:")
        print("  • Microsoft: MSFT")
        print("  • Google: GOOGL") 
        print("  • Tesla: TSLA")
        print("  • Indian stocks: RELIANCE.NS, TCS.NS")
    
    print(f"\n📝 API Endpoint: POST /generate_report")
    print('📤 Payload: {"symbol": "AAPL", "benchmark": "^GSPC"}')
