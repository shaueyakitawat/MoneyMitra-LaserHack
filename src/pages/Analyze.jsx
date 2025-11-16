import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, TrendingUp, TrendingDown, PieChart, Sparkles, AlertTriangle, Target, Award, RefreshCw } from 'lucide-react';
import Card from '../components/Card';

const Analyze = () => {
  const [file, setFile] = useState(null);
  const [portfolio, setPortfolio] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef();

  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    const validTypes = ['application/pdf', 'text/csv', 'application/vnd.ms-excel'];
    
    if (selectedFile && (validTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv'))) {
      setFile(selectedFile);
      setError('');
      setPortfolio(null);
      setAnalysis(null);
      setAiInsights(null);
      
      // Auto-upload and analyze
      await uploadAndAnalyze(selectedFile);
    } else {
      setError('Please select a valid PDF or CSV file');
    }
  };

  const uploadAndAnalyze = async (fileToUpload) => {
    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('file', fileToUpload);
      
      const response = await fetch('http://localhost:5001/upload_portfolio', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPortfolio(data.portfolio);
        setAnalysis(data.analysis);
      } else {
        setError(data.error || 'Failed to analyze portfolio');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Failed to connect to server. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const getAIInsights = async () => {
    if (!portfolio || !analysis) return;
    
    setLoadingAI(true);
    try {
      const response = await fetch('http://localhost:5001/analyze_portfolio_ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolio, analysis })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAiInsights(data.insights);
      } else {
        setError(data.error || 'Failed to generate AI insights');
      }
    } catch (err) {
      console.error('AI insights error:', err);
      setError('Failed to generate AI insights');
    } finally {
      setLoadingAI(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPortfolio(null);
    setAnalysis(null);
    setAiInsights(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div style={{ padding: '40px 0', minHeight: '80vh' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <PieChart size={64} color="var(--primaryCobalt)" style={{ marginBottom: '20px' }} />
            <h1 style={{ marginBottom: '16px', fontSize: '36px', fontWeight: '700' }}>
              AI Portfolio Analyzer
            </h1>
            <p style={{ color: 'var(--textSecondary)', fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>
              Upload your broker statement PDF for deep portfolio analysis with AI-powered insights
            </p>
          </div>

          {/* Upload Section */}
          {!portfolio && (
            <Card style={{ textAlign: 'center' }}>
              <div style={{
                border: '2px dashed var(--border)',
                borderRadius: '12px',
                padding: '60px 20px',
                marginBottom: '20px',
                transition: 'all 0.3s'
              }}>
                <Upload size={64} color="var(--primaryCobalt)" style={{ marginBottom: '16px' }} />
                <h3 style={{ marginBottom: '12px' }}>Upload Broker Statement (PDF or CSV)</h3>
                <p style={{ color: 'var(--textSecondary)', marginBottom: '24px', maxWidth: '500px', margin: '0 auto 24px' }}>
                  CSV format recommended for accuracy. Supports Zerodha, Groww, Upstox exports
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.csv"
                  onChange={handleFileSelect}
                  disabled={loading}
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  style={{
                    padding: '14px 32px',
                    background: loading ? 'var(--neutralBg)' : 'var(--primaryCobalt)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: '0 auto'
                  }}
                >
                  <Upload size={20} />
                  {loading ? 'Analyzing...' : 'Select PDF or CSV File'}
                </button>
              </div>
              <p style={{ color: 'var(--textSecondary)', fontSize: '13px' }}>
                📊 Supports PDF files up to 16MB • Your data is processed securely and not stored
              </p>
            </Card>
          )}

          {/* Error Message */}
          {error && (
            <Card style={{ marginBottom: '24px', border: '2px solid var(--error)', background: 'rgba(239, 68, 68, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertTriangle size={24} color="var(--error)" />
                <div>
                  <h4 style={{ color: 'var(--error)', marginBottom: '4px' }}>Error</h4>
                  <p style={{ margin: 0, color: 'var(--textPrimary)' }}>{error}</p>
                </div>
              </div>
              <button
                onClick={reset}
                style={{
                  marginTop: '16px',
                  padding: '8px 16px',
                  background: 'var(--error)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Try Again
              </button>
            </Card>
          )}

          {/* Portfolio Results */}
          {portfolio && analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Portfolio Overview */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                <Card>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--textSecondary)', fontSize: '14px' }}>Total Invested</span>
                    <Target size={20} color="var(--primaryCobalt)" />
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primaryCobalt)' }}>
                    {formatCurrency(portfolio.total_invested)}
                  </div>
                </Card>

                <Card>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--textSecondary)', fontSize: '14px' }}>Current Value</span>
                    <PieChart size={20} color="var(--accentGold)" />
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--accentGold)' }}>
                    {formatCurrency(portfolio.current_value)}
                  </div>
                </Card>

                <Card>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--textSecondary)', fontSize: '14px' }}>Total P&L</span>
                    {portfolio.total_pnl >= 0 ? <TrendingUp size={20} color="var(--success)" /> : <TrendingDown size={20} color="var(--error)" />}
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: portfolio.total_pnl >= 0 ? 'var(--success)' : 'var(--error)' }}>
                    {formatCurrency(portfolio.total_pnl)}
                  </div>
                  <div style={{ fontSize: '14px', color: portfolio.total_pnl >= 0 ? 'var(--success)' : 'var(--error)', marginTop: '4px' }}>
                    {portfolio.total_pnl >= 0 ? '+' : ''}{portfolio.total_pnl_percent.toFixed(2)}%
                  </div>
                </Card>

                <Card>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ color: 'var(--textSecondary)', fontSize: '14px' }}>Total Holdings</span>
                    <Award size={20} color="var(--primaryCobalt)" />
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--primaryCobalt)' }}>
                    {analysis.total_stocks}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--textSecondary)', marginTop: '4px' }}>
                    {analysis.gainers_count} gainers, {analysis.losers_count} losers
                  </div>
                </Card>
              </div>

              {/* Portfolio Analysis */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <Card>
                  <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Concentration Risk</h3>
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '14px' }}>Top 5 Holdings</span>
                      <span style={{ fontSize: '16px', fontWeight: '700' }}>{analysis.top_5_concentration}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--neutralBg)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        background: analysis.concentration_risk === 'High' ? 'var(--error)' : analysis.concentration_risk === 'Moderate' ? 'var(--warning)' : 'var(--success)',
                        width: `${analysis.top_5_concentration}%`
                      }} />
                    </div>
                  </div>
                  <div style={{ 
                    padding: '8px 12px', 
                    background: analysis.concentration_risk === 'High' ? 'rgba(239, 68, 68, 0.1)' : analysis.concentration_risk === 'Moderate' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    color: analysis.concentration_risk === 'High' ? 'var(--error)' : analysis.concentration_risk === 'Moderate' ? 'var(--warning)' : 'var(--success)',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    textAlign: 'center'
                  }}>
                    {analysis.concentration_risk} Risk
                  </div>
                </Card>

                <Card>
                  <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Best Performer</h3>
                  {analysis.best_performer && (
                    <>
                      <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                        {analysis.best_performer.symbol}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--success)', marginBottom: '8px' }}>
                        +{analysis.best_performer.pnl_percent.toFixed(2)}%
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--textSecondary)' }}>
                        P&L: {formatCurrency(analysis.best_performer.pnl)}
                      </div>
                    </>
                  )}
                </Card>

                <Card>
                  <h3 style={{ marginBottom: '16px', fontSize: '18px' }}>Worst Performer</h3>
                  {analysis.worst_performer && (
                    <>
                      <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
                        {analysis.worst_performer.symbol}
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--error)', marginBottom: '8px' }}>
                        {analysis.worst_performer.pnl_percent.toFixed(2)}%
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--textSecondary)' }}>
                        P&L: {formatCurrency(analysis.worst_performer.pnl)}
                      </div>
                    </>
                  )}
                </Card>
              </div>

              {/* Holdings Table */}
              <Card style={{ marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '20px' }}>Top Holdings</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Stock</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>Qty</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>Avg Price</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>LTP</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>Current Value</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>P&L</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>Weight</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.stocks_by_weightage.map((stock, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '12px', fontWeight: '600' }}>{stock.symbol}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>{stock.quantity}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>₹{stock.avg_price.toFixed(2)}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>₹{stock.current_price.toFixed(2)}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(stock.current_value)}</td>
                          <td style={{ 
                            padding: '12px', 
                            textAlign: 'right',
                            color: stock.pnl >= 0 ? 'var(--success)' : 'var(--error)',
                            fontWeight: '600'
                          }}>
                            {stock.pnl >= 0 ? '+' : ''}{stock.pnl_percent.toFixed(2)}%
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>{stock.weightage.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* AI Insights Section */}
              {!aiInsights ? (
                <Card style={{ textAlign: 'center' }}>
                  <Sparkles size={48} color="var(--accentGold)" style={{ marginBottom: '16px' }} />
                  <h3 style={{ marginBottom: '12px', fontSize: '24px' }}>Get AI-Powered Insights</h3>
                  <p style={{ color: 'var(--textSecondary)', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
                    Receive personalized rebalancing recommendations, risk analysis, and actionable strategies from our AI
                  </p>
                  <button
                    onClick={getAIInsights}
                    disabled={loadingAI}
                    style={{
                      padding: '14px 32px',
                      background: loadingAI ? 'var(--neutralBg)' : 'linear-gradient(135deg, var(--accentGold) 0%, var(--accentAmber) 100%)',
                      color: loadingAI ? 'var(--textSecondary)' : 'var(--ink)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: loadingAI ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: loadingAI ? 'none' : '0 4px 15px rgba(212, 175, 55, 0.3)'
                    }}
                  >
                    <Sparkles size={20} />
                    {loadingAI ? 'Generating Insights...' : 'Get AI Insights'}
                  </button>
                </Card>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <Sparkles size={48} color="var(--accentGold)" style={{ marginBottom: '12px' }} />
                    <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                      AI Portfolio Insights
                    </h2>
                    <p style={{ color: 'var(--textSecondary)' }}>
                      Personalized recommendations for your portfolio
                    </p>
                  </div>

                  {(() => {
                    const sections = [];
                    const lines = aiInsights.split('\n');
                    let currentSection = { title: '', content: [] };
                    
                    lines.forEach((line) => {
                      const trimmed = line.trim();
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

                    if (sections.length === 0) {
                      sections.push({ title: 'AI Analysis', content: aiInsights.split('\n').filter(l => l.trim()) });
                    }

                    return (
                      <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
                        {sections.map((section, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: idx * 0.1 }}
                          >
                            <Card style={{
                              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.03) 0%, rgba(255, 193, 7, 0.03) 100%)',
                              border: '2px solid rgba(212, 175, 55, 0.15)',
                              borderLeft: '6px solid var(--accentGold)',
                              transition: 'all 0.3s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateX(4px)';
                              e.currentTarget.style.boxShadow = '0 8px 20px rgba(212, 175, 55, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateX(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}>
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
                                    fontSize: '18px'
                                  }}>
                                    {idx + 1}
                                  </div>
                                  <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>
                                    {section.title}
                                  </h4>
                                </div>
                              )}
                              
                              <div style={{ fontSize: '15px', lineHeight: '1.8' }}>
                                {section.content.map((text, textIdx) => {
                                  if (text.startsWith('•') || text.startsWith('-') || text.startsWith('*')) {
                                    return (
                                      <div key={textIdx} style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
                                        <span style={{ color: 'var(--accentGold)', fontWeight: '700' }}>•</span>
                                        <span style={{ flex: 1 }}>{text.replace(/^[•\-\*]\s*/, '')}</span>
                                      </div>
                                    );
                                  }
                                  return <p key={textIdx} style={{ margin: '0 0 12px 0' }}>{text}</p>;
                                })}
                              </div>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    );
                  })()}

                  <div style={{
                    padding: '16px 24px',
                    background: 'rgba(212, 175, 55, 0.08)',
                    borderRadius: '12px',
                    border: '2px dashed rgba(212, 175, 55, 0.3)',
                    textAlign: 'center'
                  }}>
                    <p style={{ margin: 0, fontSize: '13px', color: 'var(--textSecondary)' }}>
                      <strong>⚠️ Disclaimer:</strong> AI-generated insights for informational purposes only. 
                      Not financial advice. Please consult a SEBI-registered advisor before investing.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Analyze Another Button */}
              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <button
                  onClick={reset}
                  style={{
                    padding: '12px 24px',
                    background: 'var(--neutralBg)',
                    color: 'var(--textPrimary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <RefreshCw size={18} />
                  Analyze Another Portfolio
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Analyze;
