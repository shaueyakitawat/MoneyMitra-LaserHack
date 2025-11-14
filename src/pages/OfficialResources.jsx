import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Globe, CheckCircle, ExternalLink, Sparkles } from 'lucide-react';
import Card from '../components/Card';

const OfficialResources = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [languages, setLanguages] = useState([]);

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
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5001/sebi_content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: language,
          summary: true
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setContent(data.content);
        setSelectedLanguage(language);
      } else {
        setError(data.error || 'Failed to fetch content');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Network error. Please ensure backend is running on http://localhost:5001');
    } finally {
      setLoading(false);
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
      default: return '#6366f1';
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
              📚 Official Resources
            </h1>
            <p style={{ color: 'var(--textSecondary)', fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>
              SEBI, NISM & NSE content aggregated, summarized by AI, and translated to your language
            </p>
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

          {/* Loading State */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="loading-spinner"></div>
              <p style={{ marginTop: '16px', color: 'var(--textSecondary)' }}>
                Fetching and translating content...
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Card style={{ background: '#fee2e2', border: '1px solid #ef4444' }}>
              <p style={{ color: '#dc2626', margin: 0 }}>❌ {error}</p>
            </Card>
          )}

          {/* Content Grid */}
          {!loading && content.length > 0 && (
            <div style={{ display: 'grid', gap: '24px' }}>
              {content.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
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
                    <h3 style={{ marginBottom: '12px', fontSize: '20px', fontWeight: '600' }}>
                      {item.title_translated || item.title}
                    </h3>

                    {/* AI Summary */}
                    {item.summary && (
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
                            AI Summary
                          </span>
                        </div>
                        <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0, color: 'var(--textSecondary)' }}>
                          {item.summary_translated || item.summary}
                        </p>
                      </div>
                    )}

                    {/* Full Content */}
                    <p style={{ color: 'var(--textSecondary)', lineHeight: '1.8', marginBottom: '16px' }}>
                      {item.content_translated || item.content}
                    </p>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '12px', color: 'var(--textMuted)' }}>
                        <strong>Source:</strong> {item.source}
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
