import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Globe, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';
import Card from '../components/Card';

const OfficialResources = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [languages, setLanguages] = useState([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [loadingAI, setLoadingAI] = useState({});
  const fetchingRef = useRef(false);
  const initializedRef = useRef(false);

  const languageNames = {
    'en': { name: 'English', flag: '🇬🇧' },
    'hi': { name: 'हिंदी', flag: '🇮🇳' },
    'mr': { name: 'मराठी', flag: '🇮🇳' },
    'gu': { name: 'ગુજરાતી', flag: '🇮🇳' },
    'ta': { name: 'தமிழ்', flag: '🇮🇳' },
    'te': { name: 'తెలుగు', flag: '🇮🇳' },
    'bn': { name: 'বাংলা', flag: '🇮🇳' },
    'kn': { name: 'ಕನ್ನಡ', flag: '🇮🇳' },
    'ml': { name: 'മലയാളം', flag: '🇮🇳' }
  };

  useEffect(() => {
    // Prevent double initialization from React StrictMode
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Fetch supported languages
    fetch('http://localhost:5001/supported_languages')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLanguages(data.languages);
        }
      })
      .catch(err => console.error('Error fetching languages:', err));

    // Fetch initial content
    fetchContent('en');
  }, []);

  const fetchContent = async (language) => {
    // Prevent duplicate calls using ref
    if (fetchingRef.current) {
      console.log('⚠️ Already fetching, skipping duplicate call');
      return;
    }
    
    fetchingRef.current = true;
    setLoading(true);
    setError('');
    setContent([]); // Clear previous content
    setTotalArticles(0);
    
    // Create unique session ID to prevent article duplication
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('🔵 Starting fetch with session:', sessionId);
    
    try {
      // TRUE progressive loading - fetch articles one by one
      let articleIndex = 0;
      let hasMore = true;
      let total = 0;
      
      while (hasMore) {
        const response = await fetch('http://localhost:5001/sebi_content_stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            language: language,
            article_index: articleIndex,
            session_id: sessionId,
            include_ai_analysis: false,  // Don't fetch AI by default
            news_type: 'general'  // Filter for general market news only
          })
        });

        const data = await response.json();
        
        if (data.success) {
          if (data.article) {
            // Add article immediately to UI
            setContent(prev => [...prev, data.article]);
            
            // Update total on first fetch
            if (articleIndex === 0) {
              setTotalArticles(data.total);
              total = data.total;
            }
          }
          
          hasMore = data.has_more;
          articleIndex++;
          
          // If all articles loaded, stop loading indicator
          if (!hasMore) {
            setLoading(false);
          }
        } else {
          setError(data.error || 'Failed to fetch content');
          setLoading(false);
          break;
        }
      }
      
      setSelectedLanguage(language);
    } catch (err) {
      console.error('Error:', err);
      setError('Network error. Please ensure backend is running on http://localhost:5001');
      setLoading(false);
    } finally {
      fetchingRef.current = false;
      console.log('✅ Fetch complete, released lock');
    }
  };

  const fetchAIAnalysis = async (articleId, articleTitle, articleContent) => {
    setLoadingAI(prev => ({ ...prev, [articleId]: true }));
    
    try {
      const response = await fetch('http://localhost:5001/get_ai_analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: articleTitle,
          content: articleContent,
          language: selectedLanguage
        })
      });

      const data = await response.json();
      
      if (data.success && data.ai_analysis) {
        // Update the specific article with AI analysis
        setContent(prev => prev.map(item => 
          item.id === articleId 
            ? { 
                ...item, 
                ai_analysis: data.ai_analysis,
                summary: data.ai_analysis.summary,
                action: data.ai_analysis.action,
                sentiment: data.ai_analysis.sentiment,
                summary_translated: data.ai_analysis.summary_translated
              }
            : item
        ));
      } else {
        setError('Failed to get AI analysis');
      }
    } catch (err) {
      console.error('AI Analysis Error:', err);
      setError('Failed to fetch AI analysis');
    } finally {
      setLoadingAI(prev => ({ ...prev, [articleId]: false }));
    }
  };

  const handleLanguageChange = (language) => {
    fetchContent(language);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Regulatory': return '#3b82f6';
      case 'Education': return '#10b981';
      case 'Market': return '#f59e0b';
      case 'Market News': return '#8b5cf6';
      case 'Market Analysis': return '#ec4899';
      case 'Market Trends': return '#f97316';
      case 'Monetary Policy': return '#14b8a6';
      default: return '#6366f1';
    }
  };

  const getActionColor = (action) => {
    switch (action?.toUpperCase()) {
      case 'BUY': return '#10b981';
      case 'SELL': return '#ef4444';
      case 'HOLD': return '#f59e0b';
      case 'WATCH': return '#6366f1';
      default: return '#6b7280';
    }
  };

  const getSentimentEmoji = (sentiment) => {
    switch (sentiment) {
      case 'Bullish': return '🐂';
      case 'Bearish': return '🐻';
      case 'Neutral': return '⚖️';
      default: return '📊';
    }
  };

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ marginBottom: '16px', fontSize: '36px', fontWeight: '700' }}>
              📊 General Market News & Updates
            </h1>
            <p style={{ color: 'var(--textSecondary)', fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>
              Real-time market updates on NIFTY, SENSEX, sectors, policy changes & economic trends with AI-powered analysis
            </p>
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ background: 'var(--primaryCobalt)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                🤖 AI-Powered Analysis
              </span>
              <span style={{ background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                📊 Buy/Sell/Hold Signals
              </span>
              <span style={{ background: '#f59e0b', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                🌐 Multi-language Support
              </span>
            </div>
          </div>

          {/* Language Selector */}
          <Card style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Globe size={24} color="var(--primaryCobalt)" />
                <h3 style={{ margin: 0 }}>Select Language</h3>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {Object.entries(languageNames).map(([code, { name, flag }]) => (
                  <motion.button
                    key={code}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleLanguageChange(code)}
                    style={{
                      padding: '10px 20px',
                      border: selectedLanguage === code ? '2px solid var(--primaryCobalt)' : '1px solid var(--border)',
                      borderRadius: '8px',
                      background: selectedLanguage === code ? 'var(--primaryCobalt)' : 'transparent',
                      color: selectedLanguage === code ? 'white' : 'var(--text)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: selectedLanguage === code ? '600' : '400',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>{flag}</span>
                    <span>{name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </Card>

          {/* Initial Loading State */}
          {loading && content.length === 0 && (
            <Card style={{ textAlign: 'center', padding: '40px' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{ display: 'inline-block', marginBottom: '16px' }}
              >
                <Sparkles size={48} color="var(--primaryCobalt)" />
              </motion.div>
              <h3 style={{ marginBottom: '8px', color: 'var(--text)' }}>
                Fetching Latest Market News...
              </h3>
              <p style={{ color: 'var(--textSecondary)', fontSize: '14px' }}>
                🔍 Scraping BSE, Moneycontrol, Economic Times & more<br/>
                Please wait while we gather the latest news...
              </p>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card style={{ background: '#fee2e2', border: '1px solid #ef4444' }}>
              <p style={{ color: '#dc2626', margin: 0 }}>❌ {error}</p>
            </Card>
          )}

          {/* Content Grid */}
          {content.length > 0 && (
            <>
              {loading && totalArticles > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginBottom: '24px', position: 'sticky', top: '20px', zIndex: 100 }}
                >
                  <Card style={{ 
                    textAlign: 'center', 
                    padding: '20px', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles size={20} />
                      </motion.div>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>
                        📰 Loading Article {content.length}/{totalArticles}
                        {selectedLanguage !== 'en' && ' 🌐'}
                      </p>
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
                      Articles load instantly • Click "Get AI Analysis" for insights
                    </p>
                  </Card>
                </motion.div>
              )}
              <div style={{ display: 'grid', gap: '24px' }}>
                {content.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
                  >
                    <Card hover style={{ position: 'relative', overflow: 'hidden' }}>
                    {/* Verified Badge */}
                    {item.verified && (
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: '#10b981',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <CheckCircle size={14} />
                        <span>SEBI Verified</span>
                      </div>
                    )}

                    {/* Category Badge */}
                    <div style={{
                      display: 'inline-block',
                      background: getCategoryColor(item.category),
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      marginBottom: '12px'
                    }}>
                      {item.category}
                    </div>

                    {/* Title */}
                    <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600', lineHeight: '1.4' }}>
                      {item.title_translated || item.title}
                    </h3>

                    {/* Full Content - Display First */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ 
                        background: 'var(--neutralBg)', 
                        padding: '18px', 
                        borderRadius: '12px', 
                        marginBottom: '20px',
                        borderLeft: '4px solid var(--primaryCobalt)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '18px' }}>📰</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primaryCobalt)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Latest News
                        </span>
                      </div>
                      <p style={{ color: 'var(--text)', lineHeight: '1.9', margin: 0, fontSize: '15px' }}>
                        {item.content_translated || item.content}
                      </p>
                    </motion.div>

                    {/* AI Analysis Button or Divider */}
                    {!item.ai_analysis ? (
                      <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <button
                          onClick={() => fetchAIAnalysis(item.id, item.title, item.content)}
                          disabled={loadingAI[item.id]}
                          style={{
                            background: loadingAI[item.id] 
                              ? 'var(--neutralBg)' 
                              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '14px 28px',
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: loadingAI[item.id] ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: loadingAI[item.id] ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
                            transition: 'all 0.3s ease',
                            opacity: loadingAI[item.id] ? 0.6 : 1
                          }}
                        >
                          {loadingAI[item.id] ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <Sparkles size={18} />
                              </motion.div>
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles size={18} />
                              Get AI Analysis
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        margin: '24px 0',
                        opacity: 0.6 
                      }}>
                        <div style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }}></div>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--textMuted)', textTransform: 'uppercase' }}>
                          ⚡ AI Analysis Below
                        </span>
                        <div style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }}></div>
                      </div>
                    )}

                    {/* AI Analysis Section - Display After Content */}
                    {item.ai_analysis && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          padding: '24px',
                          borderRadius: '16px',
                          marginBottom: '16px',
                          color: 'white',
                          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                          border: '2px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            >
                              <Sparkles size={22} />
                            </motion.div>
                            <span style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '0.5px' }}>
                              AI-POWERED INVESTMENT ANALYSIS
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <motion.span
                              whileHover={{ scale: 1.05 }}
                              style={{
                                background: getActionColor(item.ai_analysis.action),
                                padding: '8px 20px',
                                borderRadius: '24px',
                                fontSize: '14px',
                                fontWeight: '800',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                border: '2px solid white'
                              }}
                            >
                              {item.ai_analysis.action}
                            </motion.span>
                            <span style={{ fontSize: '28px' }}>
                              {getSentimentEmoji(item.ai_analysis.sentiment)}
                            </span>
                          </div>
                        </div>

                        {/* Summary */}
                        <p style={{ fontSize: '15px', lineHeight: '1.7', marginBottom: '12px', opacity: 0.95 }}>
                          {item.summary_translated || item.ai_analysis.summary}
                        </p>

                        {/* Key Metrics */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '16px' }}>
                          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>SENTIMENT</div>
                            <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.ai_analysis.sentiment}</div>
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>RISK LEVEL</div>
                            <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.ai_analysis.risk_level}</div>
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>TIME HORIZON</div>
                            <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.ai_analysis.time_horizon}</div>
                          </div>
                        </div>

                        {/* Reasoning */}
                        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>💡 Reasoning:</div>
                          <div style={{ fontSize: '13px', opacity: 0.9 }}>{item.ai_analysis.reasoning}</div>
                        </div>

                        {/* Affected Sectors/Stocks */}
                        {(item.ai_analysis.affected_sectors?.length > 0 || item.ai_analysis.affected_stocks?.length > 0) && (
                          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {item.ai_analysis.affected_sectors?.map((sector, idx) => (
                              <span key={idx} style={{
                                background: 'rgba(255,255,255,0.2)',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                📈 {sector}
                              </span>
                            ))}
                            {item.ai_analysis.affected_stocks?.map((stock, idx) => (
                              <span key={idx} style={{
                                background: 'rgba(255,255,255,0.25)',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                🏢 {stock}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Key Points */}
                        {item.ai_analysis.key_points?.length > 0 && (
                          <div style={{ marginTop: '12px' }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>🎯 Key Points:</div>
                            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', opacity: 0.9 }}>
                              {item.ai_analysis.key_points.map((point, idx) => (
                                <li key={idx} style={{ marginBottom: '4px' }}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Simple Summary (for content without AI analysis) */}
                    {!item.ai_analysis && item.summary && (
                      <div style={{
                        background: 'var(--neutralBg)',
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        borderLeft: '4px solid var(--accentGold)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <Sparkles size={16} color="var(--accentGold)" />
                          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accentGold)' }}>
                            Summary
                          </span>
                        </div>
                        <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0, color: 'var(--textSecondary)' }}>
                          {item.summary_translated || item.summary}
                        </p>
                      </div>
                    )}

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--textMuted)' }}>
                          <strong>Source:</strong> {item.source}
                        </div>
                        {item.published && (
                          <div style={{ fontSize: '11px', color: 'var(--textMuted)' }}>
                            📅 {new Date(item.published).toLocaleDateString('en-IN', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: 'var(--primaryCobalt)',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        <span>Read Original</span>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          {/* Empty State */}
          {!loading && !error && content.length === 0 && (
            <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
              <BookOpen size={64} color="var(--textMuted)" style={{ marginBottom: '16px' }} />
              <h3 style={{ marginBottom: '8px', color: 'var(--textMuted)' }}>No content available</h3>
              <p style={{ color: 'var(--textMuted)' }}>Try selecting a different language or check your connection</p>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OfficialResources;
