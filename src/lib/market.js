export const indices = [
  { symbol: 'NIFTY 50', last: 24150.25, change: 101.75, changePct: 0.42, high: 24200.30, low: 24050.15 },
  { symbol: 'SENSEX', last: 79486.32, change: 234.89, changePct: 0.30, high: 79650.45, low: 79200.10 },
  { symbol: 'NIFTY BANK', last: 51234.67, change: -156.23, changePct: -0.30, high: 51450.90, low: 51100.25 },
  { symbol: 'NIFTY IT', last: 43567.89, change: 289.45, changePct: 0.67, high: 43700.12, low: 43200.33 }
];

export const topGainers = [
  { symbol: 'RELIANCE', last: 2890.45, change: 145.30, changePct: 5.29, volume: '2.3M' },
  { symbol: 'TCS', last: 4123.67, change: 189.23, changePct: 4.81, volume: '1.8M' },
  { symbol: 'HDFC BANK', last: 1678.90, change: 67.45, changePct: 4.19, volume: '3.1M' },
  { symbol: 'INFOSYS', last: 1789.34, change: 71.23, changePct: 4.15, volume: '2.7M' },
  { symbol: 'ICICI BANK', last: 1234.56, change: 48.90, changePct: 4.12, volume: '2.9M' }
];

export const topLosers = [
  { symbol: 'BAJAJ FINANCE', last: 6789.12, change: -289.45, changePct: -4.09, volume: '1.5M' },
  { symbol: 'MARUTI', last: 11234.78, change: -423.67, changePct: -3.63, volume: '987K' },
  { symbol: 'ASIAN PAINTS', last: 3456.89, change: -123.45, changePct: -3.45, volume: '1.2M' },
  { symbol: 'WIPRO', last: 567.23, change: -18.90, changePct: -3.22, volume: '2.1M' },
  { symbol: 'BHARTI AIRTEL', last: 890.45, change: -27.34, changePct: -2.98, volume: '1.7M' }
];

export const getMarketData = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        indices,
        topGainers,
        topLosers,
        lastUpdated: new Date().toISOString()
      });
    }, 500);
  });
};

export const getOHLCData = (symbol) => {
  const days = 30;
  const data = [];
  let price = 1000 + Math.random() * 2000;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const open = price;
    const change = (Math.random() - 0.5) * 100;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * 50;
    const low = Math.min(open, close) - Math.random() * 50;
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.floor(Math.random() * 1000000) + 100000
    });
    
    price = close;
  }
  
  return data;
};