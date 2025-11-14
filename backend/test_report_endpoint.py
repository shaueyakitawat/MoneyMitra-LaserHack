#!/usr/bin/env python3
"""
Simple test script to verify the financial report endpoint works
"""

import requests
import json

def test_generate_report():
    url = "http://localhost:5000/generate_report"
    payload = {
        "symbol": "AAPL",
        "benchmark": "^GSPC"
    }
    
    print("🧪 Testing financial report generation...")
    print(f"📤 Sending request to: {url}")
    print(f"📊 Payload: {json.dumps(payload, indent=2)}")
    print("-" * 60)
    
    try:
        response = requests.post(url, json=payload, timeout=60)
        
        print(f"✅ Status Code: {response.status_code}")
        print(f"📥 Response Headers: {dict(response.headers)}")
        print("-" * 60)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SUCCESS! Report generated successfully")
            print(f"📊 Report Keys: {list(data.keys())}")
            
            if data.get('success'):
                print(f"💼 Company: {data['executive_summary']['company_name']}")
                print(f"💰 Current Price: ${data['executive_summary']['current_price']}")
                print(f"⭐ Overall Rating: {data['executive_summary']['overall_rating']}")
                print(f"📈 CAGR: {data['performance_analysis']['returns']['cagr']['percentage']}")
            else:
                print(f"❌ Error in response: {data.get('error')}")
        else:
            print(f"❌ ERROR: {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to backend server")
        print("Make sure the Flask server is running on http://localhost:5000")
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_generate_report()
