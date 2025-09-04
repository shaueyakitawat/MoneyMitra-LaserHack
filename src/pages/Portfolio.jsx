import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getPortfolio, buyStock, sellStock, updatePortfolioPrices } from '../lib/portfolio';
import { topGainers, topLosers } from '../lib/market';
import Card from '../components/Card';

const Portfolio = () => {
  const { t } = useTranslation();
  const [portfolio, setPortfolio] = useState(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeData, setTradeData] = useState({ symbol: '', quantity: '', action: 'BUY' });
  const [error, setError] = useState('');

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = () => {
    const portfolioData = updatePortfolioPrices();
    setPortfolio(portfolioData);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleTrade = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const quantity = parseInt(tradeData.quantity);
      const price = getStockPrice(tradeData.symbol);

      if (tradeData.action === 'BUY') {
        buyStock(tradeData.symbol, quantity, price);
      } else {
        sellStock(tradeData.symbol, quantity, price);
      }

      setShowTradeModal(false);
      setTradeData({ symbol: '', quantity: '', action: 'BUY' });
      loadPortfolio();
    } catch (err) {
      setError(err.message);
    }
  };

  const getStockPrice = (symbol) => {
    const allStocks = [...topGainers, ...topLosers];
    const stock = allStocks.find(s => s.symbol === symbol);
    return stock ? stock.last : 1000 + Math.random() * 2000;
  };

  const openTradeModal = (symbol, action) => {
    setTradeData({ symbol, quantity: '', action });
    setShowTradeModal(true);
    setError('');
  };

  if (!portfolio) {
    return (
      <div style={{ padding: '40px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px' }}>💼</div>
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  const totalPnL = portfolio.positions.reduce((total, pos) => {
    return total + ((pos.currentPrice - pos.averagePrice) * pos.quantity);
  }, 0);

  const pieData = portfolio.positions.map(pos => ({
    name: pos.symbol,
    value: pos.quantity * pos.currentPrice
  }));

  const equityCurveData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const baseValue = 100000;
    const variation = Math.sin(i * 0.2) * 10000 + Math.random() * 5000;
    return {
      date: date.toISOString().split('T')[0],
      value: baseValue + variation + (totalPnL * (i / 29))
    };
  });

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <h1>{t('portfolio.title')}</h1>
            <button onClick={() => openTradeModal('', 'BUY')} className="btn-primary">
              + New Trade
            </button>
          </div>

          {/* Portfolio Stats */}
          <div className="grid grid-4" style={{ marginBottom: '32px' }}>
            <Card>
              <div className="statCard">
                <div className="statValue">{formatCurrency(portfolio.cash)}</div>
                <div className="statLabel">{t('portfolio.cash')}</div>
              </div>
            </Card>
            <Card>
              <div className="statCard">
                <div className="statValue">{formatCurrency(portfolio.totalValue)}</div>
                <div className="statLabel">{t('portfolio.totalValue')}</div>
              </div>
            </Card>
            <Card>
              <div className="statCard">
                <div className="statValue" style={{ color: totalPnL >= 0 ? 'var(--success)' : 'var(--error)' }}>
                  {formatCurrency(totalPnL)}
                </div>
                <div className="statLabel">{t('portfolio.pnl')}</div>
              </div>
            </Card>
            <Card>
              <div className="statCard">
                <div className="statValue">{portfolio.positions.length}</div>
                <div className="statLabel">Holdings</div>
              </div>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-2" style={{ marginBottom: '32px' }}>
            <Card>
              <h3 style={{ marginBottom: '20px' }}>Portfolio Performance</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={equityCurveData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" stroke="var(--textSecondary)" fontSize={12} />
                  <YAxis stroke="var(--textSecondary)" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--neutralCard)', 
                      border: '1px solid var(--border)', 
                      borderRadius: 'var(--radius)' 
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="var(--primaryCobalt)" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {pieData.length > 0 && (
              <Card>
                <h3 style={{ marginBottom: '20px' }}>Asset Allocation</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="var(--primaryCobalt)"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`hsl(${(index * 360) / pieData.length}, 70%, 50%)`} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>

          {/* Holdings */}
          <Card>
            <h3 style={{ marginBottom: '20px' }}>Your Holdings</h3>
            {portfolio.positions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--textMuted)' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
                <p>No positions yet. Start trading to build your portfolio!</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      <th style={{ textAlign: 'left', padding: '12px 0', color: 'var(--textMuted)', fontSize: '12px' }}>SYMBOL</th>
                      <th style={{ textAlign: 'right', padding: '12px 0', color: 'var(--textMuted)', fontSize: '12px' }}>QTY</th>
                      <th style={{ textAlign: 'right', padding: '12px 0', color: 'var(--textMuted)', fontSize: '12px' }}>AVG</th>
                      <th style={{ textAlign: 'right', padding: '12px 0', color: 'var(--textMuted)', fontSize: '12px' }}>LTP</th>
                      <th style={{ textAlign: 'right', padding: '12px 0', color: 'var(--textMuted)', fontSize: '12px' }}>P&L</th>
                      <th style={{ textAlign: 'center', padding: '12px 0', color: 'var(--textMuted)', fontSize: '12px' }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.positions.map(position => {
                      const pnl = (position.currentPrice - position.averagePrice) * position.quantity;
                      return (
                        <tr key={position.symbol} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '16px 0', fontWeight: '600' }}>{position.symbol}</td>
                          <td style={{ padding: '16px 0', textAlign: 'right' }}>{position.quantity}</td>
                          <td style={{ padding: '16px 0', textAlign: 'right' }}>{formatCurrency(position.averagePrice)}</td>
                          <td style={{ padding: '16px 0', textAlign: 'right' }}>{formatCurrency(position.currentPrice)}</td>
                          <td style={{ 
                            padding: '16px 0', 
                            textAlign: 'right', 
                            color: pnl >= 0 ? 'var(--success)' : 'var(--error)',
                            fontWeight: '600'
                          }}>
                            {formatCurrency(pnl)}
                          </td>
                          <td style={{ padding: '16px 0', textAlign: 'center' }}>
                            <button
                              onClick={() => openTradeModal(position.symbol, 'SELL')}
                              className="btn-secondary"
                              style={{ padding: '4px 12px', fontSize: '12px' }}
                            >
                              Sell
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Trade Modal */}
          {showTradeModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card style={{ width: '400px', maxWidth: '90vw' }}>
                  <h3 style={{ marginBottom: '20px' }}>
                    {tradeData.action === 'BUY' ? t('portfolio.buy') : t('portfolio.sell')} Stock
                  </h3>

                  {error && (
                    <div style={{ background: 'var(--error)', color: 'white', padding: '12px', borderRadius: 'var(--radius)', marginBottom: '16px' }}>
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleTrade}>
                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        Stock Symbol
                      </label>
                      <select
                        value={tradeData.symbol}
                        onChange={(e) => setTradeData({ ...tradeData, symbol: e.target.value })}
                        required
                        style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                      >
                        <option value="">Select a stock</option>
                        {[...topGainers, ...topLosers].map(stock => (
                          <option key={stock.symbol} value={stock.symbol}>
                            {stock.symbol} - {formatCurrency(stock.last)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={tradeData.quantity}
                        onChange={(e) => setTradeData({ ...tradeData, quantity: e.target.value })}
                        min="1"
                        required
                        style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                      />
                    </div>

                    {tradeData.symbol && tradeData.quantity && (
                      <div style={{ 
                        background: 'var(--neutralBg)', 
                        padding: '16px', 
                        borderRadius: 'var(--radius)', 
                        marginBottom: '20px' 
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Total Value:</span>
                          <strong>{formatCurrency(getStockPrice(tradeData.symbol) * parseInt(tradeData.quantity || 0))}</strong>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setShowTradeModal(false)}
                        className="btn-secondary"
                        style={{ flex: 1 }}
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="btn-primary"
                        style={{ flex: 1 }}
                      >
                        {tradeData.action === 'BUY' ? t('portfolio.buy') : t('portfolio.sell')}
                      </button>
                    </div>
                  </form>
                </Card>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Portfolio;