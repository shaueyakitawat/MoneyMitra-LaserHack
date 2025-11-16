from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_agent import get_agent_response, get_financial_report_json
from content_aggregator import get_aggregated_content, LANGUAGES
from risk_assessment import (
    get_risk_questions, calculate_risk_score, analyze_portfolio_risk,
    suggest_asset_allocation, get_risk_profiles, calculate_corpus_investment_plan
)
from algo_backtest import backtest_strategy, get_indian_stocks
from market_data import (
    get_market_overview, get_historical_data, get_intraday_data,
    get_stock_info, INDIAN_INDICES
)

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
            response = jsonify({"error": "Query is required"})
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response, 400
        
        print(f"Received query: {query[:100]}...")  # Debug log
        response_text = get_agent_response(query)
        print(f"Response generated successfully")  # Debug log
        response = jsonify({"response": response_text})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
    except Exception as e:
        print(f"Error in get_response: {str(e)}")  # Debug log
        import traceback
        traceback.print_exc()
        response = jsonify({"error": str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500

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
        try:
            report_data = get_financial_report_json(symbol.upper(), benchmark)
        except Exception as report_error:
            print(f"Error generating report: {str(report_error)}")
            import traceback
            traceback.print_exc()
            return jsonify({
                "success": False,
                "error": f"Failed to generate report: {str(report_error)}",
                "code": "ANALYSIS_ERROR"
            }), 500
        
        if "error" in report_data:
            print(f"Report contains error: {report_data['error']}")
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
        
        print(f"✅ Successfully generated report for {symbol}")
        return jsonify(financial_report)
        
    except Exception as e:
        print(f"❌ Exception in generate_report endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
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

@app.route('/sebi_content', methods=['GET', 'POST', 'OPTIONS'])
def sebi_content():
    """
    Get latest Indian financial news with AI-powered actionable analysis
    Query params: 
    - language (en, hi, mr, gu, ta, te, bn, kn, ml)
    - summary (true/false)
    - ai_analysis (true/false) - Get Buy/Sell/Hold recommendations
    """
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    try:
        # Get parameters
        if request.method == 'POST':
            data = request.get_json() or {}
            language = data.get('language', 'en')
            include_summary = data.get('summary', True)
            include_ai_analysis = data.get('ai_analysis', True)
        else:
            language = request.args.get('language', 'en')
            include_summary = request.args.get('summary', 'true').lower() == 'true'
            include_ai_analysis = request.args.get('ai_analysis', 'true').lower() == 'true'
        
        # Validate language
        if language not in ['en'] + list(LANGUAGES.keys()):
            response = jsonify({
                "success": False,
                "error": f"Unsupported language. Supported: en, {', '.join(LANGUAGES.keys())}"
            })
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response, 400
        
        print(f"📰 Fetching latest financial news in {language} (AI Analysis: {include_ai_analysis})...")
        
        # Get aggregated content with AI analysis
        result = get_aggregated_content(
            language=language, 
            include_summary=include_summary,
            include_ai_analysis=include_ai_analysis
        )
        
        response = jsonify(result)
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
        
    except Exception as e:
        print(f"Error in sebi_content endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        response = jsonify({
            "success": False,
            "error": f"Failed to fetch content: {str(e)}"
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500

@app.route('/supported_languages', methods=['GET', 'OPTIONS'])
def supported_languages():
    """Get list of supported vernacular languages"""
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    response = jsonify({
        "success": True,
        "languages": [{"code": "en", "name": "English"}] + [
            {"code": code, "name": name} for code, name in LANGUAGES.items()
        ]
    })
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response

# Global cache for articles per session
_article_cache = {}

@app.route('/sebi_content_stream', methods=['POST', 'OPTIONS'])
def sebi_content_stream():
    """
    TRUE progressive loading - returns each article immediately as processed
    Client calls this with article_index to get next article
    Supports filtering by news_type: 'general' for market news, 'stock' for stock-specific
    """
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    try:
        data = request.get_json() or {}
        language = data.get('language', 'en')
        article_index = data.get('article_index', 0)
        session_id = data.get('session_id', 'default')
        news_type_filter = data.get('news_type', None)  # 'general' or 'stock' or None (all)
        
        from progressive_fetcher import get_all_news_articles, process_article_progressive
        
        # Get all articles (use session-based caching to prevent duplicates)
        if article_index == 0 or session_id not in _article_cache:
            # First request - fetch all news
            all_articles = get_all_news_articles()
            
            # Filter by news type if specified
            if news_type_filter:
                all_articles = [a for a in all_articles if a.get('news_type') == news_type_filter]
                print(f"\n🔍 Filtered to {len(all_articles)} '{news_type_filter}' news articles")
            
            _article_cache[session_id] = all_articles
            total = len(all_articles)
            print(f"\n🆕 New session {session_id}: {total} articles cached")
        else:
            # Subsequent requests - use cached
            all_articles = _article_cache.get(session_id, [])
            total = len(all_articles)
        
        if article_index >= len(all_articles):
            response = jsonify({
                "success": True,
                "article": None,
                "has_more": False,
                "total": total,
                "current_index": article_index
            })
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response
        
        # Process this specific article
        article = all_articles[article_index]
        include_ai = data.get('include_ai_analysis', False)
        print(f"\n📰 Processing article {article_index + 1}/{total}...")
        
        processed = process_article_progressive(
            article, 
            article_index, 
            language=language,
            include_ai_analysis=include_ai
        )
        
        response = jsonify({
            "success": True,
            "article": processed,
            "has_more": article_index < total - 1,
            "total": total,
            "current_index": article_index
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
        
    except Exception as e:
        print(f"Error in stream endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        response = jsonify({
            "success": False,
            "error": str(e)
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500

@app.route('/get_ai_analysis', methods=['POST', 'OPTIONS'])
def get_ai_analysis():
    """
    Get AI analysis for a specific article on demand
    """
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    try:
        data = request.get_json() or {}
        title = data.get('title', '')
        content = data.get('content', '')
        language = data.get('language', 'en')
        
        if not title or not content:
            response = jsonify({
                "success": False,
                "error": "Title and content are required"
            })
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response, 400
        
        print(f"\n🤖 Getting AI analysis for article...")
        
        from content_aggregator import get_ai_analysis_and_action, translate_content
        
        # Get AI analysis
        ai_analysis = get_ai_analysis_and_action(title, content)
        
        if not ai_analysis:
            response = jsonify({
                "success": False,
                "error": "AI analysis failed due to rate limiting"
            })
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response, 503
        
        # Translate summary if needed
        if language != 'en' and 'summary' in ai_analysis:
            try:
                ai_analysis['summary_translated'] = translate_content(ai_analysis['summary'], language)
            except:
                pass
        
        response = jsonify({
            "success": True,
            "ai_analysis": ai_analysis
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
        
    except Exception as e:
        print(f"Error in AI analysis endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        response = jsonify({
            "success": False,
            "error": str(e)
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500

@app.route('/sebi_content_progressive', methods=['POST', 'OPTIONS'])
def sebi_content_progressive():
    """
    Progressive loading endpoint - returns articles as they're processed
    Returns initial batch immediately, then client can poll for updates
    """
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    try:
        data = request.get_json() or {}
        language = data.get('language', 'en')
        batch_size = data.get('batch_size', 5)  # Return 5 articles at a time
        
        print(f"📰 Progressive fetch: language={language}, batch_size={batch_size}")
        
        # Get content with AI analysis (no translation yet for speed)
        result = get_aggregated_content(
            language='en',  # Always fetch in English first
            include_summary=True,
            include_ai_analysis=True
        )
        
        if not result.get('success'):
            response = jsonify(result)
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response, 400
        
        # If translation needed, do it in background for first batch
        if language != 'en' and result.get('content'):
            from content_aggregator import translate_content, LANGUAGES
            print(f"🌐 Translating first {batch_size} articles to {language}...")
            for article in result['content'][:batch_size]:
                try:
                    article['title_translated'] = translate_content(article['title'], language)
                    article['content_translated'] = translate_content(article['content'][:1000], language)
                    if 'summary' in article:
                        article['summary_translated'] = translate_content(article['summary'], language)
                    article['language'] = LANGUAGES.get(language, language)
                except Exception as e:
                    print(f"Translation error: {str(e)}")
        
        result['language'] = language
        result['is_progressive'] = True
        
        response = jsonify(result)
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
        
    except Exception as e:
        print(f"Error in progressive endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        response = jsonify({
            "success": False,
            "error": f"Failed to fetch content: {str(e)}"
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500

@app.route('/risk_questions', methods=['GET', 'OPTIONS'])
def risk_questions():
    """Get risk assessment questionnaire"""
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    try:
        questions = get_risk_questions()
        response = jsonify({
            "success": True,
            "questions": questions
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
    except Exception as e:
        response = jsonify({"success": False, "error": str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500

@app.route('/calculate_risk_profile', methods=['POST', 'OPTIONS'])
def calculate_risk_profile():
    """Calculate risk profile from questionnaire answers"""
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    try:
        data = request.get_json()
        answers = data.get('answers', [])
        age = data.get('age', 30)
        investment_horizon = data.get('investment_horizon', 5)
        
        # Calculate risk score
        risk_result = calculate_risk_score(answers)
        
        # Suggest asset allocation using actual answers
        allocation = suggest_asset_allocation(
            risk_result['risk_profile'],
            age,
            investment_horizon,
            risk_result.get('answer_dict', {})
        )
        
        response = jsonify({
            "success": True,
            "risk_assessment": risk_result,
            "asset_allocation": allocation
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
    except Exception as e:
        print(f"Error in risk profile calculation: {str(e)}")
        import traceback
        traceback.print_exc()
        response = jsonify({"success": False, "error": str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500

@app.route('/analyze_portfolio_risk', methods=['POST', 'OPTIONS'])
def portfolio_risk():
    """Analyze portfolio risk metrics"""
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    try:
        data = request.get_json()
        holdings = data.get('holdings', [])
        
        analysis = analyze_portfolio_risk(holdings)
        
        response = jsonify({
            "success": True,
            "analysis": analysis
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
    except Exception as e:
        print(f"Error in portfolio risk analysis: {str(e)}")
        response = jsonify({"success": False, "error": str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500

@app.route('/risk_profiles', methods=['GET', 'OPTIONS'])
def risk_profiles():
    """Get all risk profile definitions"""
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    try:
        profiles = get_risk_profiles()
        response = jsonify({
            "success": True,
            "profiles": profiles
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
    except Exception as e:
        response = jsonify({"success": False, "error": str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500

# Global cache for AI insights (TTL: 24 hours)
_ai_insights_cache = {}
_cache_timestamps = {}

@app.route('/ai_risk_insights', methods=['POST', 'OPTIONS'])
def ai_risk_insights():
    """
    Generate AI-powered personalized investment insights and recommendations
    Uses caching to avoid repeated API calls for same inputs
    """
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    try:
        from datetime import datetime, timedelta
        from langchain_groq import ChatGroq
        from langchain_core.messages import SystemMessage, HumanMessage
        import os
        import time
        
        data = request.get_json()
        risk_profile = data.get('risk_profile', 'moderate')
        risk_score = data.get('risk_score', 50)
        corpus = data.get('corpus', 100000)
        age = data.get('age', 30)
        investment_horizon = data.get('investment_horizon', 5)
        allocation = data.get('allocation', {})
        
        # Create cache key
        cache_key = f"{risk_profile}_{int(risk_score/10)*10}_{int(corpus/50000)*50000}_{age}_{investment_horizon}"
        
        # Check cache (24 hour TTL)
        if cache_key in _ai_insights_cache:
            cache_time = _cache_timestamps.get(cache_key)
            if cache_time and (datetime.now() - cache_time).seconds < 86400:
                print(f"✅ Returning cached AI insights for key: {cache_key}")
                response = jsonify({
                    "success": True,
                    "insights": _ai_insights_cache[cache_key],
                    "cached": True
                })
                response.headers.add("Access-Control-Allow-Origin", "*")
                return response
        
        print(f"\n🤖 Generating AI insights for {risk_profile} profile...")
        
        # Initialize Groq
        groq_api_key = os.getenv("GROQ_API_KEY")
        llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=2000,
            api_key=groq_api_key
        )
        
        # Construct prompt
        system_prompt = """You are an expert Indian financial advisor with 20+ years of experience. 
Provide personalized, actionable investment insights in a friendly, encouraging tone.
Focus on Indian market context, SEBI-regulated products, and practical advice.
Be specific, avoid jargon, and include exact numbers and steps."""
        
        user_prompt = f"""Create a personalized investment plan for this investor:

**Profile:**
- Risk Profile: {risk_profile.upper()}
- Risk Score: {risk_score}/100
- Age: {age} years
- Investment Horizon: {investment_horizon} years
- Available Corpus: ₹{corpus:,}
- Recommended Allocation: {allocation.get('equity', 0)}% Equity, {allocation.get('debt', 0)}% Debt, {allocation.get('gold', 0)}% Gold

**Provide exactly these sections (use these exact headings):**

1. KEY INSIGHTS (3-4 bullet points):
   - Your strengths as an investor
   - Opportunities specific to your profile
   - Important considerations

2. INVESTMENT STRATEGY:
   - Specific investment approach for your ₹{corpus:,} corpus
   - Recommended instruments (mutual funds, ETFs, direct stocks)
   - Entry strategy (lump sum vs SIP)

3. CORPUS ALLOCATION PLAN:
   - Exact rupee breakdown:
     • Equity: ₹X (Y%)
     • Debt: ₹X (Y%)
     • Gold: ₹X (Y%)
   - Suggested specific funds/ETFs for each category

4. ACTION STEPS (numbered list):
   - Immediate actions (this month)
   - Short-term setup (next 3 months)
   - Long-term habits

5. RISK MANAGEMENT:
   - Portfolio protection strategies
   - Rebalancing guidelines
   - Emergency fund recommendations

Keep it concise, actionable, and encouraging. Use Indian rupees (₹) throughout."""
        
        # Call AI with retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                messages = [
                    SystemMessage(content=system_prompt),
                    HumanMessage(content=user_prompt)
                ]
                
                result = llm.invoke(messages)
                ai_response = result.content
                
                # Parse response into structured format
                insights = {
                    "raw_insights": ai_response,
                    "profile": risk_profile,
                    "corpus": corpus,
                    "generated_at": datetime.now().isoformat()
                }
                
                # Cache the result
                _ai_insights_cache[cache_key] = insights
                _cache_timestamps[cache_key] = datetime.now()
                
                print(f"✅ AI insights generated successfully")
                
                response = jsonify({
                    "success": True,
                    "insights": insights,
                    "cached": False
                })
                response.headers.add("Access-Control-Allow-Origin", "*")
                return response
                
            except Exception as e:
                error_msg = str(e)
                if "rate_limit" in error_msg.lower() or "429" in error_msg:
                    wait_time = 2 ** attempt
                    print(f"    ⏳ Rate limited (attempt {attempt + 1}), waiting {wait_time}s...")
                    time.sleep(wait_time)
                    if attempt == max_retries - 1:
                        raise
                else:
                    raise
        
    except Exception as e:
        print(f"Error generating AI insights: {str(e)}")
        import traceback
        traceback.print_exc()
        response = jsonify({
            "success": False,
            "error": f"Failed to generate AI insights: {str(e)}"
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500

@app.route('/corpus_investment_plan', methods=['POST', 'OPTIONS'])
def corpus_investment_plan():
    """Generate detailed investment plan for given corpus"""
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    try:
        data = request.get_json()
        corpus = data.get('corpus', 100000)
        allocation = data.get('allocation', {})
        investment_mode = data.get('mode', 'lump_sum')  # 'lump_sum' or 'sip'
        
        plan = calculate_corpus_investment_plan(corpus, allocation, investment_mode)
        
        response = jsonify({
            "success": True,
            "investment_plan": plan
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
    except Exception as e:
        print(f"Error in corpus plan: {str(e)}")
        import traceback
        traceback.print_exc()
        response = jsonify({"success": False, "error": str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500

# ===== ALGO BUILDER ENDPOINTS =====

@app.route('/algo_stocks', methods=['GET', 'OPTIONS'])
def algo_stocks():
    """Get list of Indian stocks for algo trading"""
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    try:
        stocks = get_indian_stocks()
        response = jsonify({
            "success": True,
            "stocks": stocks
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
    except Exception as e:
        response = jsonify({"success": False, "error": str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500

@app.route('/algo_backtest', methods=['POST', 'OPTIONS'])
def algo_backtest():
    """Run backtest on real market data with user's strategy"""
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    try:
        data = request.get_json()
        symbol = data.get('symbol', 'RELIANCE.NS')
        strategy_blocks = data.get('strategy_blocks', [])
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        initial_capital = data.get('initial_capital', 100000)
        
        if not strategy_blocks:
            response = jsonify({
                "success": False,
                "error": "Strategy blocks are required"
            })
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response, 400
        
        print(f"Running backtest for {symbol} with {len(strategy_blocks)} blocks")
        
        result = backtest_strategy(
            symbol=symbol,
            strategy_blocks=strategy_blocks,
            start_date=start_date,
            end_date=end_date,
            initial_capital=initial_capital
        )
        
        response = jsonify(result)
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
    except Exception as e:
        print(f"Error in algo backtest: {str(e)}")
        import traceback
        traceback.print_exc()
        response = jsonify({"success": False, "error": str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500

# ===== MARKET DATA ENDPOINTS =====

@app.route('/market_overview', methods=['GET'])
def market_overview():
    """Get complete market overview - indices, gainers, losers"""
    try:
        data = get_market_overview()
        response = jsonify(data)
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
    except Exception as e:
        response = jsonify({'success': False, 'error': str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500


@app.route('/market_historical/<ticker>', methods=['GET'])
def market_historical(ticker):
    """Get historical data for a specific ticker"""
    try:
        period = request.args.get('period', '1mo')
        interval = request.args.get('interval', '1d')
        
        # If it's an index name, convert to ticker
        if ticker in INDIAN_INDICES:
            ticker = INDIAN_INDICES[ticker]
        
        data = get_historical_data(ticker, period, interval)
        response = jsonify({
            'success': True,
            'ticker': ticker,
            'period': period,
            'interval': interval,
            'data': data
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
    except Exception as e:
        response = jsonify({'success': False, 'error': str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500


@app.route('/market_intraday/<ticker>', methods=['GET'])
def market_intraday(ticker):
    """Get intraday data (5-min intervals) for a specific ticker"""
    try:
        # If it's an index name, convert to ticker
        if ticker in INDIAN_INDICES:
            ticker = INDIAN_INDICES[ticker]
        
        data = get_intraday_data(ticker)
        response = jsonify({
            'success': True,
            'ticker': ticker,
            'data': data
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
    except Exception as e:
        response = jsonify({'success': False, 'error': str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500


@app.route('/stock_info/<ticker>', methods=['GET'])
def stock_info_endpoint(ticker):
    """Get detailed information about a specific stock"""
    try:
        data = get_stock_info(ticker)
        response = jsonify(data)
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
    except Exception as e:
        response = jsonify({'success': False, 'error': str(e)})
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500

# ===== AI LEARNING ENDPOINTS =====

@app.route('/generate_ai_summary', methods=['POST', 'OPTIONS'])
def generate_ai_summary():
    """Generate AI summary for lesson content using Groq AI"""
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    try:
        from langchain_groq import ChatGroq
        
        data = request.get_json()
        original_content = data.get('originalContent', '')
        lesson_title = data.get('lessonTitle', '')
        
        if not original_content:
            response = jsonify({
                "success": False,
                "error": "Original content is required"
            })
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response, 400
        
        print(f"Generating AI summary for {lesson_title}")
        
        # Initialize Groq LLM
        groq_llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.5)
        
        summary_prompt = f"""You are a financial education expert. Create a concise, crystal-clear summary of this lesson.

Lesson: {lesson_title}

Content:
{original_content}

Create a 1-2 sentence summary that captures the CORE concept in simple terms. Format:
"[Topic] = [Simple Definition/Explanation]. Key insight: [Most important takeaway]"

Examples:
- "Investing = Making your money grow by buying assets. Key insight: Saving preserves money, investing multiplies it."
- "Diversification = Spreading money across different investments. Key insight: Don't put all eggs in one basket to reduce risk."

Output ONLY the summary, nothing else."""

        summary_response = groq_llm.invoke(summary_prompt).content
        
        response = jsonify({
            "success": True,
            "summary": summary_response.strip()
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
        
    except Exception as e:
        print(f"Error generating AI summary: {str(e)}")
        import traceback
        traceback.print_exc()
        response = jsonify({
            "success": False,
            "error": str(e)
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500

@app.route('/generate_lesson_content', methods=['POST', 'OPTIONS'])
def generate_lesson_content():
    """Generate simplified and Hindi translations of lesson content using Groq AI"""
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    try:
        from langchain_groq import ChatGroq
        
        data = request.get_json()
        original_content = data.get('originalContent', '')
        lesson_title = data.get('lessonTitle', '')
        module_title = data.get('moduleTitle', '')
        content_type = data.get('contentType', 'both')  # 'simplified', 'hindi', or 'both'
        
        if not original_content:
            response = jsonify({
                "success": False,
                "error": "Original content is required"
            })
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response, 400
        
        print(f"Generating {content_type} content for {lesson_title}")
        
        # Initialize Groq LLM
        groq_llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.7)
        
        result = {}
        
        # Generate simplified content
        if content_type in ['simplified', 'both']:
            simplified_prompt = f"""You are a financial education expert simplifying content for Indian retail investors who are beginners.

Module: {module_title}
Lesson: {lesson_title}

Original Content:
{original_content}

Please rewrite this in simple, easy-to-understand language. Use:
- Short sentences
- Common everyday words
- Indian examples (₹, NSE, BSE, Nifty, etc.)
- Analogies and real-life scenarios
- Conversational tone

Keep the same length but make it accessible to someone with no financial background.
Output only the simplified content, no additional commentary."""

            simplified_response = groq_llm.invoke(simplified_prompt).content
            result['simplified'] = simplified_response.strip()
        
        # Generate Hindi translation
        if content_type in ['hindi', 'both']:
            hindi_prompt = f"""You are a financial education expert translating content to Hindi for Indian investors.

Module: {module_title}
Lesson: {lesson_title}

Original Content:
{original_content}

Please translate this to Hindi (Devanagari script). Requirements:
- Use simple, conversational Hindi
- Keep financial terms in English (stocks, bonds, mutual funds, SIP, etc.) with Hindi explanation
- Use ₹ for rupees
- Make it natural and easy to read
- Maintain the same structure and key points

Output only the Hindi translation, no additional commentary."""

            hindi_response = groq_llm.invoke(hindi_prompt).content
            result['hindi'] = hindi_response.strip()
        
        response = jsonify({
            "success": True,
            **result
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
        
    except Exception as e:
        print(f"Error generating lesson content: {str(e)}")
        import traceback
        traceback.print_exc()
        response = jsonify({
            "success": False,
            "error": str(e)
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response, 500

@app.route('/quiz_recommendations', methods=['POST', 'OPTIONS'])
def quiz_recommendations():
    """Generate AI-powered learning recommendations based on quiz performance"""
    if request.method == 'OPTIONS':
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response
    
    try:
        from langchain_groq import ChatGroq
        import os
        
        data = request.get_json()
        module_title = data.get('moduleTitle', '')
        pre_quiz = data.get('preQuizScore', {})
        post_quiz = data.get('postQuizScore', {})
        weak_topics = data.get('weakTopics', [])
        strong_topics = data.get('strongTopics', [])
        improved_topics = data.get('improvedTopics', [])
        declined_topics = data.get('declinedTopics', [])
        consistently_wrong_topics = data.get('consistentlyWrongTopics', [])
        performance_trend = data.get('performanceTrend', 'stable')
        
        if not module_title or not pre_quiz or not post_quiz:
            response = jsonify({
                "success": False,
                "error": "Missing required quiz data"
            })
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response, 400
        
        print(f"Generating quiz recommendations for {module_title} - Trend: {performance_trend}")
        
        # Initialize Groq LLM
        groq_llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.7)
        
        improvement = post_quiz.get('percentage', 0) - pre_quiz.get('percentage', 0)
        
        # Create detailed prompt
        improvement_pct = improvement
        total_questions = post_quiz.get('total', 0)
        correct_in_post = post_quiz.get('score', 0)
        correct_in_pre = pre_quiz.get('score', 0)
        
        prompt = f"""As an expert AI learning advisor for financial education, analyze this Indian student's quiz performance with DETAILED topic-level tracking and provide highly personalized, actionable recommendations.

**Module**: {module_title}

**📊 PERFORMANCE TRACKING**:
- **Pre-Quiz**: {correct_in_pre}/{total_questions} ({pre_quiz.get('percentage', 0)}%) - Baseline before learning
- **Post-Quiz**: {correct_in_post}/{total_questions} ({post_quiz.get('percentage', 0)}%) - After completing module
- **Net Change**: {improvement_pct:+.0f}% ({correct_in_post - correct_in_pre:+d} questions)
- **Performance Trend**: {performance_trend.upper()} {"📈" if performance_trend == "improving" else "📉" if performance_trend == "declining" else "➡️"}

**🎯 DETAILED TOPIC ANALYSIS**:

**Topics IMPROVED** (Wrong → Correct) ✅ [{len(improved_topics)} topics]:
{chr(10).join([f"  ✓ {t}" for t in improved_topics]) if improved_topics else "  None - No improvement shown"}

**Topics DECLINED** (Correct → Wrong) ⚠️ [{len(declined_topics)} topics] **CRITICAL**:
{chr(10).join([f"  ⚠️ {t}" for t in declined_topics]) if declined_topics else "  None - No decline"}

**Topics CONSISTENTLY WRONG** (Wrong in both) 🔴 [{len(consistently_wrong_topics)} topics] **HIGH PRIORITY**:
{chr(10).join([f"  🔴 {t}" for t in consistently_wrong_topics]) if consistently_wrong_topics else "  None"}

**All Weak Topics in Post-Quiz** [{len(weak_topics)} total]:
{chr(10).join([f"{i+1}. {t}" for i, t in enumerate(weak_topics[:8])]) if weak_topics else "✓ Perfect score! All topics mastered."}

**All Strong Topics in Post-Quiz** [{len(strong_topics)} total]:
{chr(10).join([f"{i+1}. {t}" for i, t in enumerate(strong_topics[:8])]) if strong_topics else "Need comprehensive review of all concepts."}

**CRITICAL INSIGHTS**:
- Performance is {performance_trend} ({improvement_pct:+.0f}%)
- {len(declined_topics)} topics REGRESSED (knew before, forgot now) - URGENT attention needed
- {len(consistently_wrong_topics)} topics NEVER mastered (wrong in both quizzes) - Fundamental gaps
- {len(improved_topics)} topics LEARNED successfully - Reinforcement needed
- Focus areas: {"DECLINED topics first, then CONSISTENTLY WRONG topics" if declined_topics or consistently_wrong_topics else "Maintain and expand knowledge"}

**YOUR TASK**: Create HIGHLY detailed, topic-specific recommendations following this structure:

# Learning Recommendations for {module_title}

## 📊 Performance Summary

Write 3-4 sentences:
- Overall trend: {"Improving" if performance_trend == "improving" else "Declining" if performance_trend == "declining" else "Stable"} performance
- Specific numbers: {correct_in_pre} → {correct_in_post} correct ({improvement_pct:+.0f}%)
- What this means for their learning effectiveness
- Current mastery level and readiness

## ⚠️ CRITICAL ATTENTION AREAS (Priority Order)

**FIRST** - Address DECLINED topics (if any):
- List each declined topic with specific reason why they might have forgotten
- Provide immediate action steps to reclaim this knowledge

**SECOND** - Address CONSISTENTLY WRONG topics (if any):
- List each topic with specific conceptual gap identified
- Explain the fundamental misunderstanding
- Provide step-by-step learning path

## ✅ Strengths & Achievements

List IMPROVED topics first (celebration!):
- **[Topic]**: "You learned this! Was wrong, now correct. Great progress!"

Then list consistently correct topics:
- **[Topic]**: "Strong foundation. Build on this with [advanced concept]"

## 🎯 Detailed Action Plan (Prioritized)

Provide 6-8 SPECIFIC action items in priority order:

**Immediate Actions** (Next 24 hours):
1. **Topic X**: [Exact resource] - Watch [specific video/section] - 15 min
2. **Topic Y**: [Practical exercise] - Do [calculation/example] - 10 min

**This Week**:
3. **Revision**: Review [declined topics] using [method] - 30 min
4. **Practice**: Solve [X] problems on [consistently wrong topics] - 20 min

**Ongoing**:
5. **Real-world**: Track [Indian market example] for [topic]
6. **Reinforce**: Use [tool/app] for [strong topic] - 10 min daily

## 🧠 Customized Study Strategy

Based on {performance_trend} trend, recommend:
- For DECLINING: [Specific intervention strategies]
- For IMPROVING: [Momentum building techniques]
- For STABLE: [Breakthrough strategies]

Include:
- Best study time and method for weak topics
- Spaced repetition schedule for declined topics
- Active recall techniques for consistently wrong topics
- Indian finance YouTube channels/resources for specific gaps

## 💪 Personalized Motivation

Address their specific situation:
- If declining: Encouraging but honest about need for course correction
- If improving: Celebrate wins, push for next level
- If stable: Motivate to break through plateau

Connect to their financial goals and real-world impact

**Tone**: Supportive, specific, actionable. Like a personal mentor who knows Indian markets.
**Language**: Use Indian financial terms (₹, Crore, Lakh, SIP, NSE, BSE, SEBI)
**Format**: Clean markdown with proper headings, bullet points, bold text, and emojis."""
        
        # Generate recommendations using Groq
        response_text = groq_llm.invoke(prompt).content
        
        response = jsonify({
            "success": True,
            "recommendations": response_text
        })
        response.headers.add("Access-Control-Allow-Origin", "*")
        return response
        
    except Exception as e:
        print(f"Error generating quiz recommendations: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Fallback to mock recommendations
        try:
            improvement = post_quiz.get('percentage', 0) - pre_quiz.get('percentage', 0)
            performance_level = 'excellent' if post_quiz.get('percentage', 0) >= 80 else 'good' if post_quiz.get('percentage', 0) >= 60 else 'needs improvement'
            
            mock_response = f"""# Learning Recommendations for {module_title}

## 📊 Performance Summary
You've shown {'significant improvement' if improvement > 0 else 'consistent performance'} with a {abs(improvement):.0f}% {'increase' if improvement > 0 else 'change'} from pre-quiz to post-quiz. Your {performance_level} post-quiz score of {post_quiz.get('percentage', 0):.0f}% demonstrates {'strong mastery' if performance_level == 'excellent' else 'good understanding' if performance_level == 'good' else 'room for growth'} of the module content.

## ✅ Key Strengths
{chr(10).join([f"- **{topic}**: You've demonstrated solid understanding of this concept" for topic in strong_topics[:3]]) if strong_topics else "- Continue building foundational knowledge"}

## 📈 Areas for Improvement
{chr(10).join([f"- **{topic}**: Review this topic with additional practice and examples" for topic in weak_topics[:3]]) if weak_topics else "- Focus on reinforcing all concepts"}

## 🎯 Personalized Recommendations

1. **Revisit Challenging Concepts**: Focus on {weak_topics[0] if weak_topics else 'key topics'}. Spend 15-20 minutes reviewing these topics with practical examples.

2. **Practice with Real Scenarios**: Apply your knowledge by analyzing real market data or case studies related to weak areas.

3. **Use Multiple Learning Resources**: Watch the recommended videos again, especially sections covering topics you found challenging.

4. **Take Notes**: Create summary notes for weak areas to reinforce learning through active recall.

5. **Retake the Quiz**: After reviewing, attempt the post-quiz again to track your progress and build confidence.

## 💪 Motivational Message
{'Great progress! Your ' + str(improvement) + '% improvement shows dedication to learning. Keep building on this momentum!' if improvement > 0 else "You're on the right track! Consistency in learning is key. Focus on the improvement areas and you'll see great results."}

Remember: Every expert was once a beginner. Keep learning, stay curious, and don't hesitate to revisit topics as many times as needed! 🚀
"""
            
            response = jsonify({
                "success": True,
                "recommendations": mock_response
            })
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response
        except:
            response = jsonify({
                "success": False,
                "error": "Failed to generate recommendations"
            })
            response.headers.add("Access-Control-Allow-Origin", "*")
            return response, 500

if __name__ == "__main__":
    print("🚀 Starting JainVest Financial Analysis API...")
    print("🌐 Server will be available at: http://localhost:5001")
    print("🔧 Debug mode: ON")
    print("📊 Available endpoints:")
    print("  - GET  /health")
    print("  - GET  /test") 
    print("  - POST /generate_report")
    print("  - POST /financial_report")
    print("  - POST /stock_data")
    print("  - POST /get_response")
    print("  - GET/POST /sebi_content (SEBI/NISM content aggregator)")
    print("  - GET  /supported_languages (Vernacular language support)")
    print("  - GET  /risk_questions (Risk assessment questionnaire)")
    print("  - POST /calculate_risk_profile (Calculate investor risk profile)")
    print("  - POST /analyze_portfolio_risk (Portfolio risk analysis)")
    print("  - GET  /risk_profiles (Risk profile definitions)")
    print("  - GET  /market_overview (Real-time market data)")
    print("  - GET  /market_historical/<ticker> (Historical OHLC data)")
    print("  - GET  /market_intraday/<ticker> (Intraday 5-min data)")
    print("  - GET  /stock_info/<ticker> (Detailed stock information)")
    print("  - POST /generate_ai_summary (Generate AI lesson summary)")
    print("  - POST /generate_lesson_content (Generate simplified/Hindi content)")
    print("  - POST /quiz_recommendations (AI quiz performance recommendations)")
    app.run(debug=True, host='0.0.0.0', port=5001)