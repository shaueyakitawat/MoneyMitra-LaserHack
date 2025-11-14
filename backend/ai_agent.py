from dotenv import load_dotenv
import os
import json
import yfinance as yf
import pandas as pd
import numpy as np
from scipy import stats
import warnings
warnings.filterwarnings('ignore')

load_dotenv()

groq_api_key = os.getenv("GROQ_API_KEY")    
tavily_api_key = os.getenv("TAVILY_API_KEY")
from langchain_groq import ChatGroq
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.messages.ai import AIMessage
from langchain.tools import tool
from typing import Dict, Any, List

# Finance Analysis Functions
def calculate_cagr(start_value: float, end_value: float, periods: float) -> float:
    """Calculate Compound Annual Growth Rate"""
    if start_value <= 0 or periods <= 0:
        return 0
    return ((end_value / start_value) ** (1/periods)) - 1

def calculate_volatility(returns: pd.Series) -> float:
    """Calculate annualized volatility"""
    return returns.std() * np.sqrt(252)

def calculate_sharpe_ratio(returns: pd.Series, risk_free_rate: float = 0.02) -> float:
    """Calculate Sharpe Ratio"""
    excess_returns = returns.mean() * 252 - risk_free_rate
    volatility = calculate_volatility(returns)
    return excess_returns / volatility if volatility != 0 else 0

def calculate_beta(stock_returns: pd.Series, market_returns: pd.Series) -> float:
    """Calculate Beta coefficient"""
    covariance = np.cov(stock_returns.dropna(), market_returns.dropna())[0][1]
    market_variance = np.var(market_returns.dropna())
    return covariance / market_variance if market_variance != 0 else 0

def calculate_max_drawdown(prices: pd.Series) -> Dict[str, float]:
    """Calculate Maximum Drawdown"""
    rolling_max = prices.expanding().max()
    drawdown = (prices - rolling_max) / rolling_max
    max_drawdown = drawdown.min()
    
    # Find the dates
    max_dd_date = drawdown.idxmin()
    peak_date = rolling_max.loc[:max_dd_date].idxmax()
    
    return {
        'max_drawdown': max_drawdown,
        'peak_date': str(peak_date.date()) if hasattr(peak_date, 'date') else str(peak_date),
        'trough_date': str(max_dd_date.date()) if hasattr(max_dd_date, 'date') else str(max_dd_date)
    }

def monte_carlo_simulation(returns: pd.Series, days: int = 252, simulations: int = 1000) -> Dict[str, Any]:
    """Run Monte Carlo simulation for price prediction"""
    mean_return = returns.mean()
    std_return = returns.std()
    
    simulation_results = []
    for _ in range(simulations):
        random_returns = np.random.normal(mean_return, std_return, days)
        price_path = np.cumprod(1 + random_returns)
        simulation_results.append(price_path[-1])
    
    simulation_results = np.array(simulation_results)
    
    return {
        'mean_final_price': float(np.mean(simulation_results)),
        'percentile_5': float(np.percentile(simulation_results, 5)),
        'percentile_95': float(np.percentile(simulation_results, 95)),
        'probability_positive': float(np.sum(simulation_results > 1) / len(simulation_results)),
        'simulations_run': simulations
    }

@tool
def get_stock_data(symbol: str) -> str:
    """
    Fetch stock data and basic information for a given symbol.
    
    Args:
        symbol: Stock ticker symbol (e.g., 'AAPL', 'MSFT', 'RELIANCE.NS')
    
    Returns:
        JSON string with stock data
    """
    try:
        stock = yf.Ticker(symbol)
        hist = stock.history(period="2y")
        info = stock.info
        
        if hist.empty:
            return json.dumps({"error": f"No data found for symbol {symbol}"})
        
        result = {
            "symbol": symbol,
            "company_name": info.get('longName', 'N/A'),
            "current_price": float(hist['Close'][-1]),
            "currency": info.get('currency', 'N/A'),
            "market_cap": info.get('marketCap', 'N/A'),
            "sector": info.get('sector', 'N/A'),
            "industry": info.get('industry', 'N/A'),
            "data_points": len(hist),
            "date_range": f"{hist.index[0].date()} to {hist.index[-1].date()}"
        }
        
        return json.dumps(result)
    except Exception as e:
        return json.dumps({"error": str(e)})

@tool
def generate_financial_report(symbol: str, benchmark: str = "^GSPC") -> str:
    """
    Generate a comprehensive financial analysis report for a stock including CAGR, volatility, 
    Sharpe ratio, Beta, max drawdown, and Monte Carlo simulation.
    
    Args:
        symbol: Stock ticker symbol
        benchmark: Benchmark index symbol (default: S&P 500)
    
    Returns:
        JSON string with comprehensive financial analysis
    """
    try:
        # Fetch stock data
        stock = yf.Ticker(symbol)
        benchmark_ticker = yf.Ticker(benchmark)
        
        # Get 2 years of data
        stock_hist = stock.history(period="2y")
        benchmark_hist = benchmark_ticker.history(period="2y")
        
        if stock_hist.empty:
            return json.dumps({"error": f"No data found for {symbol}"})
        
        # Calculate returns
        stock_returns = stock_hist['Close'].pct_change().dropna()
        benchmark_returns = benchmark_hist['Close'].pct_change().dropna()
        
        # Align dates
        common_dates = stock_returns.index.intersection(benchmark_returns.index)
        stock_returns_aligned = stock_returns.loc[common_dates]
        benchmark_returns_aligned = benchmark_returns.loc[common_dates]
        
        # Get stock info
        info = stock.info
        
        # Calculate financial metrics
        start_price = stock_hist['Close'].iloc[0]
        end_price = stock_hist['Close'].iloc[-1]
        periods = len(stock_hist) / 252  # Convert to years
        
        cagr = calculate_cagr(start_price, end_price, periods)
        volatility = calculate_volatility(stock_returns)
        sharpe_ratio = calculate_sharpe_ratio(stock_returns)
        beta = calculate_beta(stock_returns_aligned, benchmark_returns_aligned)
        max_drawdown_info = calculate_max_drawdown(stock_hist['Close'])
        monte_carlo_results = monte_carlo_simulation(stock_returns)
        
        # CAPM calculation
        risk_free_rate = 0.02  # Assume 2% risk-free rate
        market_return = benchmark_returns_aligned.mean() * 252
        expected_return_capm = risk_free_rate + beta * (market_return - risk_free_rate)
        
        # Compile comprehensive report
        report = {
            "stock_info": {
                "symbol": symbol,
                "company_name": info.get('longName', 'N/A'),
                "sector": info.get('sector', 'N/A'),
                "industry": info.get('industry', 'N/A'),
                "market_cap": info.get('marketCap', 'N/A'),
                "current_price": float(end_price),
                "currency": info.get('currency', 'N/A')
            },
            "performance_metrics": {
                "cagr": {
                    "value": float(cagr),
                    "percentage": f"{cagr * 100:.2f}%",
                    "explanation": "Compound Annual Growth Rate shows the true growth rate of investment over time. It smooths out volatility to show steady annual growth rate."
                },
                "volatility": {
                    "value": float(volatility),
                    "percentage": f"{volatility * 100:.2f}%",
                    "explanation": "Volatility measures market risk and price fluctuations. Higher volatility means higher risk but potentially higher returns."
                }
            },
            "risk_metrics": {
                "sharpe_ratio": {
                    "value": float(sharpe_ratio),
                    "interpretation": "Excellent" if sharpe_ratio > 2 else "Good" if sharpe_ratio > 1 else "Fair" if sharpe_ratio > 0.5 else "Poor",
                    "explanation": "Risk-adjusted return metric. Answers: Is my return worth the risk taken? Higher values indicate better risk-adjusted performance."
                },
                "beta": {
                    "value": float(beta),
                    "interpretation": "High Risk" if beta > 1.2 else "Market Risk" if beta > 0.8 else "Low Risk",
                    "explanation": "Measures stock's sensitivity to market movements. Beta > 1 means more volatile than market, Beta < 1 means less volatile."
                },
                "max_drawdown": {
                    "value": float(max_drawdown_info['max_drawdown']),
                    "percentage": f"{max_drawdown_info['max_drawdown'] * 100:.2f}%",
                    "peak_date": max_drawdown_info['peak_date'],
                    "trough_date": max_drawdown_info['trough_date'],
                    "explanation": "Biggest loss during the period. Teaches importance of downside protection and helps understand worst-case scenarios."
                }
            },
            "capm_analysis": {
                "expected_return": float(expected_return_capm),
                "expected_return_percentage": f"{expected_return_capm * 100:.2f}%",
                "market_return": float(market_return),
                "risk_free_rate": risk_free_rate,
                "explanation": "Capital Asset Pricing Model links stock risk with market risk. Core concept for understanding risk-return relationship."
            },
            "monte_carlo_simulation": {
                "mean_projected_return": float(monte_carlo_results['mean_final_price']),
                "downside_risk_5th_percentile": float(monte_carlo_results['percentile_5']),
                "upside_potential_95th_percentile": float(monte_carlo_results['percentile_95']),
                "probability_of_positive_return": f"{monte_carlo_results['probability_positive'] * 100:.1f}%",
                "simulations_run": monte_carlo_results['simulations_run'],
                "explanation": "Simulates thousands of possible price paths to understand potential outcomes. Makes backtesting engaging and visual."
            },
            "investment_recommendation": {
                "risk_level": "High" if beta > 1.2 or volatility > 0.4 else "Medium" if beta > 0.8 or volatility > 0.2 else "Low",
                "suitable_for": "Aggressive investors" if beta > 1.2 else "Moderate investors" if beta > 0.8 else "Conservative investors",
                "key_insights": [
                    f"CAGR of {cagr * 100:.2f}% shows {'strong' if cagr > 0.15 else 'moderate' if cagr > 0.08 else 'weak'} long-term growth",
                    f"Volatility of {volatility * 100:.2f}% indicates {'high' if volatility > 0.4 else 'moderate' if volatility > 0.2 else 'low'} risk",
                    f"Sharpe ratio of {sharpe_ratio:.2f} suggests {'excellent' if sharpe_ratio > 2 else 'good' if sharpe_ratio > 1 else 'poor'} risk-adjusted returns",
                    f"Beta of {beta:.2f} means the stock is {'more' if beta > 1 else 'less'} volatile than the market",
                    f"Maximum drawdown of {max_drawdown_info['max_drawdown'] * 100:.2f}% shows potential downside risk"
                ]
            },
            "educational_notes": {
                "cagr_importance": "CAGR is crucial for beginners as it shows true investment growth over time, eliminating market noise",
                "volatility_education": "Understanding volatility is foundation for risk education - it shows how much prices fluctuate",
                "sharpe_ratio_significance": "Sharpe ratio helps answer the key question: Is the extra return worth the extra risk?",
                "beta_capm_relevance": "Beta and CAPM are core SEBI concepts that link individual stock risk to overall market risk",
                "drawdown_protection": "Max drawdown teaches the importance of downside protection in portfolio management",
                "monte_carlo_value": "Monte Carlo simulation makes complex backtesting concepts engaging through visual probability analysis"
            },
            "analysis_period": f"{stock_hist.index[0].date()} to {stock_hist.index[-1].date()}",
            "benchmark_used": benchmark,
            "data_points_analyzed": len(stock_hist)
        }
        
        return json.dumps(report, indent=2)
        
    except Exception as e:
        return json.dumps({"error": f"Error generating financial report: {str(e)}"})

# Initialize LLM and tools
groq_llm = ChatGroq(model="llama-3.3-70b-versatile")
search_tool = TavilySearchResults(max_result=2)

# Enhanced system prompt for financial analysis
financial_system_prompt = """You are an expert financial advisor and analyst specializing in comprehensive investment analysis. 

Your role is to provide detailed financial reports that educate investors about key financial metrics and concepts:

1. **CAGR (Compound Annual Growth Rate)**: Always explain this as the true growth rate that shows how investments grow over time, perfect for beginners to understand long-term performance.

2. **Volatility (σ)**: Explain market risk and fluctuations as the foundation for risk education. Help users understand that higher volatility means higher risk but potentially higher returns.

3. **Sharpe Ratio**: Focus on risk-adjusted returns and help answer "Is my return worth the risk taken?" This is crucial for investment decision-making.

4. **Beta (β) & CAPM**: Always link stock/index risk with market risk - this is a core SEBI concept that helps investors understand relative risk.

5. **Max Drawdown**: Emphasize the biggest loss during a period and teach downside protection. This helps investors understand worst-case scenarios.

6. **Monte Carlo Simulation**: Make backtesting engaging by explaining how thousands of simulated price paths help visualize potential outcomes.

When generating reports, always:
- Use the financial tools available to get real market data
- Provide educational context for each metric
- Explain what the numbers mean for different types of investors
- Include actionable insights and recommendations
- Make complex concepts accessible to beginners
- Provide comprehensive analysis in JSON format for easy consumption

Focus on creating reports that are both technically accurate and educationally valuable."""

from langgraph.prebuilt import create_react_agent
from langchain_core.messages import SystemMessage

# Create enhanced agent with financial tools
agent = create_react_agent(
    groq_llm,
    [search_tool, get_stock_data, generate_financial_report]
)

def get_agent_response(query):
    # Include system prompt in the messages
    state = {"messages": [SystemMessage(content=financial_system_prompt), {"role": "user", "content": query}]}
    response = agent.invoke(state)
    messages = response.get("messages")
    ai_messages = [message.content for message in messages if isinstance(message, AIMessage)]
    return ai_messages[-1]

def get_financial_report_json(symbol: str, benchmark: str = "^GSPC") -> Dict[str, Any]:
    """
    Direct function to get financial report in JSON format for Flask routes
    """
    try:
        report_json_str = generate_financial_report.invoke({"symbol": symbol, "benchmark": benchmark})
        return json.loads(report_json_str)
    except Exception as e:
        return {"error": f"Failed to generate report: {str(e)}"}
