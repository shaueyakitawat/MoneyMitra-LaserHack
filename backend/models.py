"""
Database models for Strategy Builder, Backtesting, and Virtual Portfolio
"""
from datetime import datetime
from typing import Dict, List, Optional
import json

# Since we don't have SQLAlchemy setup yet, using simple classes
# In production, these would be SQLAlchemy models

class Strategy:
    """Trading strategy with indicator blocks and rules"""
    def __init__(self, strategy_id: str, name: str, user_id: str, 
                 symbols: List[str], timeframe: str, blocks: List[Dict]):
        self.strategy_id = strategy_id
        self.name = name
        self.user_id = user_id
        self.symbols = symbols
        self.timeframe = timeframe
        self.blocks = blocks
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
    
    def to_dict(self):
        return {
            'strategyId': self.strategy_id,
            'name': self.name,
            'userId': self.user_id,
            'symbols': self.symbols,
            'timeframe': self.timeframe,
            'blocks': self.blocks,
            'createdAt': self.created_at.isoformat(),
            'updatedAt': self.updated_at.isoformat()
        }


class Backtest:
    """Backtest job and results"""
    def __init__(self, backtest_id: str, strategy_id: str, symbol: str,
                 start_date: str, end_date: str, initial_capital: float = 100000):
        self.backtest_id = backtest_id
        self.strategy_id = strategy_id
        self.symbol = symbol
        self.start_date = start_date
        self.end_date = end_date
        self.initial_capital = initial_capital
        self.status = 'pending'  # pending, running, completed, failed
        self.results = None
        self.error = None
        self.created_at = datetime.utcnow()
        self.completed_at = None
    
    def to_dict(self):
        return {
            'backtestId': self.backtest_id,
            'strategyId': self.strategy_id,
            'symbol': self.symbol,
            'startDate': self.start_date,
            'endDate': self.end_date,
            'initialCapital': self.initial_capital,
            'status': self.status,
            'results': self.results,
            'error': self.error,
            'createdAt': self.created_at.isoformat(),
            'completedAt': self.completed_at.isoformat() if self.completed_at else None
        }


class Portfolio:
    """Virtual trading portfolio"""
    def __init__(self, portfolio_id: str, user_id: str, name: str,
                 initial_capital: float = 100000):
        self.portfolio_id = portfolio_id
        self.user_id = user_id
        self.name = name
        self.initial_capital = initial_capital
        self.cash = initial_capital
        self.holdings = {}  # symbol -> {qty, avgPrice, currentPrice, pnl}
        self.trades = []
        self.equity_curve = []
        self.created_at = datetime.utcnow()
    
    def to_dict(self):
        total_value = self.cash + sum(
            h['qty'] * h['currentPrice'] 
            for h in self.holdings.values()
        )
        return {
            'portfolioId': self.portfolio_id,
            'userId': self.user_id,
            'name': self.name,
            'initialCapital': self.initial_capital,
            'cash': self.cash,
            'totalValue': total_value,
            'pnl': total_value - self.initial_capital,
            'pnlPct': ((total_value - self.initial_capital) / self.initial_capital) * 100,
            'holdings': self.holdings,
            'trades': self.trades[-50:],  # Last 50 trades
            'equityCurve': self.equity_curve[-100:],  # Last 100 points
            'createdAt': self.created_at.isoformat()
        }


class Trade:
    """Individual trade record"""
    def __init__(self, trade_id: str, portfolio_id: str, symbol: str,
                 side: str, quantity: float, price: float, 
                 stop_loss: Optional[float] = None,
                 take_profit: Optional[float] = None):
        self.trade_id = trade_id
        self.portfolio_id = portfolio_id
        self.symbol = symbol
        self.side = side  # BUY, SELL
        self.quantity = quantity
        self.price = price
        self.stop_loss = stop_loss
        self.take_profit = take_profit
        self.status = 'open'  # open, closed
        self.exit_price = None
        self.exit_reason = None  # stop-loss, take-profit, logic, manual
        self.pnl = 0.0
        self.entry_time = datetime.utcnow()
        self.exit_time = None
    
    def to_dict(self):
        return {
            'tradeId': self.trade_id,
            'portfolioId': self.portfolio_id,
            'symbol': self.symbol,
            'side': self.side,
            'quantity': self.quantity,
            'entryPrice': self.price,
            'exitPrice': self.exit_price,
            'stopLoss': self.stop_loss,
            'takeProfit': self.take_profit,
            'status': self.status,
            'exitReason': self.exit_reason,
            'pnl': self.pnl,
            'pnlPct': (self.pnl / (self.price * self.quantity)) * 100 if self.quantity > 0 else 0,
            'entryTime': self.entry_time.isoformat(),
            'exitTime': self.exit_time.isoformat() if self.exit_time else None
        }


class DeployedStrategy:
    """Active forward-testing strategy"""
    def __init__(self, deployment_id: str, strategy_id: str, portfolio_id: str,
                 symbols: List[str]):
        self.deployment_id = deployment_id
        self.strategy_id = strategy_id
        self.portfolio_id = portfolio_id
        self.symbols = symbols
        self.status = 'active'  # active, paused, stopped
        self.positions = {}  # symbol -> trade_id
        self.last_update = datetime.utcnow()
        self.deployed_at = datetime.utcnow()
    
    def to_dict(self):
        return {
            'deploymentId': self.deployment_id,
            'strategyId': self.strategy_id,
            'portfolioId': self.portfolio_id,
            'symbols': self.symbols,
            'status': self.status,
            'positions': self.positions,
            'lastUpdate': self.last_update.isoformat(),
            'deployedAt': self.deployed_at.isoformat()
        }


# In-memory storage (replace with SQLAlchemy + PostgreSQL in production)
strategies_db = {}
backtests_db = {}
portfolios_db = {}
trades_db = {}
deployments_db = {}
