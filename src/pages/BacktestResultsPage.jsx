import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Add spinner animation
const spinnerStyle = document.createElement('style');
spinnerStyle.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
if (!document.head.querySelector('style[data-spinner]')) {
  spinnerStyle.setAttribute('data-spinner', 'true');
  document.head.appendChild(spinnerStyle);
}

export default function BacktestResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const strategyId = searchParams.get('strategyId');
  
  const [isRunning, setIsRunning] = useState(false);
  const [backtestId, setBacktestId] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  
  const [symbol, setSymbol] = useState('RELIANCE.NS');
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2024-01-01');
  const [initialCapital, setInitialCapital] = useState(100000);
  const [strategy, setStrategy] = useState(null);

  // Auto-run backtest when strategy is loaded
  useEffect(() => {
    if (strategyId && !backtestId && !isRunning) {
      runBacktest();
    }
  }, [strategyId]);

  useEffect(() => {
    if (backtestId) {
      // Poll for results
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:5001/backtest/${backtestId}`);
          const data = await response.json();
          
          if (data.backtest.status === 'completed') {
            setResults(data.backtest.results);
            setIsRunning(false);
            clearInterval(interval);
          } else if (data.backtest.status === 'failed') {
            setError(data.backtest.error || 'Backtest failed');
            setIsRunning(false);
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Error fetching backtest results:', err);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [backtestId]);

  const runBacktest = async () => {
    if (!strategyId) {
      alert('No strategy selected');
      return;
    }

    setIsRunning(true);
    setError(null);
    setResults(null);

    try {
      const response = await fetch('http://localhost:5001/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId,
          symbol,
          startDate,
          endDate,
          initialCapital
        })
      });

      const data = await response.json();
      if (data.success) {
        setBacktestId(data.backtestId);
      } else {
        setError('Failed to start backtest');
        setIsRunning(false);
      }
    } catch (err) {
      setError(err.message);
      setIsRunning(false);
    }
  };

  const deployToVirtualPortfolio = async () => {
    try {
      // Create portfolio first
      const portfolioResponse = await fetch('http://localhost:5001/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'default',
          name: 'Virtual Trading Portfolio',
          initialCapital: 100000
        })
      });

      const portfolioData = await portfolioResponse.json();
      if (!portfolioData.success) {
        alert('Failed to create portfolio');
        return;
      }

      // Deploy strategy
      const deployResponse = await fetch('http://localhost:5001/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategyId,
          portfolioId: portfolioData.portfolioId
        })
      });

      const deployData = await deployResponse.json();
      if (deployData.success) {
        alert('Strategy deployed successfully!');
        navigate(`/virtual-portfolio?portfolioId=${portfolioData.portfolioId}`);
      } else {
        alert('Failed to deploy strategy');
      }
    } catch (err) {
      console.error('Error deploying strategy:', err);
      alert('Error deploying strategy');
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <button onClick={() => navigate('/strategy-builder')} style={styles.backButton}>
            ← Back
          </button>
          <span style={styles.headerIcon}>📈</span>
          <h1 style={styles.headerTitle}>Backtest Results</h1>
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Loading State */}
        {isRunning && (
          <div style={styles.loadingPanel}>
            <div style={styles.spinner}></div>
            <h3 style={styles.loadingTitle}>🚀 Running Backtest...</h3>
            <p style={styles.loadingText}>
              Analyzing historical data from {startDate} to {endDate}
            </p>
            <p style={styles.loadingSubtext}>
              This may take 10-30 seconds depending on the date range
            </p>
          </div>
        )}

        {/* Configuration Panel */}
        {!results && !isRunning && (
          <div style={styles.configPanel}>
            <h3 style={styles.panelTitle}>Backtest Configuration</h3>
            
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Symbol:</label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  style={styles.input}
                  placeholder="RELIANCE.NS"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Initial Capital:</label>
                <input
                  type="number"
                  value={initialCapital}
                  onChange={(e) => setInitialCapital(parseFloat(e.target.value))}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>End Date:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            <button
              onClick={runBacktest}
              disabled={isRunning}
              style={{
                ...styles.runButton,
                opacity: isRunning ? 0.6 : 1,
                cursor: isRunning ? 'not-allowed' : 'pointer'
              }}
            >
              {isRunning ? '⏳ Running Backtest...' : '🚀 Run Backtest'}
            </button>

            {error && (
              <div style={styles.errorBox}>
                ❌ {error}
              </div>
            )}
          </div>
        )}

        {/* Results Display */}
        {results && (
          <>
            {/* Metrics Cards */}
            <div style={styles.metricsGrid}>
              <MetricCard
                icon="💰"
                title="Total Return"
                value={`${results.metrics.totalReturnPct >= 0 ? '+' : ''}${results.metrics.totalReturnPct}%`}
                color={results.metrics.totalReturnPct >= 0 ? '#10B981' : '#EF4444'}
              />
              <MetricCard
                icon="📊"
                title="CAGR"
                value={`${results.metrics.cagr}%`}
                color="#3B82F6"
              />
              <MetricCard
                icon="⚡"
                title="Sharpe Ratio"
                value={results.metrics.sharpeRatio.toFixed(2)}
                color="#8B5CF6"
              />
              <MetricCard
                icon="📉"
                title="Max Drawdown"
                value={`${results.metrics.maxDrawdown}%`}
                color="#EF4444"
              />
              <MetricCard
                icon="🎯"
                title="Win Rate"
                value={`${results.metrics.winRate}%`}
                color="#10B981"
              />
              <MetricCard
                icon="💹"
                title="Profit Factor"
                value={results.metrics.profitFactor.toFixed(2)}
                color="#F59E0B"
              />
              <MetricCard
                icon="🔄"
                title="Total Trades"
                value={results.trades.length}
                color="#6366F1"
              />
            </div>

            {/* Summary Section */}
            <div style={styles.summaryPanel}>
              <h3 style={styles.summaryTitle}>📊 Backtest Summary</h3>
              <div style={styles.summaryGrid}>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Period:</span>
                  <span style={styles.summaryValue}>{startDate} to {endDate}</span>
                </div>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Symbol:</span>
                  <span style={styles.summaryValue}>{symbol}</span>
                </div>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Initial Capital:</span>
                  <span style={styles.summaryValue}>₹{initialCapital.toLocaleString()}</span>
                </div>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Final Value:</span>
                  <span style={styles.summaryValue}>₹{results.equityCurve[results.equityCurve.length - 1].value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Total Trades:</span>
                  <span style={styles.summaryValue}>{results.trades.length}</span>
                </div>
                <div style={styles.summaryItem}>
                  <span style={styles.summaryLabel}>Winning Trades:</span>
                  <span style={styles.summaryValue}>{results.trades.filter(t => t.pnl > 0).length}</span>
                </div>
              </div>
            </div>

            {/* Equity Curve */}
            <div style={styles.chartPanel}>
              <h3 style={styles.panelTitle}>Equity Curve</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={results.equityCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="timestamp" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value) => [`₹${value.toFixed(2)}`, 'Portfolio Value']}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={false}
                    name="Portfolio Value"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Trade History */}
            <div style={styles.tradesPanel}>
              <h3 style={styles.panelTitle}>Trade History ({results.trades.length} trades)</h3>
              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.tableHeader}>
                      <th style={styles.th}>Entry Time</th>
                      <th style={styles.th}>Exit Time</th>
                      <th style={styles.th}>Symbol</th>
                      <th style={styles.th}>Side</th>
                      <th style={styles.th}>Qty</th>
                      <th style={styles.th}>Entry Price</th>
                      <th style={styles.th}>Exit Price</th>
                      <th style={styles.th}>P&L</th>
                      <th style={styles.th}>P&L %</th>
                      <th style={styles.th}>Exit Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.trades.map((trade, idx) => (
                      <tr key={idx} style={styles.tableRow}>
                        <td style={styles.td}>{new Date(trade.entryTime).toLocaleDateString()}</td>
                        <td style={styles.td}>{new Date(trade.exitTime).toLocaleDateString()}</td>
                        <td style={styles.td}>{trade.symbol}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            backgroundColor: trade.side === 'BUY' ? '#DCFCE7' : '#FEE2E2',
                            color: trade.side === 'BUY' ? '#059669' : '#DC2626'
                          }}>
                            {trade.side}
                          </span>
                        </td>
                        <td style={styles.td}>{trade.qty.toFixed(2)}</td>
                        <td style={styles.td}>₹{trade.entryPrice.toFixed(2)}</td>
                        <td style={styles.td}>₹{trade.exitPrice.toFixed(2)}</td>
                        <td style={{
                          ...styles.td,
                          color: trade.pnl >= 0 ? '#10B981' : '#EF4444',
                          fontWeight: '600'
                        }}>
                          {trade.pnl >= 0 ? '+' : ''}₹{trade.pnl.toFixed(2)}
                        </td>
                        <td style={{
                          ...styles.td,
                          color: trade.pnlPct >= 0 ? '#10B981' : '#EF4444',
                          fontWeight: '600'
                        }}>
                          {trade.pnlPct >= 0 ? '+' : ''}{trade.pnlPct.toFixed(2)}%
                        </td>
                        <td style={styles.td}>
                          <span style={styles.exitReason}>{trade.exitReason}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Deploy Button */}
            <div style={styles.deploySection}>
              <button onClick={deployToVirtualPortfolio} style={styles.deployButton}>
                🚀 Deploy to Virtual Portfolio
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, color }) {
  return (
    <div style={styles.metricCard}>
      <span style={styles.metricIcon}>{icon}</span>
      <div>
        <p style={styles.metricTitle}>{title}</p>
        <p style={{ ...styles.metricValue, color }}>{value}</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F0FDFA'
  },
  header: {
    padding: '20px 32px',
    background: 'linear-gradient(135deg, #10B981, #059669)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  backButton: {
    background: 'rgba(255, 255, 255, 0.2)',
    border: '1.5px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    padding: '8px 16px',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  headerIcon: {
    fontSize: '32px'
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#FFFFFF',
    margin: 0
  },
  content: {
    padding: '32px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  configPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
    marginBottom: '24px'
  },
  panelTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#059669',
    marginBottom: '24px'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    marginBottom: '24px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  input: {
    padding: '12px 16px',
    border: '1.5px solid #D1FAE5',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none'
  },
  runButton: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #10B981, #059669)',
    border: 'none',
    borderRadius: '10px',
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    transition: 'all 0.3s ease'
  },
  errorBox: {
    marginTop: '16px',
    padding: '16px',
    backgroundColor: '#FEE2E2',
    border: '1.5px solid #FCA5A5',
    borderRadius: '8px',
    color: '#DC2626',
    fontSize: '14px',
    fontWeight: '500'
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    marginBottom: '24px'
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  metricIcon: {
    fontSize: '36px'
  },
  metricTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6B7280',
    margin: '0 0 4px 0'
  },
  metricValue: {
    fontSize: '24px',
    fontWeight: '700',
    margin: 0
  },
  chartPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
    marginBottom: '24px'
  },
  tradesPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
    marginBottom: '24px'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    backgroundColor: '#F0FDFA',
    borderBottom: '2px solid #D1FAE5'
  },
  th: {
    padding: '14px 16px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '700',
    color: '#059669'
  },
  tableRow: {
    borderBottom: '1px solid #E5E7EB'
  },
  td: {
    padding: '14px 16px',
    fontSize: '14px',
    color: '#4B5563'
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600'
  },
  exitReason: {
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#6B7280'
  },
  deploySection: {
    display: 'flex',
    justifyContent: 'center',
    paddingTop: '24px'
  },
  deployButton: {
    padding: '16px 48px',
    background: 'linear-gradient(135deg, #10B981, #059669)',
    border: 'none',
    borderRadius: '12px',
    color: '#FFFFFF',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)',
    transition: 'all 0.3s ease'
  },
  loadingPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '60px 40px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.12)',
    maxWidth: '600px',
    margin: '40px auto'
  },
  spinner: {
    width: '60px',
    height: '60px',
    margin: '0 auto 24px',
    border: '4px solid #D1FAE5',
    borderTop: '4px solid #10B981',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#059669',
    margin: '0 0 12px 0'
  },
  loadingText: {
    fontSize: '16px',
    color: '#4B5563',
    margin: '0 0 8px 0'
  },
  loadingSubtext: {
    fontSize: '14px',
    color: '#9CA3AF',
    margin: 0
  },
  summaryPanel: {
    backgroundColor: '#F0FDFA',
    borderRadius: '12px',
    padding: '24px 32px',
    marginBottom: '24px',
    border: '2px solid #D1FAE5'
  },
  summaryTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#059669',
    margin: '0 0 20px 0'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  summaryLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  summaryValue: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#059669'
  }
};
