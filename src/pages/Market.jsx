import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMarketData, getOHLCData } from '../lib/market';
import Card from '../components/Card';

const Market = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [marketData, setMarketData] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState('NIFTY 50');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    loadMarketData();
  }, []);

  useEffect(() => {
    if (selectedSymbol) {
      const ohlcData = getOHLCData(selectedSymbol);
      setChartData(ohlcData.map(d => ({ date: d.date, price: d.close })));
    }
  }, [selectedSymbol]);

  const loadMarketData = async () => {
    try {
      const data = await getMarketData();
      setMarketData(data);
    } catch (error) {
      console.error('Failed to load market data:', error);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatChange = (change, changePct) => {
    const sign = change >= 0 ? '+' : '';
    const color = change >= 0 ? 'var(--success)' : 'var(--error)';
    
    return (
      <span style={{ color }}>
        {sign}{change.toFixed(2)} ({sign}{changePct.toFixed(2)}%)
      </span>
    );
  };

  if (!marketData) {
    return (
      <div style={{ padding: '40px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px' }}>📈</div>
            <p>{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
            <h1>{t('market.title')}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={() => navigate('/get-report')}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                📊 Get Financial Report
              </button>
              <div style={{ background: 'var(--warning)', color: 'white', padding: '8px 16px', borderRadius: 'var(--radius)', fontSize: '12px', fontWeight: '600' }}>
                {t('market.delayNotice')}
              </div>
            </div>
          </div>

          {/* Indices */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ marginBottom: '20px' }}>{t('market.indices')}</h2>
            <div className="grid grid-4">
              {marketData.indices.map(index => (
                <motion.div
                  key={index.symbol}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    hover 
                    style={{ cursor: 'pointer' }}
                    onClick={() => setSelectedSymbol(index.symbol)}
                  >
                    <div>
                      <h4 style={{ marginBottom: '8px', color: 'var(--ink)' }}>{index.symbol}</h4>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primaryCobalt)', marginBottom: '4px' }}>
                        {index.last.toLocaleString()}
                      </div>
                      <div>
                        {formatChange(index.change, index.changePct)}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div style={{ marginBottom: '40px' }}>
            <Card>
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3>{selectedSymbol} - 30 Day Chart</h3>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                >
                  {marketData.indices.map(index => (
                    <option key={index.symbol} value={index.symbol}>{index.symbol}</option>
                  ))}
                </select>
              </div>
              
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
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
                    dataKey="price" 
                    stroke="var(--primaryCobalt)" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Gainers and Losers */}
          <div className="grid grid-2">
            <div>
              <h2 style={{ marginBottom: '20px', color: 'var(--success)' }}>{t('market.topGainers')}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {marketData.topGainers.map(stock => (
                  <Card key={stock.symbol}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4>{stock.symbol}</h4>
                        <div style={{ fontSize: '18px', fontWeight: '600' }}>
                          {formatCurrency(stock.last)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {formatChange(stock.change, stock.changePct)}
                        <div style={{ fontSize: '12px', color: 'var(--textMuted)' }}>
                          Vol: {stock.volume}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 style={{ marginBottom: '20px', color: 'var(--error)' }}>{t('market.topLosers')}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {marketData.topLosers.map(stock => (
                  <Card key={stock.symbol}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4>{stock.symbol}</h4>
                        <div style={{ fontSize: '18px', fontWeight: '600' }}>
                          {formatCurrency(stock.last)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {formatChange(stock.change, stock.changePct)}
                        <div style={{ fontSize: '12px', color: 'var(--textMuted)' }}>
                          Vol: {stock.volume}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Market;