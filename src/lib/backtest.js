export const runBacktest = async (strategy) => {
  const { symbol, startDate, endDate, rules } = strategy;
  
  // Simulate backtesting with mock data
  return new Promise(resolve => {
    setTimeout(() => {
      const results = generateBacktestResults(symbol, startDate, endDate, rules);
      resolve(results);
    }, 2000);
  });
};

const generateBacktestResults = (symbol, startDate, endDate, rules) => {
  const days = Math.floor((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
  const equityCurve = [];
  const transactions = [];
  
  let capital = 100000;
  let position = 0;
  let price = 1000 + Math.random() * 500;
  
  for (let i = 0; i <= days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Simulate price movement
    const change = (Math.random() - 0.5) * 0.05; // ±5% daily movement
    price = price * (1 + change);
    
    // Simple moving average strategy simulation
    const shouldBuy = Math.random() > 0.7 && position === 0;
    const shouldSell = Math.random() > 0.8 && position > 0;
    
    if (shouldBuy && capital >= price * 10) {
      const shares = Math.floor(capital * 0.1 / price);
      position += shares;
      capital -= shares * price;
      transactions.push({
        date: date.toISOString().split('T')[0],
        type: 'BUY',
        shares,
        price: Math.round(price * 100) / 100
      });
    }
    
    if (shouldSell && position > 0) {
      const shares = Math.floor(position * 0.5);
      position -= shares;
      capital += shares * price;
      transactions.push({
        date: date.toISOString().split('T')[0],
        type: 'SELL',
        shares,
        price: Math.round(price * 100) / 100
      });
    }
    
    const totalValue = capital + (position * price);
    
    equityCurve.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(totalValue * 100) / 100,
      drawdown: Math.max(0, (120000 - totalValue) / 120000 * 100) // Mock drawdown
    });
  }
  
  const finalValue = capital + (position * price);
  const totalReturn = ((finalValue - 100000) / 100000) * 100;
  const maxDrawdown = Math.max(...equityCurve.map(d => d.drawdown));
  const winRate = transactions.filter(t => t.type === 'SELL').length > 0 ? 
    Math.random() * 40 + 40 : 0; // 40-80% win rate
  
  return {
    equityCurve,
    transactions,
    stats: {
      totalReturn: Math.round(totalReturn * 100) / 100,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      winRate: Math.round(winRate * 100) / 100,
      totalTrades: transactions.length,
      finalCapital: Math.round(finalValue * 100) / 100
    }
  };
};