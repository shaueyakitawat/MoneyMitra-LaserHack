import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Globe, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';
import Card from '../components/Card';

const NewsInsights = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
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
    if (initializedRef.current) return;
    initializedRef.current = true;
    fetchContent('en');
  }, []);

  const fetchContent = async (language) => {
    if (fetchingRef.current) return;
    
    fetchingRef.current = true;
    setLoading(true);
    setError('');
    setContent([]);
    setTotalArticles(0);
    
    const sessionId = `session_stock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      let articleIndex = 0;
      let hasMore = true;
      
      while (hasMore) {
        const response = await fetch('http://localhost:5001/sebi_content_stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language,
            article_index: articleIndex,
            session_id: sessionId,
            include_ai_analysis: false,
            news_type: 'stock'
          })
        });

        const data = await response.json();
        
        if (data.success) {
          if (data.article) {
            setContent(prev => [...prev, data.article]);
            if (articleIndex === 0) setTotalArticles(data.total);
          }
          hasMore = data.has_more;
          articleIndex++;
          if (!hasMore) setLoading(false);
        } else {
          setError(data.error || 'Failed to fetch content');
          setLoading(false);
          break;
        }
      }
      setSelectedLanguage(language);
    } catch (err) {
      console.error('Error:', err);
      setError('Network error. Please ensure backend is running');
      setLoading(false);
    } finally {
      fetchingRef.current = false;
    }
  };

  const fetchAIAnalysis = async (articleId, articleTitle, articleContent) => {
    setLoadingAI(prev => ({ ...prev, [articleId]: true }));
    
    try {
      const response = await fetch('http://localhost:5001/get_ai_analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: articleTitle,
          content: articleContent,
          language: selectedLanguage
        })
      });

      const data = await response.json();
      
      if (data.success && data.ai_analysis) {
        setContent(prev => prev.map(item => 
          item.id === articleId 
            ? { ...item, ai_analysis: data.ai_analysis, summary: data.ai_analysis.summary, action: data.ai_analysis.action, sentiment: data.ai_analysis.sentiment }
            : item
        ));
      }
    } catch (err) {
      console.error('AI Analysis Error:', err);
    } finally {
      setLoadingAI(prev => ({ ...prev, [articleId]: false }));
    }
  };

  const getCategoryColor = (category) => {
    const colors = { 'Stock Analysis': '#8b5cf6', 'Stock News': '#ec4899', 'Company News': '#f97316', 'Earnings': '#10b981' };
    return colors[category] || '#6366f1';
  };

  const getActionColor = (action) => {
    const colors = { 'BUY': '#10b981', 'SELL': '#ef4444', 'HOLD': '#f59e0b', 'WATCH': '#6366f1' };
    return colors[action?.toUpperCase()] || '#6b7280';
  };

  const getSentimentEmoji = (sentiment) => {
    const emojis = { 'Bullish': '🐂', 'Bearish': '🐻', 'Neutral': '⚖️' };
    return emojis[sentiment] || '📊';
  };

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ marginBottom: '16px', fontSize: '36px', fontWeight: '700' }}>
              📈 Stock-Specific News & Analysis
            </h1>
            <p style={{ color: 'var(--textSecondary)', fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>
              Latest news about individual stocks, earnings reports, company announcements & analyst ratings
            </p>
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ background: 'var(--primaryCobalt)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>🏢 Individual Stocks</span>
              <span style={{ background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>📊 Company Analysis</span>
              <span style={{ background: '#f59e0b', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>🤖 AI-Powered Insights</span>
            </div>
          </div>

          <Card style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Globe size={24} color="var(--primaryCobalt)" />
                <h3 style={{ margin: 0 }}>Select Language</h3>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {Object.entries(languageNames).map(([code, { name, flag }]) => (
                  <motion.button key={code} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => fetchContent(code)}
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
                    <span>{flag}</span><span>{name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </Card>

          {loading && content.length === 0 && (
            <Card style={{ textAlign: 'center', padding: '40px' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ display: 'inline-block', marginBottom: '16px' }}>
                <Sparkles size={48} color="var(--primaryCobalt)" />
              </motion.div>
              <h3 style={{ marginBottom: '8px', color: 'var(--text)' }}>Fetching Stock-Specific News...</h3>
              <p style={{ color: 'var(--textSecondary)', fontSize: '14px' }}>🔍 Scraping company announcements, earnings & analyst reports</p>
            </Card>
          )}

          {error && <Card style={{ background: '#fee2e2', border: '1px solid #ef4444' }}><p style={{ color: '#dc2626', margin: 0 }}>❌ {error}</p></Card>}

          {content.length > 0 && (
            <div style={{ display: 'grid', gap: '24px' }}>
              {content.map((item, index) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <Card hover style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'inline-block', background: getCategoryColor(item.category), color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>
                      {item.category}
                    </div>
                    <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600', lineHeight: '1.4' }}>
                      {item.title_translated || item.title}
                    </h3>
                    <div style={{ background: 'var(--neutralBg)', padding: '18px', borderRadius: '12px', marginBottom: '20px', borderLeft: '4px solid var(--primaryCobalt)' }}>
                      <p style={{ color: 'var(--text)', lineHeight: '1.9', margin: 0, fontSize: '15px' }}>
                        {item.content_translated || item.content}
                      </p>
                    </div>
                    
                    {!item.ai_analysis ? (
                      <div style={{ textAlign: 'center' }}>
                        <button onClick={() => fetchAIAnalysis(item.id, item.title, item.content)} disabled={loadingAI[item.id]}
                          style={{
                            background: loadingAI[item.id] ? 'var(--neutralBg)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', fontSize: '15px',
                            fontWeight: '600', cursor: loadingAI[item.id] ? 'not-allowed' : 'pointer', display: 'inline-flex',
                            alignItems: 'center', gap: '10px'
                          }}
                        >
                          <Sparkles size={18} />
                          {loadingAI[item.id] ? 'Analyzing...' : 'Get AI Analysis'}
                        </button>
                      </div>
                    ) : (
                      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '24px', borderRadius: '16px', color: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Sparkles size={22} />
                            <span style={{ fontSize: '16px', fontWeight: '700' }}>AI ANALYSIS</span>
                          </div>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{ background: getActionColor(item.ai_analysis.action), padding: '8px 20px', borderRadius: '24px', fontSize: '14px', fontWeight: '800' }}>
                              {item.ai_analysis.action}
                            </span>
                            <span style={{ fontSize: '28px' }}>{getSentimentEmoji(item.ai_analysis.sentiment)}</span>
                          </div>
                        </div>
                        <p style={{ fontSize: '15px', lineHeight: '1.7', marginBottom: '12px', opacity: 0.95 }}>
                          {item.summary_translated || item.ai_analysis.summary}
                        </p>
                        {item.ai_analysis.affected_stocks?.length > 0 && (
                          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {item.ai_analysis.affected_stocks.map((stock, idx) => (
                              <span key={idx} style={{ background: 'rgba(255,255,255,0.25)', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
                                🏢 {stock}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border)', marginTop: '16px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--textMuted)' }}><strong>Source:</strong> {item.source}</div>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primaryCobalt)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                        <span>Read Original</span><ExternalLink size={14} />
                      </a>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && !error && content.length === 0 && (
            <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
              <TrendingUp size={64} color="var(--textMuted)" style={{ marginBottom: '16px' }} />
              <h3 style={{ marginBottom: '8px', color: 'var(--textMuted)' }}>No stock-specific news available</h3>
              <p style={{ color: 'var(--textMuted)' }}>Try selecting a different language or check back later</p>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default NewsInsights;
