import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { runBacktest } from '../lib/backtest';
import Card from '../components/Card';

const Backtest = () => {
  const { t } = useTranslation();
  const getDefaultDates = () => {
    const end = new Date();
    end.setDate(end.getDate() - 1); // Yesterday
    const start = new Date();
    start.setFullYear(start.getFullYear() - 1); // One year ago
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  };

  const [strategy, setStrategy] = useState({
    symbol: 'RELIANCE',
    ...getDefaultDates(),
    rules: 'Simple Moving Average Crossover'
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      console.log('Starting backtest with strategy:', strategy);
      const backtestResults = await runBacktest(strategy);
      console.log('Backtest results:', backtestResults);
      setResults(backtestResults);
    } catch (error) {
      console.error('Backtest failed:', error);
      alert('Backtest failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={{ marginBottom: '32px' }}>Strategy Backtesting</h1>

          {/* Strategy Configuration */}
          <Card style={{ marginBottom: '32px' }}>
            <h3 style={{ marginBottom: '20px' }}>Configure Strategy</h3>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-2" style={{ marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Symbol
                  </label>
                  <select
                    value={strategy.symbol}
                    onChange={(e) => setStrategy({ ...strategy, symbol: e.target.value })}
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  >
                    <option value="RELIANCE">RELIANCE</option>
                    <option value="TCS">TCS</option>
                    <option value="HDFC BANK">HDFC BANK</option>
                    <option value="INFOSYS">INFOSYS</option>
                    <option value="ICICI BANK">ICICI BANK</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Strategy
                  </label>
                  <select
                    value={strategy.rules}
                    onChange={(e) => setStrategy({ ...strategy, rules: e.target.value })}
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  >
                    <option value="Simple Moving Average Crossover">SMA Crossover</option>
                    <option value="RSI Mean Reversion">RSI Mean Reversion</option>
                    <option value="Bollinger Bands">Bollinger Bands</option>
                    <option value="Buy and Hold">Buy and Hold</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-2" style={{ marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={strategy.startDate}
                    onChange={(e) => setStrategy({ ...strategy, startDate: e.target.value })}
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={strategy.endDate}
                    onChange={(e) => setStrategy({ ...strategy, endDate: e.target.value })}
                    style={{ width: '100%', padding: '12px', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                {loading ? 'Running Backtest...' : 'Run Backtest'}
              </button>
            </form>
          </Card>

          {/* No results message */}
          {!results && !loading && (
            <Card style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--textMuted)', fontSize: '16px' }}>
                Configure your strategy above and click "Run Backtest" to see results
              </p>
            </Card>
          )}

          {/* Results */}
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Performance Stats */}
              <div className="grid grid-4" style={{ marginBottom: '32px' }}>
                <Card>
                  <div className="statCard">
                    <div className="statValue" style={{ color: results.stats.totalReturn >= 0 ? 'var(--success)' : 'var(--error)' }}>
                      {results.stats.totalReturn}%
                    </div>
                    <div className="statLabel">Total Return</div>
                  </div>
                </Card>
                <Card>
                  <div className="statCard">
                    <div className="statValue" style={{ color: 'var(--error)' }}>
                      {results.stats.maxDrawdown}%
                    </div>
                    <div className="statLabel">Max Drawdown</div>
                  </div>
                </Card>
                <Card>
                  <div className="statCard">
                    <div className="statValue">{results.stats.winRate}%</div>
                    <div className="statLabel">Win Rate</div>
                  </div>
                </Card>
                <Card>
                  <div className="statCard">
                    <div className="statValue">{results.stats.totalTrades}</div>
                    <div className="statLabel">Total Trades</div>
                  </div>
                </Card>
              </div>

              {/* Equity Curve */}
              <Card style={{ marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '20px' }}>Equity Curve</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={results.equityCurve}>
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
                    <Line 
                      type="monotone" 
                      dataKey="drawdown" 
                      stroke="var(--error)" 
                      strokeWidth={1}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Trade History */}
              <Card>
                <h3 style={{ marginBottom: '20px' }}>Trade History</h3>
                {results.transactions.length === 0 ? (
                  <p style={{ color: 'var(--textMuted)', textAlign: 'center', padding: '20px' }}>
                    No trades executed in this backtest
                  </p>
                ) : (
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)' }}>
                          <th style={{ textAlign: 'left', padding: '8px 0', color: 'var(--textMuted)', fontSize: '12px' }}>DATE</th>
                          <th style={{ textAlign: 'center', padding: '8px 0', color: 'var(--textMuted)', fontSize: '12px' }}>TYPE</th>
                          <th style={{ textAlign: 'right', padding: '8px 0', color: 'var(--textMuted)', fontSize: '12px' }}>SHARES</th>
                          <th style={{ textAlign: 'right', padding: '8px 0', color: 'var(--textMuted)', fontSize: '12px' }}>PRICE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.transactions.map((trade, index) => (
                          <tr key={index} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '12px 0', fontSize: '14px' }}>{trade.date}</td>
                            <td style={{ 
                              padding: '12px 0', 
                              textAlign: 'center',
                              color: trade.type === 'BUY' ? 'var(--success)' : 'var(--error)',
                              fontWeight: '600',
                              fontSize: '12px'
                            }}>
                              {trade.type}
                            </td>
                            <td style={{ padding: '12px 0', textAlign: 'right' }}>{trade.shares}</td>
                            <td style={{ padding: '12px 0', textAlign: 'right' }}>{formatCurrency(trade.price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Backtest;