# Strategy Builder, Backtesting Engine & Virtual Portfolio Simulator

## 🎯 Overview

A complete, production-ready trading system for **MoneyMitra EdTech Platform** featuring:

- **Strategy Builder**: Visual drag-and-drop interface to create trading strategies
- **Backtesting Engine**: Historical simulation with real market data (yfinance)
- **Virtual Portfolio Simulator**: Live forward-testing with real-time data

All three components are fully interconnected with NO static data - everything uses live APIs.

---

## 🏗️ Architecture

### Flow Diagram
```
Strategy Builder → Backtest Engine → Virtual Portfolio Simulator
     ↓                  ↓                     ↓
  JSON Schema      Historical Data      Live Market Data
     ↓                  ↓                     ↓
  Save to DB      Simulate Trades      Execute Paper Trades
                       ↓                     ↓
                  Metrics & Charts     Real-time P&L Tracking
```

### Components

#### 1. **Strategy Builder** (`/strategy-builder`)
- Visual block-based strategy creator
- Indicator Blocks: SMA, EMA, RSI, MACD, Bollinger Bands, VWAP, ATR
- Condition Blocks: cross_over, cross_under, >, <, >=, <=, ==
- Action Blocks: BUY, SELL, EXIT_ALL with SL/TP parameters
- Saves strategy as canonical JSON

#### 2. **Backtesting Engine** (`/backtest-results`)
- Bar-by-bar historical simulation
- Uses yfinance for real OHLCV data
- Stop Loss / Take Profit execution
- Metrics: Total Return, CAGR, Sharpe Ratio, Max Drawdown, Win Rate, Profit Factor
- Equity curve visualization
- Trade history with exit reasons

#### 3. **Virtual Portfolio Simulator** (`/virtual-portfolio`)
- Live forward testing with real-time market data
- Automatic trade execution based on strategy rules
- Real-time P&L tracking
- Holdings table with current prices
- Asset allocation pie chart
- Transaction history

---

## 🔧 Backend Implementation

### Files Created

#### `backend/models.py`
Database models (in-memory storage, can be replaced with SQLAlchemy):
- `Strategy`: Trading strategy with blocks
- `Backtest`: Backtest job and results
- `Portfolio`: Virtual trading portfolio
- `Trade`: Individual trade record
- `DeployedStrategy`: Active forward-testing strategy

#### `backend/indicators.py`
Technical indicator calculations:
- `IndicatorEngine.calculate()`: Compute any indicator
  - SMA, EMA, RSI, MACD, Bollinger Bands, VWAP, ATR
- `ConditionEvaluator.evaluate()`: Evaluate trading conditions
  - Supports cross_over, cross_under, comparisons

#### `backend/backtest_worker.py`
Backtesting engine:
- `BacktestEngine`: Bar-by-bar simulation
  - Fetches historical data from yfinance
  - Calculates indicators
  - Evaluates conditions
  - Executes trades with SL/TP
  - Calculates performance metrics
- `run_backtest()`: Convenience function

#### `backend/forward_runner.py`
Forward testing runner:
- `ForwardRunner`: Live paper trading
  - Polls market data every N seconds
  - Calculates indicators in real-time
  - Evaluates strategy conditions
  - Executes trades in virtual portfolio
  - Updates portfolio state
- `deploy_strategy()`: Start forward testing
- `stop_deployment()`: Stop forward testing

#### `backend/main.py` (Updated)
New API endpoints:
```python
POST   /strategy              # Create strategy
GET    /strategy/<id>         # Get strategy
GET    /strategy              # List strategies
POST   /backtest              # Start backtest
GET    /backtest/<id>         # Get backtest results
POST   /portfolio             # Create portfolio
GET    /portfolio/<id>        # Get portfolio state
GET    /portfolio             # List portfolios
POST   /deploy                # Deploy strategy for forward testing
GET    /deploy/<id>           # Get deployment status
POST   /deploy/<id>/stop      # Stop deployment
POST   /portfolio/<id>/close  # Close positions
```

---

## 🎨 Frontend Implementation

### Pages Created

#### `src/pages/StrategyBuilder.jsx`
Visual strategy builder:
- Three-panel layout: Palette, Canvas, Editor
- Drag-and-drop block creation
- Indicator configuration (periods, parameters)
- Condition builder with expression editor
- Action configuration (size %, SL %, TP %)
- Save & navigate to backtest

#### `src/pages/BacktestResultsPage.jsx`
Backtest visualization:
- Configuration panel (symbol, dates, capital)
- Metrics cards (Return, CAGR, Sharpe, Drawdown, Win Rate, Profit Factor)
- Equity curve chart (Recharts)
- Trade history table
- Deploy to Virtual Portfolio button

#### `src/pages/VirtualPortfolio.jsx`
Live portfolio dashboard:
- Summary cards (Total Value, P&L, Cash, Holdings)
- Performance chart (real-time equity curve)
- Asset allocation pie chart
- Current holdings table with live P&L
- Recent trades table
- Auto-refresh every 5 seconds

### Routes Added to `src/App.jsx`
```jsx
/strategy-builder      → StrategyBuilder
/backtest-results      → BacktestResultsPage
/virtual-portfolio     → VirtualPortfolio
```

### Sidebar Updated
New Practice Lab links:
- 🛠️ Strategy Builder
- 📈 Backtest Results
- 💼 Virtual Simulator

---

## 📊 Strategy JSON Schema

Example strategy:
```json
{
  "strategyId": "uuid",
  "name": "SMA Crossover",
  "userId": "default",
  "symbols": ["RELIANCE.NS"],
  "timeframe": "1d",
  "blocks": [
    {
      "id": "b1",
      "type": "indicator",
      "indicator": "SMA",
      "params": { "period": 20 }
    },
    {
      "id": "b2",
      "type": "indicator",
      "indicator": "SMA",
      "params": { "period": 50 }
    },
    {
      "id": "b3",
      "type": "condition",
      "expr": "cross_over(b1,b2)"
    },
    {
      "id": "b4",
      "type": "action",
      "action": "BUY",
      "params": {
        "sizePct": 0.25,
        "stopLossPct": 0.05,
        "takeProfitPct": 0.10
      }
    }
  ]
}
```

---

## 🚀 Usage Flow

### 1. Create Strategy
```bash
# User creates strategy in Strategy Builder UI
# Adds indicator blocks: SMA(20), SMA(50)
# Adds condition: cross_over(b1, b2)
# Adds action: BUY with 25% position, 5% SL, 10% TP
# Clicks "Save & Backtest"
```

### 2. Run Backtest
```bash
# User configures:
# - Symbol: RELIANCE.NS
# - Date Range: 2023-01-01 to 2024-01-01
# - Initial Capital: ₹100,000
# Clicks "Run Backtest"

# Backend:
# 1. Fetches historical data from yfinance
# 2. Calculates SMA(20) and SMA(50) for all bars
# 3. Simulates bar-by-bar:
#    - Checks if SMA(20) crosses above SMA(50)
#    - Executes BUY with stop loss and take profit
#    - Tracks equity curve
# 4. Returns results with metrics and trade list
```

### 3. Deploy to Virtual Portfolio
```bash
# User clicks "Deploy to Virtual Portfolio"

# Backend:
# 1. Creates new virtual portfolio with ₹100,000
# 2. Starts forward testing runner
# 3. Runner polls live market data every 5 seconds
# 4. Evaluates strategy conditions in real-time
# 5. Executes trades automatically
# 6. Updates portfolio state

# Frontend:
# - Portfolio page auto-refreshes every 5 seconds
# - Shows live P&L, holdings, charts
# - User sees trades executing in real-time
```

---

## 📦 Dependencies

### Backend
```bash
pip install yfinance pandas numpy flask flask-cors
```

### Frontend
Already installed:
- react
- react-router-dom
- recharts

---

## 🧪 Testing

### Test Backtest Engine
```python
from backtest_worker import run_backtest

strategy = {
    "name": "SMA Crossover",
    "symbols": ["RELIANCE.NS"],
    "timeframe": "1d",
    "blocks": [
        {"id": "b1", "type": "indicator", "indicator": "SMA", "params": {"period": 20}},
        {"id": "b2", "type": "indicator", "indicator": "SMA", "params": {"period": 50}},
        {"id": "b3", "type": "condition", "expr": "cross_over(b1,b2)"},
        {"id": "b4", "type": "action", "action": "BUY", "params": {"sizePct": 0.25, "stopLossPct": 0.05, "takeProfitPct": 0.10}}
    ]
}

results = run_backtest(strategy, "RELIANCE.NS", "2023-01-01", "2024-01-01", 100000)
print(results)
```

### Test Forward Runner
```python
from forward_runner import deploy_strategy
from models import Portfolio, portfolios_db
import uuid

# Create portfolio
portfolio_id = str(uuid.uuid4())
portfolio = Portfolio(portfolio_id, "default", "Test Portfolio", 100000)
portfolios_db[portfolio_id] = portfolio

# Deploy strategy
deployment_id = str(uuid.uuid4())
deploy_strategy(strategy, portfolio_id, deployment_id)

# Check portfolio after some time
import time
time.sleep(30)
print(portfolios_db[portfolio_id].to_dict())
```

---

## 🎯 Features Implemented

✅ **Strategy Builder**
- Visual block-based interface
- 7 technical indicators
- Multiple condition operators
- Configurable actions with SL/TP

✅ **Backtesting Engine**
- Real historical data from yfinance
- Bar-by-bar simulation
- Stop loss / take profit execution
- 6+ performance metrics
- Equity curve visualization

✅ **Virtual Portfolio Simulator**
- Live market data polling
- Real-time trade execution
- P&L tracking
- Holdings management
- Transaction history

✅ **Integration**
- Seamless flow: Builder → Backtest → Live
- Shared indicator/condition engine
- Consistent JSON schema
- Real-time updates

✅ **UI/UX**
- Green theme matching MoneyMitra
- Responsive design
- Interactive charts (Recharts)
- Real-time data updates

---

## 🔮 Future Enhancements

1. **AI Insights**
   - Generate strategy report cards using LLM
   - Suggest improvements based on performance
   - Risk analysis and recommendations

2. **Advanced Features**
   - Multi-timeframe strategies
   - Portfolio-level backtesting (multiple stocks)
   - Advanced order types (trailing SL, limit orders)
   - Risk management rules (max drawdown, position limits)

3. **Data Sources**
   - WebSocket streaming for real-time data
   - Multiple data providers
   - Crypto and forex support

4. **Storage**
   - Replace in-memory storage with PostgreSQL
   - User authentication and authorization
   - Strategy sharing and marketplace

5. **Performance**
   - Vectorized backtesting (faster)
   - Distributed computing for large backtests
   - Caching for frequently used indicators

---

## 📝 Notes

- Currently uses **yfinance** for both historical and live data
- Live data polling interval: 5 minutes (configurable)
- In-memory storage (replace with database for production)
- No authentication yet (use `userId: 'default'` for testing)
- Forward runner uses background threads (consider Celery for production)

---

## 🎓 Educational Value

This system provides:
- **Hands-on learning** about trading strategies
- **Visual understanding** of technical indicators
- **Risk-free practice** with virtual capital
- **Immediate feedback** through metrics and charts
- **Experimentation** with different strategies
- **Real-world experience** without financial risk

Perfect for MoneyMitra's EdTech mission! 🚀
