# JainVest Financial Analysis API

## 🚀 Enhanced AI Agent with YFinance Tools

Your AI agent has been upgraded with comprehensive financial analysis capabilities including all the key metrics for investment education and SEBI compliance.

## 📊 Key Financial Metrics Included

### 1. **CAGR (Compound Annual Growth Rate)**
- Shows true growth rate of investment over time
- Perfect for beginners to understand long-term performance
- Smooths out market volatility

### 2. **Volatility (σ)**
- Measures market risk and price fluctuations
- Foundation for risk education
- Higher volatility = higher risk but potentially higher returns

### 3. **Sharpe Ratio**
- Risk-adjusted return metric
- Answers: "Is my return worth the risk taken?"
- Higher values indicate better risk-adjusted performance

### 4. **Beta (β) & CAPM**
- Links stock/index risk with market risk
- Core SEBI concept for understanding relative risk
- Beta > 1 = more volatile than market, Beta < 1 = less volatile

### 5. **Max Drawdown**
- Biggest loss during a period
- Teaches importance of downside protection
- Helps understand worst-case scenarios

### 6. **Monte Carlo Simulation**
- Makes backtesting engaging through visual probability analysis
- Simulates thousands of price paths
- Shows potential outcomes and probabilities

## 🔧 API Endpoints

### 1. Health Check
```http
GET /health
```
**Response:**
```json
{
  "status": "healthy",
  "message": "Financial AI Agent API is running"
}
```

### 2. Basic Stock Data
```http
POST /stock_data
Content-Type: application/json

{
  "symbol": "AAPL"
}
```

### 3. Comprehensive Financial Report
```http
POST /financial_report
Content-Type: application/json

{
  "symbol": "AAPL",
  "benchmark": "^GSPC"
}
```

### 4. AI Chat Interface (Original)
```http
POST /get_response
Content-Type: application/json

{
  "query": "Analyze Tesla stock performance"
}
```

## 📈 Sample Financial Report Structure

```json
{
  "success": true,
  "symbol": "AAPL",
  "report": {
    "stock_info": {
      "symbol": "AAPL",
      "company_name": "Apple Inc.",
      "sector": "Technology",
      "industry": "Consumer Electronics",
      "market_cap": 3500000000000,
      "current_price": 185.50,
      "currency": "USD"
    },
    "performance_metrics": {
      "cagr": {
        "value": 0.15,
        "percentage": "15.00%",
        "explanation": "Compound Annual Growth Rate shows the true growth rate..."
      },
      "volatility": {
        "value": 0.25,
        "percentage": "25.00%",
        "explanation": "Volatility measures market risk and price fluctuations..."
      }
    },
    "risk_metrics": {
      "sharpe_ratio": {
        "value": 1.8,
        "interpretation": "Good",
        "explanation": "Risk-adjusted return metric. Answers: Is my return worth the risk taken?"
      },
      "beta": {
        "value": 1.2,
        "interpretation": "High Risk",
        "explanation": "Measures stock's sensitivity to market movements..."
      },
      "max_drawdown": {
        "value": -0.15,
        "percentage": "-15.00%",
        "peak_date": "2024-01-15",
        "trough_date": "2024-03-10",
        "explanation": "Biggest loss during the period..."
      }
    },
    "capm_analysis": {
      "expected_return": 0.12,
      "expected_return_percentage": "12.00%",
      "explanation": "Capital Asset Pricing Model links stock risk with market risk..."
    },
    "monte_carlo_simulation": {
      "mean_projected_return": 1.15,
      "downside_risk_5th_percentile": 0.85,
      "upside_potential_95th_percentile": 1.45,
      "probability_of_positive_return": "75.5%",
      "explanation": "Simulates thousands of possible price paths..."
    },
    "investment_recommendation": {
      "risk_level": "Medium",
      "suitable_for": "Moderate investors",
      "key_insights": [
        "CAGR of 15.00% shows strong long-term growth",
        "Volatility of 25.00% indicates moderate risk",
        "Sharpe ratio of 1.80 suggests good risk-adjusted returns"
      ]
    },
    "educational_notes": {
      "cagr_importance": "CAGR is crucial for beginners as it shows true investment growth over time",
      "volatility_education": "Understanding volatility is foundation for risk education",
      "sharpe_ratio_significance": "Sharpe ratio helps answer the key question: Is the extra return worth the extra risk?"
    }
  }
}
```

## 🛠️ How to Run

### 1. Start the Flask Server
```bash
cd backend
python main.py
```

### 2. Test the API
```bash
python test_financial_api.py
```

## 💡 Usage Examples

### For US Stocks:
- AAPL (Apple)
- MSFT (Microsoft)
- GOOGL (Google)
- TSLA (Tesla)

### For Indian Stocks:
- RELIANCE.NS (Reliance Industries)
- TCS.NS (Tata Consultancy Services)
- INFY.NS (Infosys)

### Benchmarks:
- ^GSPC (S&P 500)
- ^NSEI (Nifty 50)
- ^DJI (Dow Jones)

## 🎯 Frontend Integration

Use the `/financial_report` endpoint in your React frontend to display comprehensive financial analysis. The JSON response is structured for easy consumption and visualization.

Example fetch in React:
```javascript
const fetchFinancialReport = async (symbol) => {
  try {
    const response = await fetch('http://localhost:5000/financial_report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbol: symbol, benchmark: '^GSPC' })
    });
    
    const data = await response.json();
    return data.report;
  } catch (error) {
    console.error('Error fetching financial report:', error);
  }
};
```

## 📚 Educational Value

This API is designed to be educational, providing:
- Clear explanations for each metric
- Investment recommendations based on risk levels
- Educational notes explaining importance of each concept
- SEBI-compliant risk analysis
- Beginner-friendly interpretations

Perfect for building financial literacy applications! 🎓📊
