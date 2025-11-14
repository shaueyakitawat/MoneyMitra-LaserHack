import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Save, Trash2, Plus, TrendingUp, TrendingDown, Activity, DollarSign, BarChart3, Zap } from 'lucide-react';
import Card from '../components/Card';

const AlgoBuilder = () => {
  const [strategyBlocks, setStrategyBlocks] = useState([]);
  const [strategyName, setStrategyName] = useState('My Strategy');
  const [backtestResults, setBacktestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [availableStocks, setAvailableStocks] = useState([]);
  const [selectedStock, setSelectedStock] = useState('RELIANCE.NS');
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2024-11-14');

  // Available strategy building blocks
  const blockCategories = {
    indicators: [
      { 
        id: 'sma', 
        name: 'Simple Moving Average (SMA)', 
        icon: <TrendingUp size={20} />,
        color: '#3b82f6',
        params: { period: 20 },
        description: 'Average price over a period'
      },
      { 
        id: 'ema', 
        name: 'Exponential Moving Average (EMA)', 
        icon: <TrendingUp size={20} />,
        color: '#8b5cf6',
        params: { period: 20 },
        description: 'Weighted moving average'
      },
      { 
        id: 'rsi', 
        name: 'Relative Strength Index (RSI)', 
        icon: <Activity size={20} />,
        color: '#f59e0b',
        params: { period: 14, overbought: 70, oversold: 30 },
        description: 'Momentum oscillator (0-100)'
      },
      { 
        id: 'macd', 
        name: 'MACD', 
        icon: <BarChart3 size={20} />,
        color: '#10b981',
        params: { fast: 12, slow: 26, signal: 9 },
        description: 'Trend-following momentum'
      },
      { 
        id: 'bollinger', 
        name: 'Bollinger Bands', 
        icon: <Activity size={20} />,
        color: '#ec4899',
        params: { period: 20, stdDev: 2 },
        description: 'Volatility bands'
      }
    ],
    conditions: [
      { 
        id: 'crossover', 
        name: 'Price Crossover', 
        icon: <Zap size={20} />,
        color: '#06b6d4',
        params: { indicator1: 'price', indicator2: 'sma', direction: 'above' },
        description: 'When price crosses indicator'
      },
      { 
        id: 'threshold', 
        name: 'Threshold Condition', 
        icon: <Zap size={20} />,
        color: '#f97316',
        params: { indicator: 'rsi', operator: '<', value: 30 },
        description: 'Indicator reaches value'
      },
      { 
        id: 'priceChange', 
        name: 'Price Change %', 
        icon: <TrendingDown size={20} />,
        color: '#ef4444',
        params: { percentage: 5, direction: 'up' },
        description: 'Price moves by percentage'
      }
    ],
    actions: [
      { 
        id: 'buy', 
        name: 'Buy', 
        icon: <TrendingUp size={20} />,
        color: '#10b981',
        params: { quantity: 'percentage', value: 10 },
        description: 'Enter long position'
      },
      { 
        id: 'sell', 
        name: 'Sell', 
        icon: <TrendingDown size={20} />,
        color: '#ef4444',
        params: { quantity: 'all' },
        description: 'Exit position'
      },
      { 
        id: 'stopLoss', 
        name: 'Stop Loss', 
        icon: <DollarSign size={20} />,
        color: '#dc2626',
        params: { percentage: 5 },
        description: 'Automatic sell on loss'
      },
      { 
        id: 'takeProfit', 
        name: 'Take Profit', 
        icon: <DollarSign size={20} />,
        color: '#16a34a',
        params: { percentage: 10 },
        description: 'Automatic sell on profit'
      }
    ]
  };

  const addBlock = (category, block) => {
    const newBlock = {
      ...block,
      uniqueId: Date.now() + Math.random(),
      category
    };
    setStrategyBlocks([...strategyBlocks, newBlock]);
  };

  const removeBlock = (uniqueId) => {
    setStrategyBlocks(strategyBlocks.filter(b => b.uniqueId !== uniqueId));
  };

  const updateBlockParam = (uniqueId, paramKey, paramValue) => {
    setStrategyBlocks(strategyBlocks.map(block => 
      block.uniqueId === uniqueId 
        ? { ...block, params: { ...block.params, [paramKey]: paramValue } }
        : block
    ));
  };

  // Fetch available Indian stocks on mount
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetch('http://localhost:5001/algo_stocks');
        const data = await response.json();
        if (data.success) {
          setAvailableStocks(data.stocks);
        }
      } catch (error) {
        console.error('Failed to fetch stocks:', error);
        // Fallback to default list
        setAvailableStocks([
          { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
          { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
          { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' },
          { symbol: 'INFY.NS', name: 'Infosys' }
        ]);
      }
    };
    fetchStocks();
  }, []);

  const runBacktest = async () => {
    if (strategyBlocks.length === 0) {
      alert('Please add at least one block to your strategy');
      return;
    }

    setLoading(true);
    
    try {
      // Clean strategy blocks - only send necessary fields
      const cleanBlocks = strategyBlocks.map(block => ({
        type: block.type || (block.category === 'indicators' ? 'indicator' : block.category === 'conditions' ? 'condition' : 'action'),
        id: block.id,
        category: block.category,
        params: block.params
      }));

      console.log('Sending backtest request:', {
        symbol: selectedStock,
        strategy_blocks: cleanBlocks,
        start_date: startDate,
        end_date: endDate
      });

      // Call real backtest API with actual market data
      const response = await fetch('http://localhost:5001/algo_backtest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: selectedStock,
          strategy_blocks: cleanBlocks,
          start_date: startDate,
          end_date: endDate,
          initial_capital: 100000
        })
      });

      const data = await response.json();
      console.log('Backtest response:', data);
      
      if (data.success) {
        setBacktestResults({
          totalReturn: data.metrics.total_return.toFixed(2),
          winRate: data.metrics.win_rate.toFixed(1),
          totalTrades: data.metrics.total_trades,
          sharpeRatio: data.metrics.sharpe_ratio.toFixed(2),
          maxDrawdown: data.metrics.max_drawdown.toFixed(2),
          avgTrade: data.metrics.avg_trade.toFixed(2),
          profitFactor: data.metrics.profit_factor.toFixed(2),
          finalCapital: data.metrics.final_capital.toFixed(2)
        });
      } else {
        alert('Backtest failed: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Backtest error:', error);
      alert('Failed to run backtest. Make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const clearStrategy = () => {
    if (confirm('Are you sure you want to clear the entire strategy?')) {
      setStrategyBlocks([]);
      setBacktestResults(null);
    }
  };

  const saveStrategy = () => {
    const strategy = {
      name: strategyName,
      blocks: strategyBlocks,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    const saved = JSON.parse(localStorage.getItem('algoStrategies') || '[]');
    saved.push(strategy);
    localStorage.setItem('algoStrategies', JSON.stringify(saved));
    
    alert(`Strategy "${strategyName}" saved successfully!`);
  };

  return (
    <div style={{ padding: '40px 0', minHeight: '100vh' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <h1 style={{ marginBottom: '12px', fontSize: '42px', fontWeight: '700' }}>
              🎨 Visual Algo Strategy Builder
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--textSecondary)', maxWidth: '700px', margin: '0 auto' }}>
              Build algorithmic trading strategies with drag-and-drop blocks. No coding required!
            </p>
          </div>

          {/* Strategy Configuration */}
          <Card style={{ marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                  Strategy Name
                </label>
                <input
                  type="text"
                  value={strategyName}
                  onChange={(e) => setStrategyName(e.target.value)}
                  placeholder="Enter strategy name..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                  📈 Stock Symbol
                </label>
                <select
                  value={selectedStock}
                  onChange={(e) => setSelectedStock(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {availableStocks.map(stock => (
                    <option key={stock.symbol} value={stock.symbol}>
                      {stock.name} ({stock.symbol})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                  📅 Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                  📅 End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '2px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={runBacktest}
                  disabled={loading || strategyBlocks.length === 0}
                  style={{
                    padding: '12px 24px',
                    background: 'var(--accentGold)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: strategyBlocks.length === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: strategyBlocks.length === 0 ? 0.5 : 1
                  }}
                >
                  <Play size={20} />
                  {loading ? 'Running...' : 'Run Backtest'}
                </button>
                <button
                  onClick={saveStrategy}
                  disabled={strategyBlocks.length === 0}
                  style={{
                    padding: '12px 24px',
                    background: 'var(--primaryCobalt)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: strategyBlocks.length === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: strategyBlocks.length === 0 ? 0.5 : 1
                  }}
                >
                  <Save size={20} />
                  Save
                </button>
                <button
                  onClick={clearStrategy}
                  disabled={strategyBlocks.length === 0}
                  style={{
                    padding: '12px 24px',
                    background: 'var(--error)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: strategyBlocks.length === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: strategyBlocks.length === 0 ? 0.5 : 1
                  }}
                >
                  <Trash2 size={20} />
                  Clear
                </button>
              </div>
            </div>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
            {/* Building Blocks Palette */}
            <div>
              <Card style={{ position: 'sticky', top: '20px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>
                  📦 Building Blocks
                </h3>

                {/* Indicators */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '700', 
                    color: 'var(--textSecondary)', 
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Indicators
                  </div>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {blockCategories.indicators.map(block => (
                      <button
                        key={block.id}
                        onClick={() => addBlock('indicators', block)}
                        style={{
                          padding: '12px',
                          background: 'var(--neutralBg)',
                          border: `2px solid ${block.color}20`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = `${block.color}15`}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--neutralBg)'}
                      >
                        <div style={{ color: block.color }}>{block.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600' }}>{block.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--textSecondary)' }}>
                            {block.description}
                          </div>
                        </div>
                        <Plus size={16} style={{ color: 'var(--textSecondary)' }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditions */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '700', 
                    color: 'var(--textSecondary)', 
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Conditions
                  </div>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {blockCategories.conditions.map(block => (
                      <button
                        key={block.id}
                        onClick={() => addBlock('conditions', block)}
                        style={{
                          padding: '12px',
                          background: 'var(--neutralBg)',
                          border: `2px solid ${block.color}20`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = `${block.color}15`}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--neutralBg)'}
                      >
                        <div style={{ color: block.color }}>{block.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600' }}>{block.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--textSecondary)' }}>
                            {block.description}
                          </div>
                        </div>
                        <Plus size={16} style={{ color: 'var(--textSecondary)' }} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <div style={{ 
                    fontSize: '12px', 
                    fontWeight: '700', 
                    color: 'var(--textSecondary)', 
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Actions
                  </div>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {blockCategories.actions.map(block => (
                      <button
                        key={block.id}
                        onClick={() => addBlock('actions', block)}
                        style={{
                          padding: '12px',
                          background: 'var(--neutralBg)',
                          border: `2px solid ${block.color}20`,
                          borderRadius: '8px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = `${block.color}15`}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--neutralBg)'}
                      >
                        <div style={{ color: block.color }}>{block.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '600' }}>{block.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--textSecondary)' }}>
                            {block.description}
                          </div>
                        </div>
                        <Plus size={16} style={{ color: 'var(--textSecondary)' }} />
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Strategy Canvas */}
            <div>
              <Card style={{ minHeight: '500px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>
                  🎯 Your Strategy
                </h3>

                {strategyBlocks.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '80px 20px',
                    border: '2px dashed var(--border)',
                    borderRadius: '12px',
                    color: 'var(--textSecondary)'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
                    <h4 style={{ marginBottom: '8px', fontSize: '18px' }}>Start Building Your Strategy</h4>
                    <p style={{ fontSize: '14px' }}>
                      Click on blocks from the left panel to add them to your strategy
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {strategyBlocks.map((block, index) => (
                      <motion.div
                        key={block.uniqueId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          padding: '16px',
                          background: 'var(--neutralBg)',
                          border: `2px solid ${block.color}40`,
                          borderRadius: '12px',
                          position: 'relative'
                        }}
                      >
                        {/* Block Header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                          <div style={{ 
                            width: '32px', 
                            height: '32px', 
                            background: `${block.color}20`,
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: block.color
                          }}>
                            {block.icon}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', fontSize: '14px' }}>{block.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--textSecondary)' }}>
                              {block.category.charAt(0).toUpperCase() + block.category.slice(1)}
                            </div>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--textSecondary)', fontWeight: '600' }}>
                            #{index + 1}
                          </div>
                          <button
                            onClick={() => removeBlock(block.uniqueId)}
                            style={{
                              background: 'var(--error)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '6px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Block Parameters */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                          gap: '12px',
                          paddingTop: '12px',
                          borderTop: '1px solid var(--border)'
                        }}>
                          {Object.entries(block.params).map(([key, value]) => (
                            <div key={key}>
                              <label style={{ 
                                display: 'block', 
                                fontSize: '11px', 
                                fontWeight: '600', 
                                color: 'var(--textSecondary)',
                                marginBottom: '4px',
                                textTransform: 'uppercase'
                              }}>
                                {key}
                              </label>
                              {typeof value === 'number' ? (
                                <input
                                  type="number"
                                  value={value}
                                  onChange={(e) => updateBlockParam(block.uniqueId, key, Number(e.target.value))}
                                  style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid var(--border)',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '600'
                                  }}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={value}
                                  onChange={(e) => updateBlockParam(block.uniqueId, key, e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '8px',
                                    border: '1px solid var(--border)',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: '600'
                                  }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Backtest Results */}
              {backtestResults && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ marginTop: '24px' }}
                >
                  <Card>
                    <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '700' }}>
                      📊 Backtest Results
                    </h3>
                    
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                      gap: '16px' 
                    }}>
                      <div style={{ 
                        padding: '16px', 
                        background: backtestResults.totalReturn >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '12px',
                        border: `2px solid ${backtestResults.totalReturn >= 0 ? '#10b981' : '#ef4444'}40`
                      }}>
                        <div style={{ fontSize: '12px', color: 'var(--textSecondary)', marginBottom: '4px' }}>
                          Total Return
                        </div>
                        <div style={{ 
                          fontSize: '28px', 
                          fontWeight: '700',
                          color: backtestResults.totalReturn >= 0 ? '#10b981' : '#ef4444'
                        }}>
                          {backtestResults.totalReturn}%
                        </div>
                      </div>

                      <div style={{ padding: '16px', background: 'var(--neutralBg)', borderRadius: '12px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--textSecondary)', marginBottom: '4px' }}>
                          Win Rate
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: '700' }}>
                          {backtestResults.winRate}%
                        </div>
                      </div>

                      <div style={{ padding: '16px', background: 'var(--neutralBg)', borderRadius: '12px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--textSecondary)', marginBottom: '4px' }}>
                          Total Trades
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: '700' }}>
                          {backtestResults.totalTrades}
                        </div>
                      </div>

                      <div style={{ padding: '16px', background: 'var(--neutralBg)', borderRadius: '12px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--textSecondary)', marginBottom: '4px' }}>
                          Sharpe Ratio
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: '700' }}>
                          {backtestResults.sharpeRatio}
                        </div>
                      </div>

                      <div style={{ padding: '16px', background: 'var(--neutralBg)', borderRadius: '12px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--textSecondary)', marginBottom: '4px' }}>
                          Max Drawdown
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444' }}>
                          -{backtestResults.maxDrawdown}%
                        </div>
                      </div>

                      <div style={{ padding: '16px', background: 'var(--neutralBg)', borderRadius: '12px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--textSecondary)', marginBottom: '4px' }}>
                          Profit Factor
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: '700' }}>
                          {backtestResults.profitFactor}
                        </div>
                      </div>
                    </div>

                    <div style={{ 
                      marginTop: '20px', 
                      padding: '16px', 
                      background: 'rgba(212, 175, 55, 0.1)',
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}>
                      <strong>💡 Note:</strong> These are simulated results based on your strategy configuration. 
                      Real market conditions may vary significantly. Always paper trade before using real capital.
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AlgoBuilder;
