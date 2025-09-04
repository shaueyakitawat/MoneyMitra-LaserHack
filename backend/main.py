from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_agent import get_agent_response, get_financial_report_json

app = Flask(__name__)

# Configure CORS properly - allow both React dev servers
CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5174", "http://127.0.0.1:5174"], 
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

# Add a preflight handler for all origins during development
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response 

@app.route('/get_response', methods=['POST'])
def get_response():
    """Original chat endpoint"""
    try:
        data = request.get_json()
        query = data.get('query')
        
        if not query:
            return jsonify({"error": "Query is required"}), 400
            
        response = get_agent_response(query)
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/financial_report', methods=['POST'])
def financial_report():
    """
    Generate comprehensive financial analysis report for a stock symbol
    Expected JSON payload: {"symbol": "AAPL", "benchmark": "^GSPC"} (benchmark is optional)
    """
    try:
        data = request.get_json()
        symbol = data.get('symbol')
        benchmark = data.get('benchmark', '^GSPC')  # Default to S&P 500
        
        if not symbol:
            return jsonify({"error": "Stock symbol is required"}), 400
        
        # Generate comprehensive financial report
        report = get_financial_report_json(symbol.upper(), benchmark)
        
        if "error" in report:
            return jsonify(report), 400
            
        return jsonify({
            "success": True,
            "symbol": symbol.upper(),
            "report": report
        })
        
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/stock_data', methods=['POST'])
def get_stock_data_endpoint():
    """
    Get basic stock data for a symbol
    Expected JSON payload: {"symbol": "AAPL"}
    """
    try:
        data = request.get_json()
        symbol = data.get('symbol')
        
        if not symbol:
            return jsonify({"error": "Stock symbol is required"}), 400
        
        # Import the tool function
        from ai_agent import get_stock_data
        stock_data_str = get_stock_data.invoke({"symbol": symbol.upper()})
        stock_data = eval(stock_data_str)  # Convert string back to dict
        
        if "error" in stock_data:
            return jsonify(stock_data), 400
            
        return jsonify({
            "success": True,
            "data": stock_data
        })
        
    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500

@app.route('/generate_report', methods=['POST', 'OPTIONS'])
def generate_comprehensive_report():
    """
    Generate a comprehensive financial analysis report in proper JSON format
    Expected JSON payload: {"symbol": "AAPL", "benchmark": "^GSPC"}
    Returns: Structured financial report with all key metrics
    """
    # Handle preflight request
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    try:
        print(f"Received request: {request.method} {request.url}")
        print(f"Request headers: {dict(request.headers)}")
        
        data = request.get_json()
        print(f"Request data: {data}")
        
        symbol = data.get('symbol')
        benchmark = data.get('benchmark', '^GSPC')
        
        if not symbol:
            return jsonify({
                "success": False,
                "error": "Stock symbol is required",
                "code": "MISSING_SYMBOL"
            }), 400
        
        print(f"Processing report for symbol: {symbol}, benchmark: {benchmark}")
        
        # Generate comprehensive financial report
        report_data = get_financial_report_json(symbol.upper(), benchmark)
        
        if "error" in report_data:
            return jsonify({
                "success": False,
                "error": report_data["error"],
                "code": "ANALYSIS_ERROR"
            }), 400
        
        # Structure the response as a proper financial report
        financial_report = {
            "success": True,
            "generated_at": "2025-09-04T00:00:00Z",
            "report_type": "Comprehensive Financial Analysis",
            "analysis_period": report_data.get("analysis_period", "2 Years"),
            "stock_symbol": symbol.upper(),
            "benchmark": benchmark,
            
            # Executive Summary
            "executive_summary": {
                "company_name": report_data["stock_info"]["company_name"],
                "sector": report_data["stock_info"]["sector"],
                "current_price": report_data["stock_info"]["current_price"],
                "currency": report_data["stock_info"]["currency"],
                "market_cap": report_data["stock_info"]["market_cap"],
                "investment_grade": report_data["investment_recommendation"]["risk_level"],
                "suitable_for": report_data["investment_recommendation"]["suitable_for"],
                "overall_rating": _calculate_overall_rating(report_data)
            },
            
            # Performance Analysis
            "performance_analysis": {
                "returns": {
                    "cagr": {
                        "value": report_data["performance_metrics"]["cagr"]["value"],
                        "percentage": report_data["performance_metrics"]["cagr"]["percentage"],
                        "interpretation": _interpret_cagr(report_data["performance_metrics"]["cagr"]["value"]),
                        "explanation": report_data["performance_metrics"]["cagr"]["explanation"]
                    }
                },
                "risk_metrics": {
                    "volatility": {
                        "value": report_data["performance_metrics"]["volatility"]["value"],
                        "percentage": report_data["performance_metrics"]["volatility"]["percentage"],
                        "risk_level": _interpret_volatility(report_data["performance_metrics"]["volatility"]["value"]),
                        "explanation": report_data["performance_metrics"]["volatility"]["explanation"]
                    },
                    "sharpe_ratio": {
                        "value": report_data["risk_metrics"]["sharpe_ratio"]["value"],
                        "rating": report_data["risk_metrics"]["sharpe_ratio"]["interpretation"],
                        "explanation": report_data["risk_metrics"]["sharpe_ratio"]["explanation"]
                    },
                    "beta": {
                        "value": report_data["risk_metrics"]["beta"]["value"],
                        "market_sensitivity": report_data["risk_metrics"]["beta"]["interpretation"],
                        "explanation": report_data["risk_metrics"]["beta"]["explanation"]
                    },
                    "maximum_drawdown": {
                        "value": report_data["risk_metrics"]["max_drawdown"]["value"],
                        "percentage": report_data["risk_metrics"]["max_drawdown"]["percentage"],
                        "peak_date": report_data["risk_metrics"]["max_drawdown"]["peak_date"],
                        "trough_date": report_data["risk_metrics"]["max_drawdown"]["trough_date"],
                        "severity": _interpret_drawdown(report_data["risk_metrics"]["max_drawdown"]["value"]),
                        "explanation": report_data["risk_metrics"]["max_drawdown"]["explanation"]
                    }
                }
            },
            
            # Advanced Analysis
            "advanced_analysis": {
                "capm_model": {
                    "expected_return": report_data["capm_analysis"]["expected_return"],
                    "expected_return_percentage": report_data["capm_analysis"]["expected_return_percentage"],
                    "market_return": report_data["capm_analysis"]["market_return"],
                    "risk_free_rate": report_data["capm_analysis"]["risk_free_rate"],
                    "explanation": report_data["capm_analysis"]["explanation"]
                },
                "monte_carlo_simulation": {
                    "projected_scenarios": {
                        "most_likely_outcome": report_data["monte_carlo_simulation"]["mean_projected_return"],
                        "worst_case_5th_percentile": report_data["monte_carlo_simulation"]["downside_risk_5th_percentile"],
                        "best_case_95th_percentile": report_data["monte_carlo_simulation"]["upside_potential_95th_percentile"]
                    },
                    "probability_analysis": {
                        "positive_return_probability": report_data["monte_carlo_simulation"]["probability_of_positive_return"],
                        "simulations_run": report_data["monte_carlo_simulation"]["simulations_run"]
                    },
                    "explanation": report_data["monte_carlo_simulation"]["explanation"]
                }
            },
            
            # Investment Recommendation
            "investment_recommendation": {
                "recommendation": _generate_recommendation(report_data),
                "risk_assessment": {
                    "overall_risk": report_data["investment_recommendation"]["risk_level"],
                    "investor_profile": report_data["investment_recommendation"]["suitable_for"],
                    "key_risk_factors": _extract_risk_factors(report_data)
                },
                "key_insights": report_data["investment_recommendation"]["key_insights"],
                "action_points": _generate_action_points(report_data)
            },
            
            # Educational Content
            "educational_content": {
                "key_concepts": {
                    "cagr": report_data["educational_notes"]["cagr_importance"],
                    "volatility": report_data["educational_notes"]["volatility_education"],
                    "sharpe_ratio": report_data["educational_notes"]["sharpe_ratio_significance"],
                    "beta_capm": report_data["educational_notes"]["beta_capm_relevance"],
                    "drawdown": report_data["educational_notes"]["drawdown_protection"],
                    "monte_carlo": report_data["educational_notes"]["monte_carlo_value"]
                },
                "learning_resources": {
                    "beginner_concepts": [
                        "Understanding CAGR for long-term investment planning",
                        "Risk vs Return relationship through volatility",
                        "Market sensitivity analysis using Beta"
                    ],
                    "advanced_concepts": [
                        "Risk-adjusted performance evaluation",
                        "Portfolio optimization using modern portfolio theory",
                        "Scenario analysis through Monte Carlo simulations"
                    ]
                }
            },
            
            # Technical Details
            "technical_details": {
                "data_source": "Yahoo Finance",
                "analysis_methodology": "Modern Portfolio Theory & CAPM",
                "data_points_analyzed": report_data.get("data_points_analyzed", "500+"),
                "benchmark_index": benchmark,
                "risk_free_rate_assumed": "2.0%",
                "confidence_interval": "95%"
            }
        }
        
        return jsonify(financial_report)
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": f"Internal server error: {str(e)}",
            "code": "INTERNAL_ERROR"
        }), 500

def _calculate_overall_rating(report_data):
    """Calculate overall investment rating based on key metrics"""
    cagr = report_data["performance_metrics"]["cagr"]["value"]
    sharpe = report_data["risk_metrics"]["sharpe_ratio"]["value"]
    volatility = report_data["performance_metrics"]["volatility"]["value"]
    
    score = 0
    if cagr > 0.15: score += 2
    elif cagr > 0.08: score += 1
    
    if sharpe > 1.5: score += 2
    elif sharpe > 0.8: score += 1
    
    if volatility < 0.2: score += 1
    elif volatility > 0.4: score -= 1
    
    if score >= 4: return "Excellent"
    elif score >= 2: return "Good"
    elif score >= 0: return "Fair"
    else: return "Poor"

def _interpret_cagr(cagr):
    """Interpret CAGR value"""
    if cagr > 0.20: return "Exceptional Growth"
    elif cagr > 0.15: return "Strong Growth"
    elif cagr > 0.08: return "Moderate Growth"
    elif cagr > 0: return "Weak Growth"
    else: return "Negative Growth"

def _interpret_volatility(volatility):
    """Interpret volatility value"""
    if volatility > 0.4: return "Very High Risk"
    elif volatility > 0.3: return "High Risk"
    elif volatility > 0.2: return "Moderate Risk"
    else: return "Low Risk"

def _interpret_drawdown(drawdown):
    """Interpret maximum drawdown"""
    drawdown = abs(drawdown)
    if drawdown > 0.5: return "Extreme"
    elif drawdown > 0.3: return "Severe"
    elif drawdown > 0.2: return "Moderate"
    else: return "Mild"

def _generate_recommendation(report_data):
    """Generate investment recommendation"""
    cagr = report_data["performance_metrics"]["cagr"]["value"]
    sharpe = report_data["risk_metrics"]["sharpe_ratio"]["value"]
    beta = report_data["risk_metrics"]["beta"]["value"]
    
    if cagr > 0.15 and sharpe > 1.2:
        return "Strong Buy - Excellent risk-adjusted returns"
    elif cagr > 0.08 and sharpe > 0.8:
        return "Buy - Good growth potential with acceptable risk"
    elif cagr > 0 and sharpe > 0.5:
        return "Hold - Moderate performance, suitable for balanced portfolios"
    else:
        return "Caution - Consider other alternatives or wait for better entry"

def _extract_risk_factors(report_data):
    """Extract key risk factors"""
    factors = []
    
    volatility = report_data["performance_metrics"]["volatility"]["value"]
    beta = report_data["risk_metrics"]["beta"]["value"]
    drawdown = abs(report_data["risk_metrics"]["max_drawdown"]["value"])
    
    if volatility > 0.3:
        factors.append("High price volatility")
    if beta > 1.3:
        factors.append("Highly sensitive to market movements")
    if drawdown > 0.3:
        factors.append("Significant historical drawdowns")
    
    return factors if factors else ["Low to moderate risk profile"]

def _generate_action_points(report_data):
    """Generate actionable investment points"""
    actions = []
    
    cagr = report_data["performance_metrics"]["cagr"]["value"]
    sharpe = report_data["risk_metrics"]["sharpe_ratio"]["value"]
    volatility = report_data["performance_metrics"]["volatility"]["value"]
    
    if cagr > 0.15:
        actions.append("Consider increasing position size due to strong growth")
    if sharpe < 0.5:
        actions.append("Monitor risk-adjusted performance closely")
    if volatility > 0.3:
        actions.append("Consider dollar-cost averaging to reduce timing risk")
    
    actions.append("Regular portfolio rebalancing recommended")
    actions.append("Monitor quarterly earnings and sector trends")
    
    return actions

@app.route('/test', methods=['GET', 'POST', 'OPTIONS'])
def test_endpoint():
    """Simple test endpoint to verify connectivity"""
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    return jsonify({
        "success": True,
        "message": "Backend is working!",
        "method": request.method,
        "timestamp": "2025-09-04"
    })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Financial AI Agent API is running"})

if __name__ == "__main__":
    print("🚀 Starting JainVest Financial Analysis API...")
    print("🌐 Server will be available at: http://localhost:5000")
    print("🔧 Debug mode: ON")
    print("📊 Available endpoints:")
    print("  - GET  /health")
    print("  - GET  /test") 
    print("  - POST /generate_report")
    print("  - POST /financial_report")
    print("  - POST /stock_data")
    print("  - POST /get_response")
    app.run(debug=True, host='0.0.0.0', port=5000)