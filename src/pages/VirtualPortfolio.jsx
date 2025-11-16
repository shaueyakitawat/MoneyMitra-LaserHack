import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function VirtualPortfolio() {
  const [searchParams] = useSearchParams();
  const portfolioId = searchParams.get('portfolioId');
  
  const [portfolio, setPortfolio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (portfolioId) {
      fetchPortfolio();
      // Poll for updates every 5 seconds
      const interval = setInterval(fetchPortfolio, 5000);
      return () => clearInterval(interval);
    }
  }, [portfolioId]);

  const fetchPortfolio = async () => {
    try {
      const response = await fetch(`http://localhost:5001/portfolio/${portfolioId}`);
      const data = await response.json();
      
      if (data.success) {
        setPortfolio(data.portfolio);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loader}>
          <div style={styles.spinner}></div>
          <p style={styles.loaderText}>Loading Portfolio...</p>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          ❌ Portfolio not found
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const holdingsData = Object.entries(portfolio.holdings).map(([symbol, holding]) => ({
    name: symbol,
    value: holding.qty * holding.currentPrice
  }));

  const totalHoldingsValue = holdingsData.reduce((sum, h) => sum + h.value, 0);
  const pieData = [
    ...holdingsData,
    { name: 'Cash', value: portfolio.cash }
  ];

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={styles.headerIcon}>💼</span>
          <div>
            <h1 style={styles.headerTitle}>{portfolio.name}</h1>
            <p style={styles.headerSubtitle}>Live Virtual Trading</p>
          </div>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.statusBadge}>
            <span style={styles.statusDot}></span>
            LIVE
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <SummaryCard
          icon="💰"
          title="Total Value"
          value={`₹${portfolio.totalValue.toLocaleString()}`}
          subtitle={`Initial: ₹${portfolio.initialCapital.toLocaleString()}`}
          color="#10B981"
        />
        <SummaryCard
          icon={portfolio.pnl >= 0 ? '📈' : '📉'}
          title="Total P&L"
          value={`${portfolio.pnl >= 0 ? '+' : ''}₹${portfolio.pnl.toLocaleString()}`}
          subtitle={`${portfolio.pnlPct >= 0 ? '+' : ''}${portfolio.pnlPct.toFixed(2)}%`}
          color={portfolio.pnl >= 0 ? '#10B981' : '#EF4444'}
        />
        <SummaryCard
          icon="💵"
          title="Cash Available"
          value={`₹${portfolio.cash.toLocaleString()}`}
          subtitle={`${((portfolio.cash / portfolio.totalValue) * 100).toFixed(1)}% of total`}
          color="#3B82F6"
        />
        <SummaryCard
          icon="📊"
          title="Holdings Value"
          value={`₹${totalHoldingsValue.toLocaleString()}`}
          subtitle={`${Object.keys(portfolio.holdings).length} positions`}
          color="#8B5CF6"
        />
      </div>

      {/* Charts Row */}
      <div style={styles.chartsRow}>
        {/* Equity Curve */}
        <div style={styles.chartPanel}>
          <h3 style={styles.panelTitle}>Portfolio Performance</h3>
          {portfolio.equityCurve.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={portfolio.equityCurve}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(value) => [`₹${value.toFixed(2)}`, 'Value']}
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={styles.emptyChart}>
              <p>No performance data yet</p>
            </div>
          )}
        </div>

        {/* Asset Allocation */}
        <div style={styles.chartPanel}>
          <h3 style={styles.panelTitle}>Asset Allocation</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={styles.emptyChart}>
              <p>No holdings yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Holdings Table */}
      <div style={styles.tablePanel}>
        <h3 style={styles.panelTitle}>Current Holdings</h3>
        {Object.keys(portfolio.holdings).length > 0 ? (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Symbol</th>
                  <th style={styles.th}>Quantity</th>
                  <th style={styles.th}>Avg Price</th>
                  <th style={styles.th}>Current Price</th>
                  <th style={styles.th}>Market Value</th>
                  <th style={styles.th}>P&L</th>
                  <th style={styles.th}>P&L %</th>
                  <th style={styles.th}>Stop Loss</th>
                  <th style={styles.th}>Take Profit</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(portfolio.holdings).map(([symbol, holding]) => (
                  <tr key={symbol} style={styles.tableRow}>
                    <td style={styles.td}>
                      <span style={styles.symbolBadge}>{symbol}</span>
                    </td>
                    <td style={styles.td}>{holding.qty.toFixed(2)}</td>
                    <td style={styles.td}>₹{holding.avgPrice.toFixed(2)}</td>
                    <td style={styles.td}>₹{holding.currentPrice.toFixed(2)}</td>
                    <td style={styles.td}>₹{(holding.qty * holding.currentPrice).toFixed(2)}</td>
                    <td style={{
                      ...styles.td,
                      color: holding.pnl >= 0 ? '#10B981' : '#EF4444',
                      fontWeight: '600'
                    }}>
                      {holding.pnl >= 0 ? '+' : ''}₹{holding.pnl.toFixed(2)}
                    </td>
                    <td style={{
                      ...styles.td,
                      color: holding.pnlPct >= 0 ? '#10B981' : '#EF4444',
                      fontWeight: '600'
                    }}>
                      {holding.pnlPct >= 0 ? '+' : ''}{holding.pnlPct.toFixed(2)}%
                    </td>
                    <td style={styles.td}>
                      {holding.stopLoss ? `₹${holding.stopLoss.toFixed(2)}` : '-'}
                    </td>
                    <td style={styles.td}>
                      {holding.takeProfit ? `₹${holding.takeProfit.toFixed(2)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No holdings yet. Strategy will execute trades automatically.</p>
          </div>
        )}
      </div>

      {/* Recent Trades */}
      <div style={styles.tablePanel}>
        <h3 style={styles.panelTitle}>Recent Trades</h3>
        {portfolio.trades.length > 0 ? (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.th}>Time</th>
                  <th style={styles.th}>Symbol</th>
                  <th style={styles.th}>Side</th>
                  <th style={styles.th}>Quantity</th>
                  <th style={styles.th}>Entry Price</th>
                  <th style={styles.th}>Exit Price</th>
                  <th style={styles.th}>P&L</th>
                  <th style={styles.th}>Exit Reason</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.trades.slice().reverse().map((trade, idx) => (
                  <tr key={idx} style={styles.tableRow}>
                    <td style={styles.td}>{new Date(trade.entryTime).toLocaleString()}</td>
                    <td style={styles.td}>
                      <span style={styles.symbolBadge}>{trade.symbol}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.sideBadge,
                        backgroundColor: trade.side === 'BUY' ? '#DCFCE7' : '#FEE2E2',
                        color: trade.side === 'BUY' ? '#059669' : '#DC2626'
                      }}>
                        {trade.side}
                      </span>
                    </td>
                    <td style={styles.td}>{trade.quantity.toFixed(2)}</td>
                    <td style={styles.td}>₹{trade.entryPrice.toFixed(2)}</td>
                    <td style={styles.td}>
                      {trade.exitPrice ? `₹${trade.exitPrice.toFixed(2)}` : '-'}
                    </td>
                    <td style={{
                      ...styles.td,
                      color: trade.pnl >= 0 ? '#10B981' : '#EF4444',
                      fontWeight: '600'
                    }}>
                      {trade.pnl !== 0 ? `${trade.pnl >= 0 ? '+' : ''}₹${trade.pnl.toFixed(2)}` : '-'}
                    </td>
                    <td style={styles.td}>
                      {trade.exitReason || '-'}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadgeSmall,
                        backgroundColor: trade.status === 'open' ? '#DBEAFE' : '#F3F4F6',
                        color: trade.status === 'open' ? '#1D4ED8' : '#6B7280'
                      }}>
                        {trade.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No trades executed yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ icon, title, value, subtitle, color }) {
  return (
    <div style={styles.summaryCard}>
      <span style={styles.summaryIcon}>{icon}</span>
      <div style={styles.summaryContent}>
        <p style={styles.summaryTitle}>{title}</p>
        <p style={{ ...styles.summaryValue, color }}>{value}</p>
        <p style={styles.summarySubtitle}>{subtitle}</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#F0FDFA',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  loader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '16px'
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #D1FAE5',
    borderTop: '4px solid #10B981',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loaderText: {
    fontSize: '16px',
    color: '#059669',
    fontWeight: '600'
  },
  errorBox: {
    margin: '32px',
    padding: '24px',
    backgroundColor: '#FEE2E2',
    border: '1.5px solid #FCA5A5',
    borderRadius: '12px',
    color: '#DC2626',
    fontSize: '16px',
    fontWeight: '600',
    textAlign: 'center'
  },
  header: {
    padding: '24px 32px',
    background: 'linear-gradient(135deg, #10B981, #059669)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  headerIcon: {
    fontSize: '40px'
  },
  headerTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#FFFFFF',
    margin: 0
  },
  headerSubtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.9)',
    margin: '4px 0 0 0'
  },
  headerRight: {
    display: 'flex',
    gap: '12px'
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: '1.5px solid rgba(255, 255, 255, 0.4)',
    borderRadius: '20px',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: '700'
  },
  statusDot: {
    width: '10px',
    height: '10px',
    backgroundColor: '#34D399',
    borderRadius: '50%',
    animation: 'pulse 2s ease-in-out infinite'
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    padding: '32px',
    paddingBottom: '16px'
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
    display: 'flex',
    gap: '16px'
  },
  summaryIcon: {
    fontSize: '40px'
  },
  summaryContent: {
    flex: 1
  },
  summaryTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6B7280',
    margin: '0 0 8px 0'
  },
  summaryValue: {
    fontSize: '26px',
    fontWeight: '700',
    margin: '0 0 4px 0'
  },
  summarySubtitle: {
    fontSize: '12px',
    color: '#9CA3AF',
    margin: 0
  },
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '20px',
    padding: '0 32px 16px'
  },
  chartPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
  },
  panelTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#059669',
    marginBottom: '20px'
  },
  emptyChart: {
    height: '280px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9CA3AF',
    fontSize: '14px'
  },
  tablePanel: {
    margin: '16px 32px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)'
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
  symbolBadge: {
    padding: '4px 10px',
    backgroundColor: '#F0FDFA',
    border: '1px solid #D1FAE5',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#059669'
  },
  sideBadge: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600'
  },
  statusBadgeSmall: {
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600'
  },
  emptyState: {
    padding: '48px',
    textAlign: 'center'
  },
  emptyText: {
    fontSize: '15px',
    color: '#9CA3AF'
  }
};
