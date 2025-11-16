import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend, BarChart, Bar 
} from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw, Activity, Search, Sparkles, BarChart2 } from 'lucide-react';
import Card from '../components/Card';

const Market = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [marketData, setMarketData] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState('NIFTY 50');
  const [chartData, setChartData] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('1mo');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Stock Analysis
  const [stockSearch, setStockSearch] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockInfo, setStockInfo] = useState(null);
  const [stockChartData, setStockChartData] = useState([]);
  const [stockChartPeriod, setStockChartPeriod] = useState('1mo');
  const [loadingStock, setLoadingStock] = useState(false);
  const [stockAIInsights, setStockAIInsights] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    loadMarketData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadMarketData, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedSymbol) {
      loadChartData(selectedSymbol, chartPeriod);
    }
  }, [selectedSymbol, chartPeriod]);

  const loadMarketData = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('http://localhost:5001/market_overview');
      const data = await response.json();
      if (data.success) {
        setMarketData(data);
      }
    } catch (error) {
      console.error('Failed to load market data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const loadChartData = async (symbol, period) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/market_historical/${encodeURIComponent(symbol)}?period=${period}`);
      const data = await response.json();
      if (data.success) {
        setChartData(data.data);
      }
    } catch (error) {
      console.error('Failed to load chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchStock = async () => {
    if (!stockSearch.trim()) return;
    
    const ticker = stockSearch.trim().toUpperCase() + '.NS';
    setSelectedStock(ticker);
    setLoadingStock(true);
    setStockInfo(null);
    setStockChartData([]);
    setStockAIInsights(null);

    try {
      // Load stock info
      const infoResponse = await fetch(`http://localhost:5001/stock_info/${ticker}`);
      const infoData = await infoResponse.json();
      if (infoData.success) {
        setStockInfo(infoData);
      }

      // Load chart data
      const chartResponse = await fetch(`http://localhost:5001/market_historical/${ticker}?period=${stockChartPeriod}`);
      const chartData = await chartResponse.json();
      if (chartData.success) {
        setStockChartData(chartData.data);
      }
    } catch (error) {
      console.error('Failed to load stock data:', error);
    } finally {
      setLoadingStock(false);
    }
  };

  const loadStockChartData = async (period) => {
    if (!selectedStock) return;
    
    try {
      setLoadingStock(true);
      const response = await fetch(`http://localhost:5001/market_historical/${selectedStock}?period=${period}`);
      const data = await response.json();
      if (data.success) {
        setStockChartData(data.data);
      }
    } catch (error) {
      console.error('Failed to load stock chart:', error);
    } finally {
      setLoadingStock(false);
    }
  };

  const getStockAIInsights = async () => {
    if (!stockInfo) return;

    setLoadingAI(true);
    try {
      const response = await fetch('http://localhost:5001/get_response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `Analyze ${stockInfo.name} (${stockInfo.symbol}) stock. Current Price: ₹${stockInfo.currentPrice}, PE Ratio: ${stockInfo.pe}, Market Cap: ₹${(stockInfo.marketCap / 10000000).toFixed(2)} Cr, Sector: ${stockInfo.sector}. Provide: 1) Investment thesis (bullish/bearish), 2) Key strengths, 3) Key risks, 4) Price targets (conservative/aggressive), 5) Recommendation for Indian retail investors. Keep it concise and actionable.`
        })
      });
      const data = await response.json();
      if (data.response) {
        setStockAIInsights(data.response);
      }
    } catch (error) {
      console.error('Failed to get AI insights:', error);
    } finally {
      setLoadingAI(false);
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1>{t('market.title')}</h1>
              <p style={{ color: 'var(--textSecondary)', fontSize: '14px', marginTop: '4px' }}>
                Real-time data powered by Yahoo Finance
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={loadMarketData}
                disabled={refreshing}
                style={{
                  background: 'var(--neutralBg)',
                  color: 'var(--textPrimary)',
                  border: '1px solid var(--border)',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: refreshing ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s'
                }}
              >
                <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={() => navigate('/get-report')}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
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
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Activity size={24} style={{ color: 'var(--primaryCobalt)' }} />
                  <h3>{selectedSymbol}</h3>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {/* Period Selector */}
                  <div style={{ display: 'flex', gap: '4px', background: 'var(--neutralBg)', padding: '4px', borderRadius: '8px' }}>
                    {['1d', '5d', '1mo', '3mo', '6mo', '1y'].map(period => (
                      <button
                        key={period}
                        onClick={() => setChartPeriod(period)}
                        style={{
                          padding: '6px 12px',
                          background: chartPeriod === period ? 'var(--primaryCobalt)' : 'transparent',
                          color: chartPeriod === period ? 'white' : 'var(--textSecondary)',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          transition: 'all 0.2s'
                        }}
                      >
                        {period.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  {/* Index Selector */}
                  <select
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value)}
                    style={{ 
                      padding: '8px 12px', 
                      border: '1px solid var(--border)', 
                      borderRadius: '8px',
                      background: 'var(--neutralBg)',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    {marketData.indices.map(index => (
                      <option key={index.symbol} value={index.symbol}>{index.symbol}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {loading ? (
                <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Activity size={32} style={{ animation: 'pulse 2s infinite' }} />
                    <p style={{ marginTop: '12px', color: 'var(--textSecondary)' }}>Loading chart data...</p>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primaryCobalt)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primaryCobalt)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="var(--textSecondary)" 
                      fontSize={12}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return chartPeriod === '1d' ? date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                      }}
                    />
                    <YAxis 
                      stroke="var(--textSecondary)" 
                      fontSize={12}
                      domain={['dataMin - 100', 'dataMax + 100']}
                      tickFormatter={(value) => value.toLocaleString('en-IN')}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--neutralCard)', 
                        border: '1px solid var(--border)', 
                        borderRadius: '8px',
                        padding: '12px'
                      }}
                      labelFormatter={(value) => new Date(value).toLocaleString('en-IN')}
                      formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Price']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="close" 
                      stroke="var(--primaryCobalt)" 
                      strokeWidth={2}
                      fill="url(#colorPrice)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          {/* Gainers and Losers */}
          <div className="grid grid-2">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <TrendingUp size={24} style={{ color: 'var(--success)' }} />
                <h2 style={{ color: 'var(--success)', margin: 0 }}>{t('market.topGainers')}</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {marketData.topGainers.map(stock => (
                  <motion.div
                    key={stock.symbol}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card hover>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ marginBottom: '4px' }}>{stock.symbol}</h4>
                          <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--primaryCobalt)' }}>
                            {formatCurrency(stock.last)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginBottom: '4px' }}>
                            <TrendingUp size={16} style={{ color: 'var(--success)' }} />
                            {formatChange(stock.change, stock.changePct)}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--textMuted)' }}>
                            Vol: {stock.volume}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <TrendingDown size={24} style={{ color: 'var(--error)' }} />
                <h2 style={{ color: 'var(--error)', margin: 0 }}>{t('market.topLosers')}</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {marketData.topLosers.map(stock => (
                  <motion.div
                    key={stock.symbol}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card hover>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ marginBottom: '4px' }}>{stock.symbol}</h4>
                          <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--primaryCobalt)' }}>
                            {formatCurrency(stock.last)}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginBottom: '4px' }}>
                            <TrendingDown size={16} style={{ color: 'var(--error)' }} />
                            {formatChange(stock.change, stock.changePct)}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--textMuted)' }}>
                            Vol: {stock.volume}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Stock Analysis Section */}
          <div style={{ marginTop: '60px', paddingTop: '40px', borderTop: '2px solid var(--border)' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <h2 style={{ fontSize: '32px', marginBottom: '12px' }}>📊 Individual Stock Analysis</h2>
              <p style={{ color: 'var(--textSecondary)', fontSize: '16px' }}>
                Search any NSE stock for detailed fundamentals, charts, and AI-driven insights
              </p>
            </div>

            {/* Search Bar */}
            <Card>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--textSecondary)' }} />
                  <input
                    type="text"
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && searchStock()}
                    placeholder="Enter stock symbol (e.g., RELIANCE, TCS, INFY)"
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 48px',
                      border: '2px solid var(--border)',
                      borderRadius: '12px',
                      fontSize: '16px',
                      background: 'var(--neutralBg)',
                      transition: 'border-color 0.2s'
                    }}
                  />
                </div>
                <button
                  onClick={searchStock}
                  disabled={!stockSearch.trim() || loadingStock}
                  style={{
                    padding: '16px 32px',
                    background: stockSearch.trim() ? 'var(--primaryCobalt)' : 'var(--neutralBg)',
                    color: stockSearch.trim() ? 'white' : 'var(--textSecondary)',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: stockSearch.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Search size={20} />
                  {loadingStock ? 'Searching...' : 'Analyze'}
                </button>
              </div>
            </Card>

            {/* Stock Details */}
            {stockInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ marginTop: '32px' }}
              >
                {/* Stock Header */}
                <Card>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                      <h3 style={{ fontSize: '28px', marginBottom: '8px' }}>{stockInfo.name}</h3>
                      <p style={{ color: 'var(--textSecondary)', fontSize: '14px' }}>
                        {stockInfo.sector} • {stockInfo.industry}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--primaryCobalt)' }}>
                        ₹{stockInfo.currentPrice?.toLocaleString('en-IN')}
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--textSecondary)', marginTop: '4px' }}>
                        Market Cap: ₹{(stockInfo.marketCap / 10000000).toFixed(2)} Cr
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Fundamentals */}
                <div className="grid grid-4" style={{ marginTop: '24px' }}>
                  <Card>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: 'var(--textSecondary)', marginBottom: '8px' }}>P/E Ratio</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primaryCobalt)' }}>
                        {stockInfo.pe ? stockInfo.pe.toFixed(2) : 'N/A'}
                      </div>
                    </div>
                  </Card>
                  <Card>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: 'var(--textSecondary)', marginBottom: '8px' }}>EPS</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primaryCobalt)' }}>
                        ₹{stockInfo.eps ? stockInfo.eps.toFixed(2) : 'N/A'}
                      </div>
                    </div>
                  </Card>
                  <Card>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: 'var(--textSecondary)', marginBottom: '8px' }}>Div Yield</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success)' }}>
                        {stockInfo.dividendYield ? stockInfo.dividendYield.toFixed(2) : '0.00'}%
                      </div>
                    </div>
                  </Card>
                  <Card>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: 'var(--textSecondary)', marginBottom: '8px' }}>Volume</div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primaryCobalt)' }}>
                        {stockInfo.volume ? (stockInfo.volume / 1000000).toFixed(2) + 'M' : 'N/A'}
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Price Range */}
                <Card style={{ marginTop: '24px' }}>
                  <h4 style={{ marginBottom: '16px' }}>52 Week Range</h4>
                  <div style={{ position: 'relative', height: '40px', background: 'var(--neutralBg)', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{
                      position: 'absolute',
                      left: `${((stockInfo.currentPrice - stockInfo.fiftyTwoWeekLow) / (stockInfo.fiftyTwoWeekHigh - stockInfo.fiftyTwoWeekLow)) * 100}%`,
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '4px',
                      height: '100%',
                      background: 'var(--primaryCobalt)'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '14px' }}>
                    <span style={{ color: 'var(--error)' }}>Low: ₹{stockInfo.fiftyTwoWeekLow?.toLocaleString('en-IN')}</span>
                    <span style={{ fontWeight: '600' }}>Current: ₹{stockInfo.currentPrice?.toLocaleString('en-IN')}</span>
                    <span style={{ color: 'var(--success)' }}>High: ₹{stockInfo.fiftyTwoWeekHigh?.toLocaleString('en-IN')}</span>
                  </div>
                </Card>

                {/* Stock Chart */}
                <Card style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BarChart2 size={20} style={{ color: 'var(--primaryCobalt)' }} />
                      <h4>Price History</h4>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', background: 'var(--neutralBg)', padding: '4px', borderRadius: '8px' }}>
                      {['1d', '5d', '1mo', '3mo', '6mo', '1y'].map(period => (
                        <button
                          key={period}
                          onClick={() => {
                            setStockChartPeriod(period);
                            loadStockChartData(period);
                          }}
                          style={{
                            padding: '6px 12px',
                            background: stockChartPeriod === period ? 'var(--primaryCobalt)' : 'transparent',
                            color: stockChartPeriod === period ? 'white' : 'var(--textSecondary)',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                        >
                          {period.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {loadingStock ? (
                    <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Activity size={32} style={{ animation: 'pulse 2s infinite' }} />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={stockChartData}>
                        <defs>
                          <linearGradient id="stockPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primaryCobalt)" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="var(--primaryCobalt)" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                        <XAxis 
                          dataKey="date" 
                          stroke="var(--textSecondary)" 
                          fontSize={12}
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return stockChartPeriod === '1d' ? date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
                          }}
                        />
                        <YAxis 
                          stroke="var(--textSecondary)" 
                          fontSize={12}
                          domain={['dataMin - 50', 'dataMax + 50']}
                          tickFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'var(--neutralCard)', 
                            border: '1px solid var(--border)', 
                            borderRadius: '8px',
                            padding: '12px'
                          }}
                          formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Price']}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="close" 
                          stroke="var(--primaryCobalt)" 
                          strokeWidth={2}
                          fill="url(#stockPrice)"
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </Card>

                {/* AI Insights */}
                <Card style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Sparkles size={20} style={{ color: 'var(--accentGold)' }} />
                      <h4>AI-Powered Investment Analysis</h4>
                    </div>
                    {!stockAIInsights && (
                      <button
                        onClick={getStockAIInsights}
                        disabled={loadingAI}
                        style={{
                          padding: '10px 20px',
                          background: 'linear-gradient(135deg, var(--accentGold) 0%, var(--accentAmber) 100%)',
                          color: 'var(--ink)',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: loadingAI ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <Sparkles size={16} />
                        {loadingAI ? 'Analyzing...' : 'Get AI Insights'}
                      </button>
                    )}
                  </div>

                  {loadingAI ? (
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                      <Sparkles size={32} style={{ animation: 'pulse 2s infinite', color: 'var(--accentGold)' }} />
                      <p style={{ marginTop: '16px', color: 'var(--textSecondary)' }}>AI is analyzing the stock...</p>
                    </div>
                  ) : stockAIInsights ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      {(() => {
                        // Parse AI insights into sections
                        const insights = stockAIInsights;
                        const sections = [];
                        
                        // Split by numbered sections or headers
                        const lines = insights.split('\n');
                        let currentSection = { title: '', content: [] };
                        
                        lines.forEach((line) => {
                          const trimmed = line.trim();
                          
                          // Detect section headers (lines with ** or numbered like 1., 2., etc.)
                          if (trimmed.match(/^\*\*.*\*\*$/) || trimmed.match(/^\d+[\.)]\s+\*\*/)) {
                            if (currentSection.content.length > 0) {
                              sections.push({ ...currentSection });
                            }
                            currentSection = {
                              title: trimmed.replace(/\*\*/g, '').replace(/^\d+[\.)]\s+/, '').trim(),
                              content: []
                            };
                          } else if (trimmed.length > 0) {
                            currentSection.content.push(trimmed);
                          }
                        });
                        
                        if (currentSection.content.length > 0) {
                          sections.push(currentSection);
                        }

                        // If no sections detected, treat as single block
                        if (sections.length === 0) {
                          sections.push({ title: 'Investment Analysis', content: insights.split('\n').filter(l => l.trim()) });
                        }

                        return (
                          <div style={{ display: 'grid', gap: '16px' }}>
                            {sections.map((section, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: idx * 0.1 }}
                                style={{
                                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.03) 0%, rgba(255, 193, 7, 0.03) 100%)',
                                  border: '2px solid rgba(212, 175, 55, 0.15)',
                                  borderLeft: '6px solid var(--accentGold)',
                                  borderRadius: '12px',
                                  padding: '20px',
                                  transition: 'all 0.3s',
                                  cursor: 'default'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = 'translateX(4px)';
                                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(212, 175, 55, 0.15)';
                                  e.currentTarget.style.borderLeftColor = 'var(--accentAmber)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = 'translateX(0)';
                                  e.currentTarget.style.boxShadow = 'none';
                                  e.currentTarget.style.borderLeftColor = 'var(--accentGold)';
                                }}
                              >
                                {section.title && (
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '16px',
                                    paddingBottom: '12px',
                                    borderBottom: '2px solid rgba(212, 175, 55, 0.1)'
                                  }}>
                                    <div style={{
                                      width: '36px',
                                      height: '36px',
                                      borderRadius: '8px',
                                      background: 'linear-gradient(135deg, var(--accentGold) 0%, var(--accentAmber) 100%)',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: 'var(--ink)',
                                      fontWeight: '700',
                                      fontSize: '18px',
                                      boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                                    }}>
                                      {idx + 1}
                                    </div>
                                    <h4 style={{
                                      margin: 0,
                                      fontSize: '18px',
                                      fontWeight: '700',
                                      color: 'var(--textPrimary)',
                                      flex: 1
                                    }}>
                                      {section.title}
                                    </h4>
                                  </div>
                                )}
                                
                                <div style={{
                                  fontSize: '15px',
                                  lineHeight: '1.8',
                                  color: 'var(--textPrimary)'
                                }}>
                                  {section.content.map((text, textIdx) => {
                                    // Check if it's a bullet point
                                    if (text.startsWith('•') || text.startsWith('-') || text.startsWith('*')) {
                                      return (
                                        <div key={textIdx} style={{
                                          display: 'flex',
                                          gap: '12px',
                                          marginBottom: '10px',
                                          paddingLeft: '8px'
                                        }}>
                                          <span style={{ color: 'var(--accentGold)', fontWeight: '700', fontSize: '18px' }}>•</span>
                                          <span style={{ flex: 1 }}>{text.replace(/^[•\-\*]\s*/, '')}</span>
                                        </div>
                                      );
                                    }
                                    
                                    // Regular paragraph
                                    return (
                                      <p key={textIdx} style={{
                                        margin: '0 0 12px 0',
                                        lineHeight: '1.8'
                                      }}>
                                        {text}
                                      </p>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        );
                      })()}

                      <div style={{
                        marginTop: '20px',
                        padding: '16px 24px',
                        background: 'rgba(212, 175, 55, 0.08)',
                        borderRadius: '12px',
                        border: '2px dashed rgba(212, 175, 55, 0.3)',
                        textAlign: 'center'
                      }}>
                        <p style={{
                          margin: 0,
                          fontSize: '13px',
                          color: 'var(--textSecondary)',
                          lineHeight: '1.6'
                        }}>
                          <strong style={{ color: 'var(--textPrimary)' }}>⚠️ Disclaimer:</strong> AI-generated insights for informational purposes only. 
                          Not financial advice. Please conduct your own research and consult a SEBI-registered advisor before investing.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--textSecondary)' }}>
                      Click "Get AI Insights" to receive personalized investment analysis for this stock
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Market;