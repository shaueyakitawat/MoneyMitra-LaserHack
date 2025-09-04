const PORTFOLIO_KEY = 'jainvest_portfolio';

const defaultPortfolio = {
  cash: 100000,
  positions: [],
  transactions: [],
  totalValue: 100000
};

export const getPortfolio = () => {
  try {
    const data = localStorage.getItem(PORTFOLIO_KEY);
    return data ? JSON.parse(data) : defaultPortfolio;
  } catch {
    return defaultPortfolio;
  }
};

export const savePortfolio = (portfolio) => {
  localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(portfolio));
};

export const buyStock = (symbol, quantity, price) => {
  const portfolio = getPortfolio();
  const cost = quantity * price;
  
  if (portfolio.cash < cost) {
    throw new Error('Insufficient funds');
  }
  
  const existingPosition = portfolio.positions.find(p => p.symbol === symbol);
  
  if (existingPosition) {
    const totalShares = existingPosition.quantity + quantity;
    const totalCost = (existingPosition.averagePrice * existingPosition.quantity) + cost;
    existingPosition.averagePrice = totalCost / totalShares;
    existingPosition.quantity = totalShares;
  } else {
    portfolio.positions.push({
      symbol,
      quantity,
      averagePrice: price,
      currentPrice: price
    });
  }
  
  portfolio.cash -= cost;
  portfolio.transactions.push({
    id: Date.now(),
    type: 'BUY',
    symbol,
    quantity,
    price,
    total: cost,
    timestamp: new Date().toISOString()
  });
  
  savePortfolio(portfolio);
  return portfolio;
};

export const sellStock = (symbol, quantity, price) => {
  const portfolio = getPortfolio();
  const position = portfolio.positions.find(p => p.symbol === symbol);
  
  if (!position || position.quantity < quantity) {
    throw new Error('Insufficient shares');
  }
  
  const proceeds = quantity * price;
  
  if (position.quantity === quantity) {
    portfolio.positions = portfolio.positions.filter(p => p.symbol !== symbol);
  } else {
    position.quantity -= quantity;
  }
  
  portfolio.cash += proceeds;
  portfolio.transactions.push({
    id: Date.now(),
    type: 'SELL',
    symbol,
    quantity,
    price,
    total: proceeds,
    timestamp: new Date().toISOString()
  });
  
  savePortfolio(portfolio);
  return portfolio;
};

export const updatePortfolioPrices = (marketData) => {
  const portfolio = getPortfolio();
  
  portfolio.positions.forEach(position => {
    const marketPrice = getRandomPrice(position.symbol);
    position.currentPrice = marketPrice;
  });
  
  portfolio.totalValue = portfolio.cash + portfolio.positions.reduce((total, pos) => {
    return total + (pos.quantity * pos.currentPrice);
  }, 0);
  
  savePortfolio(portfolio);
  return portfolio;
};

const getRandomPrice = (symbol) => {
  const basePrice = 1000 + (symbol.charCodeAt(0) * 10);
  const variation = (Math.random() - 0.5) * 200;
  return Math.round((basePrice + variation) * 100) / 100;
};