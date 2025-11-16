# 🚀 Quick Start Guide - Strategy Builder System

## Prerequisites
- Python 3.10+
- Node.js 18+
- Backend dependencies installed (`pip install -r requirements.txt`)
- Frontend dependencies installed (`npm install`)

## Starting the System

### 1. Start Backend Server
```bash
cd backend
python3 main.py
```
Server runs on: `http://localhost:5001`

### 2. Start Frontend Development Server
```bash
npm run dev
```
Frontend runs on: `http://localhost:5174`

### 3. Login
- Email: Any email
- Password: Any password (no auth yet, use `test@example.com` / `password`)

## Using the System

### Step 1: Build a Strategy

1. Navigate to **Practice Lab → Strategy Builder** (`/strategy-builder`)
2. Add blocks from the left palette:
   - **Indicator**: SMA, EMA, RSI, MACD, Bollinger Bands, VWAP
   - **Condition**: Define when to trade (e.g., `cross_over(b1,b2)`)
   - **Action**: BUY, SELL, EXIT_ALL with SL/TP parameters
3. Configure:
   - **Symbols**: `RELIANCE.NS, TCS.NS` (comma-separated)
   - **Timeframe**: 1d, 1h, 15m, etc.
4. Click **Save & Backtest**

### Step 2: Run Backtest

1. Configure backtest parameters:
   - **Symbol**: Choose from strategy symbols
   - **Start Date**: e.g., `2023-01-01`
   - **End Date**: e.g., `2024-01-01`
   - **Initial Capital**: e.g., `100000`
2. Click **Run Backtest**
3. Wait for results (fetches real historical data from yfinance)
4. Review metrics:
   - Total Return %
   - CAGR
   - Sharpe Ratio
   - Max Drawdown
   - Win Rate
   - Profit Factor
5. Analyze:
   - Equity curve chart
   - Trade-by-trade history
   - Entry/exit prices and reasons

### Step 3: Deploy to Virtual Portfolio

1. Click **Deploy to Virtual Portfolio**
2. System creates a virtual portfolio and starts forward testing
3. Navigate to **Practice Lab → Virtual Simulator** (`/virtual-portfolio`)
4. Monitor in real-time:
   - Portfolio value
   - Current holdings
   - P&L (total and per position)
   - Live trades executing
   - Asset allocation
5. Page auto-refreshes every 5 seconds

## Example Strategy: SMA Crossover

### Concept
Buy when short-term SMA crosses above long-term SMA (bullish signal)

### Blocks
1. **Indicator Block b1**: SMA(20)
2. **Indicator Block b2**: SMA(50)
3. **Condition Block b3**: `cross_over(b1, b2)`
4. **Action Block b4**: BUY with 25% position, 5% stop loss, 10% take profit

### Expected Behavior
- When SMA(20) crosses above SMA(50), buy 25% of capital
- Automatically set stop loss at -5% and take profit at +10%
- Exit triggered by SL/TP or next strategy signal

## API Endpoints

### Strategy Management
```bash
# Create strategy
POST /strategy
Body: { name, userId, symbols, timeframe, blocks }

# Get strategy
GET /strategy/<id>

# List strategies
GET /strategy?userId=<userId>
```

### Backtesting
```bash
# Start backtest
POST /backtest
Body: { strategyId, symbol, startDate, endDate, initialCapital }

# Get results
GET /backtest/<id>
```

### Portfolio Management
```bash
# Create portfolio
POST /portfolio
Body: { userId, name, initialCapital }

# Get portfolio state
GET /portfolio/<id>

# List portfolios
GET /portfolio?userId=<userId>
```

### Deployment
```bash
# Deploy strategy for forward testing
POST /deploy
Body: { strategyId, portfolioId }

# Get deployment status
GET /deploy/<id>

# Stop deployment
POST /deploy/<id>/stop
```

## Testing with cURL

### 1. Create Strategy
```bash
curl -X POST http://localhost:5001/strategy \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SMA Crossover",
    "userId": "test",
    "symbols": ["RELIANCE.NS"],
    "timeframe": "1d",
    "blocks": [
      {"id": "b1", "type": "indicator", "indicator": "SMA", "params": {"period": 20}},
      {"id": "b2", "type": "indicator", "indicator": "SMA", "params": {"period": 50}},
      {"id": "b3", "type": "condition", "expr": "cross_over(b1,b2)"},
      {"id": "b4", "type": "action", "action": "BUY", "params": {"sizePct": 0.25, "stopLossPct": 0.05, "takeProfitPct": 0.10}}
    ]
  }'
```

### 2. Run Backtest
```bash
curl -X POST http://localhost:5001/backtest \
  -H "Content-Type: application/json" \
  -d '{
    "strategyId": "<STRATEGY_ID_FROM_STEP_1>",
    "symbol": "RELIANCE.NS",
    "startDate": "2023-01-01",
    "endDate": "2024-01-01",
    "initialCapital": 100000
  }'
```

### 3. Get Backtest Results
```bash
curl http://localhost:5001/backtest/<BACKTEST_ID>
```

## Common Strategies to Try

### 1. RSI Oversold/Overbought
```javascript
blocks: [
  { id: "b1", type: "indicator", indicator: "RSI", params: { period: 14 } },
  { id: "b2", type: "condition", expr: "b1 < 30" },  // Oversold
  { id: "b3", type: "action", action: "BUY", params: { sizePct: 0.3, stopLossPct: 0.03, takeProfitPct: 0.08 } }
]
```

### 2. MACD Crossover
```javascript
blocks: [
  { id: "b1", type: "indicator", indicator: "MACD", params: { fast: 12, slow: 26, signal: 9 } },
  { id: "b2", type: "condition", expr: "cross_over(b1_macd, b1_signal)" },
  { id: "b3", type: "action", action: "BUY", params: { sizePct: 0.25, stopLossPct: 0.05, takeProfitPct: 0.12 } }
]
```

### 3. Bollinger Band Breakout
```javascript
blocks: [
  { id: "b1", type: "indicator", indicator: "BOLLINGER", params: { period: 20, std: 2 } },
  { id: "b2", type: "indicator", indicator: "close" },
  { id: "b3", type: "condition", expr: "b2 < b1_lower" },  // Price below lower band
  { id: "b4", type: "action", action: "BUY", params: { sizePct: 0.2, stopLossPct: 0.04, takeProfitPct: 0.10 } }
]
```

## Troubleshooting

### Backend won't start
```bash
# Kill existing processes
lsof -ti:5001 | xargs kill -9

# Restart
cd backend
python3 main.py
```

### Backtest fails with "No data"
- Check symbol format (use Yahoo Finance format: `RELIANCE.NS` for NSE stocks)
- Verify date range is valid
- Ensure yfinance can fetch the data

### Forward testing not executing trades
- Check that live market is open
- Verify data is being fetched (check backend logs)
- Ensure conditions are met (may need to wait for signal)

### Frontend not connecting to backend
- Verify backend is running on `http://localhost:5001`
- Check browser console for CORS errors
- Ensure `flask-cors` is installed

## Performance Tips

1. **Backtest Speed**: Longer date ranges take more time. Start with 6 months.
2. **Forward Testing**: Uses real-time polling every 5 seconds. Adjust in `forward_runner.py`.
3. **Multiple Symbols**: Test one symbol first, then expand.
4. **Indicator Periods**: Lower periods = more signals, higher = fewer but potentially better.

## Next Steps

- Add AI insights to strategy performance
- Implement risk management rules (max drawdown limits)
- Add more advanced indicators
- Enable multi-symbol backtesting
- Add WebSocket streaming for real-time updates
- Implement user authentication
- Store strategies in database (PostgreSQL)

## Support

For issues or questions:
- Check `STRATEGY_SYSTEM_README.md` for detailed documentation
- Review backend logs for errors
- Test API endpoints with cURL/Postman

Happy Trading! 📈💰
