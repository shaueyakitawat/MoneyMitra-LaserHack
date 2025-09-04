import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import YouTube from 'react-youtube';
import Card from '../components/Card';

const Learn = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('original');
  const [currentModule, setCurrentModule] = useState('investing-basics');

  // YouTube video IDs for each module
  const youtubeVideos = {
    'investing-basics': 'G4VzS5qyNqY', // Investing Basics by The Plain Bagel
    'stock-analysis': '4JZXQJ4dPos', // Stock Analysis by New Money
    'mutual-funds': 'kkLZPkCzW1c', // Mutual Funds by The Plain Bagel
    'stock-market-basics': 'p7HKvqRI_Bo', // Stock Market Basics by The Plain Bagel
    'technical-analysis': '1t4wZIRQJ_s', // Technical Analysis by Rayner Teo
    'portfolio-management': '13m3Xq4XK_s', // Portfolio Management by The Plain Bagel
    'options-trading': '8fPwV5c72hA' // Options Trading by Projectfinance
  };

  const modules = {
    'investing-basics': {
      title: 'Investing Basics',
      content: {
        original: 'Understanding fundamental investment principles and concepts',
        simplified: 'Simple guide to start investing your money wisely',
        vernacular: 'आपके पैसे को समझदारी से निवेश करने की सरल गाइड'
      },
      videoId: youtubeVideos['investing-basics'],
      pdfUrl: '/demo.pdf',
      youtubeLink: 'https://www.youtube.com/watch?v=' + youtubeVideos['investing-basics']
    },
    'stock-analysis': {
      title: 'Stock Analysis',
      content: {
        original: 'Learn how to analyze stocks using fundamental and technical analysis',
        simplified: 'How to pick good stocks for your portfolio',
        vernacular: 'अपने पोर्टफोलियो के लिए अच्छे स्टॉक कैसे चुनें'
      },
      videoId: youtubeVideos['stock-analysis'],
      pdfUrl: '/demo.pdf',
      youtubeLink: 'https://www.youtube.com/watch?v=' + youtubeVideos['stock-analysis']
    },
    'mutual-funds': {
      title: 'Mutual Funds',
      content: {
        original: 'Complete guide to mutual fund investing and SIP planning',
        simplified: 'Easy way to invest through mutual funds',
        vernacular: 'म्यूचुअल फंड के द्वारा निवेश करने का आसान तरीका'
      },
      videoId: youtubeVideos['mutual-funds'],
      pdfUrl: '/demo.pdf',
      youtubeLink: 'https://www.youtube.com/watch?v=' + youtubeVideos['mutual-funds']
    },
    'stock-market-basics': {
      title: 'Stock Market Basics',
      content: {
        original: 'Learn the fundamentals of how stock markets work',
        simplified: 'Understanding stock markets for beginners',
        vernacular: 'शेयर बाजार की मूल बातें समझें'
      },
      videoId: youtubeVideos['stock-market-basics'],
      pdfUrl: '/demo.pdf',
      youtubeLink: 'https://www.youtube.com/watch?v=' + youtubeVideos['stock-market-basics']
    },
    'technical-analysis': {
      title: 'Technical Analysis',
      content: {
        original: 'Master chart reading and technical indicators',
        simplified: 'Learn to analyze stock charts and patterns',
        vernacular: 'तकनीकी विश्लेषण सीखें'
      },
      videoId: youtubeVideos['technical-analysis'],
      pdfUrl: '/demo.pdf',
      youtubeLink: 'https://www.youtube.com/watch?v=' + youtubeVideos['technical-analysis']
    },
    'portfolio-management': {
      title: 'Portfolio Management',
      content: {
        original: 'Strategies for building and managing investment portfolios',
        simplified: 'How to create and manage your investment portfolio',
        vernacular: 'अपने निवेश पोर्टफोलियो का प्रबंधन कैसे करें'
      },
      videoId: youtubeVideos['portfolio-management'],
      pdfUrl: '/demo.pdf',
      youtubeLink: 'https://www.youtube.com/watch?v=' + youtubeVideos['portfolio-management']
    },
    'options-trading': {
      title: 'Options Trading',
      content: {
        original: 'Learn options trading strategies and risk management',
        simplified: 'Introduction to options trading for beginners',
        vernacular: 'ऑप्शन ट्रेडिंग की मूल बातें'
      },
      videoId: youtubeVideos['options-trading'],
      pdfUrl: '/demo.pdf',
      youtubeLink: 'https://www.youtube.com/watch?v=' + youtubeVideos['options-trading']
    }
  };

  const tabs = [
    { id: 'original', label: 'Original', icon: '📄' },
    { id: 'simplified', label: 'Simplified', icon: '📝' },
    { id: 'vernacular', label: 'Vernacular', icon: '🌐' }
  ];

  const handleSummarize = () => {
    alert('Summary feature would connect to AI service in production');
  };

  const handleTranslate = () => {
    alert('Translation feature would connect to AI service in production');
  };

  // Learning paths data
  const learningPaths = [
    {
      id: 'stock-market-basics',
      title: "Stock Market Basics",
      modules: 12,
      popular: true,
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      youtubeLink: 'https://www.youtube.com/watch?v=' + youtubeVideos['stock-market-basics']
    },
    {
      id: 'technical-analysis',
      title: "Technical Analysis",
      modules: 8,
      popular: true,
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      youtubeLink: 'https://www.youtube.com/watch?v=' + youtubeVideos['technical-analysis']
    },
    {
      id: 'portfolio-management',
      title: "Portfolio Management",
      modules: 6,
      popular: true,
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      youtubeLink: 'https://www.youtube.com/watch?v=' + youtubeVideos['portfolio-management']
    },
    {
      id: 'options-trading',
      title: "Options Trading",
      modules: 10,
      popular: true,
      color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      youtubeLink: 'https://www.youtube.com/watch?v=' + youtubeVideos['options-trading']
    }
  ];

  // Content formats data
  const contentFormats = [
    {
      type: "Original",
      title: "Comprehensive Content",
      description: "In-depth material with industry terminology and detailed analysis for advanced learners."
    },
    {
      type: "Simplified",
      title: "Video Lectures",
      description: "Professional video content with expert instructors and real market examples."
    },
    {
      type: "Regional",
      title: "Interactive Charts",
      description: "Live market data integration with hands-on chart analysis exercises."
    }
  ];

  // Featured modules data
  const featuredModules = [
    {
      level: "Beginner",
      title: "Introduction to Stock Markets",
      description: "Learn the fundamentals of how stock markets work, key terminology, and basic concepts.",
      duration: "2 hours",
      lessons: 15,
      students: "12,500",
      progress: 80,
      youtubeLink: 'https://www.youtube.com/watch?v=' + youtubeVideos['stock-market-basics']
    },
    {
      level: "Intermediate",
      title: "Textual Analysis Fundamentals",
      description: "Master chart reading, candlestick patterns, and technical indicators for better trading decisions.",
      duration: "3 hours",
      lessons: 22,
      students: "8,750",
      progress: 45,
      youtubeLink: 'https://www.youtube.com/watch?v=' + youtubeVideos['technical-analysis']
    },
    {
      level: "Advanced",
      title: "Risk Management Strategies",
      description: "Learn essential risk management techniques to protect your investments and minimize losses.",
      duration: "1.5 hours",
      lessons: 12,
      students: "8,600",
      progress: 0,
      youtubeLink: 'https://www.youtube.com/watch?v=' + youtubeVideos['portfolio-management']
    }
  ];

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: '#2D3748',
      backgroundColor: '#F7FAFC'
    },
    header: {
      textAlign: 'center',
      marginBottom: '48px'
    },
    headerTitle: {
      fontSize: '36px',
      fontWeight: '700',
      color: '#2D3748',
      marginBottom: '12px'
    },
    headerSubtitle: {
      fontSize: '18px',
      color: '#718096'
    },
    section: {
      marginBottom: '48px'
    },
    sectionTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#2D3748',
      marginBottom: '24px'
    },
    pathsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
      marginBottom: '24px'
    },
    pathCard: {
      padding: '24px',
      borderRadius: '12px',
      color: 'white',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      position: 'relative',
      minHeight: '120px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: 'transform 0.2s ease'
    },
    pathTitle: {
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '8px'
    },
    pathModules: {
      fontSize: '14px',
      opacity: 0.9
    },
    popularTag: {
      position: 'absolute',
      top: '12px',
      right: '12px',
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      padding: '4px 8px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600'
    },
    divider: {
      height: '1px',
      backgroundColor: '#E2E8F0',
      margin: '40px 0'
    },
    formatsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '24px'
    },
    formatCard: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      border: '1px solid #E2E8F0'
    },
    formatType: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#667eea',
      marginBottom: '8px'
    },
    formatTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#2D3748',
      marginBottom: '12px'
    },
    formatDescription: {
      fontSize: '14px',
      color: '#718096',
      lineHeight: '1.6'
    },
    modulesContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
      gap: '24px'
    },
    moduleCard: {
      backgroundColor: 'white',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      border: '1px solid #E2E8F0'
    },
    moduleHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px'
    },
    moduleLevel: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#667eea',
      padding: '4px 8px',
      backgroundColor: '#EBF4FF',
      borderRadius: '4px'
    },
    moduleStats: {
      display: 'flex',
      gap: '12px'
    },
    stat: {
      fontSize: '12px',
      color: '#718096'
    },
    moduleTitle: {
      fontSize: '18px',
      fontWeight: '600',
      color: '#2D3748',
      marginBottom: '12px'
    },
    moduleDescription: {
      fontSize: '14px',
      color: '#718096',
      lineHeight: '1.6',
      marginBottom: '20px'
    },
    progressContainer: {
      marginBottom: '20px'
    },
    progressBar: {
      height: '8px',
      backgroundColor: '#EDF2F7',
      borderRadius: '4px',
      marginBottom: '8px',
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      borderRadius: '4px',
      transition: 'width 0.3s ease'
    },
    progressText: {
      fontSize: '12px',
      color: '#718096'
    },
    continueButton: {
      width: '100%',
      padding: '12px',
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    },
    confirmSection: {
      backgroundColor: 'white',
      padding: '32px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      textAlign: 'center',
      border: '1px solid #E2E8F0'
    },
    confirmTitle: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#2D3748',
      marginBottom: '12px'
    },
    confirmText: {
      fontSize: '16px',
      color: '#718096',
      marginBottom: '24px'
    },
    viewProgressButton: {
      padding: '12px 24px',
      backgroundColor: '#667eea',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background-color 0.2s ease'
    }
  };

  // Function to open YouTube links
  const openYouTubeLink = (url) => {
    window.open(url, '_blank');
  };

  return (
    <div style={styles.container}>
      {/* Learning Paths Section */}
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Learning Paths</h1>
        <p style={styles.headerSubtitle}>Master the markets with our comprehensive courses</p>
      </header>

      <section style={styles.section}>
        <div style={styles.pathsGrid}>
          {learningPaths.map((path, index) => (
            <div 
              key={index} 
              style={{...styles.pathCard, background: path.color}}
              onClick={() => openYouTubeLink(path.youtubeLink)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
              }}
            >
              <h3 style={styles.pathTitle}>{path.title}</h3>
              <p style={styles.pathModules}>{path.modules} modules</p>
              {path.popular && <span style={styles.popularTag}>Popular</span>}
            </div>
          ))}
        </div>
      </section>

      <div style={styles.divider}></div>

      {/* Content Formats Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Content Formats & Languages</h2>
        <div style={styles.formatsContainer}>
          {contentFormats.map((format, index) => (
            <div key={index} style={styles.formatCard}>
              <h4 style={styles.formatType}>{format.type}</h4>
              <h3 style={styles.formatTitle}>{format.title}</h3>
              <p style={styles.formatDescription}>{format.description}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={styles.divider}></div>

      {/* Featured Modules Section */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Featured Modules</h2>
        <div style={styles.modulesContainer}>
          {featuredModules.map((module, index) => (
            <div key={index} style={styles.moduleCard}>
              <div style={styles.moduleHeader}>
                <span style={styles.moduleLevel}>{module.level}</span>
                <div style={styles.moduleStats}>
                  <span style={styles.stat}>{module.duration}</span>
                  <span style={styles.stat}>{module.lessons} lessons</span>
                  <span style={styles.stat}>{module.students} students</span>
                </div>
              </div>
              
              <h3 style={styles.moduleTitle}>{module.title}</h3>
              <p style={styles.moduleDescription}>{module.description}</p>
              
              <div style={styles.progressContainer}>
                <div style={styles.progressBar}>
                  <div 
                    style={{
                      ...styles.progressFill, 
                      width: `${module.progress}%`,
                      backgroundColor: module.progress === 0 ? '#ccc' : '#667eea'
                    }}
                  ></div>
                </div>
                <span style={styles.progressText}>{module.progress}% Complete</span>
              </div>
              
              <button 
                style={styles.continueButton}
                onClick={() => openYouTubeLink(module.youtubeLink)}
              >
                {module.progress > 0 ? 'Continue Learning' : 'Start Learning'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Confirm Learning Section */}
      <section style={styles.confirmSection}>
        <h2 style={styles.confirmTitle}>Confirm Learning</h2>
        <p style={styles.confirmText}>Track your progress and earn certificates as you complete each module</p>
        <button style={styles.viewProgressButton}>View My Progress</button>
      </section>

      {/* Original Learning Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 style={{ marginBottom: '32px' }}>Learning Hub</h1>

        {/* Module Selection */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '16px' }}>Select Module</h3>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {Object.entries(modules).map(([id, module]) => (
              <button
                key={id}
                onClick={() => setCurrentModule(id)}
                className={currentModule === id ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '8px 16px' }}
              >
                {module.title}
              </button>
            ))}
          </div>
        </div>

        {/* Content Tabs */}
        <Card style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 20px',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  borderBottom: activeTab === tab.id ? '2px solid var(--primaryCobalt)' : '2px solid transparent',
                  color: activeTab === tab.id ? 'var(--primaryCobalt)' : 'var(--textSecondary)',
                  fontWeight: activeTab === tab.id ? '600' : '400',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ minHeight: '200px' }}>
            <h3 style={{ marginBottom: '16px' }}>
              {modules[currentModule].title} - {tabs.find(t => t.id === activeTab).label}
            </h3>
            <p style={{ color: 'var(--textSecondary)', lineHeight: '1.8', marginBottom: '24px' }}>
              {modules[currentModule].content[activeTab]}
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button onClick={handleSummarize} className="btn-secondary">
                📄 Summarize Content
              </button>
              <button onClick={handleTranslate} className="btn-secondary">
                🌐 Translate
              </button>
              <button 
                onClick={() => openYouTubeLink(modules[currentModule].youtubeLink)}
                className="btn-primary"
              >
                ▶️ Watch on YouTube
              </button>
            </div>
          </div>
        </Card>

        {/* Video and PDF */}
        <div className="grid grid-2">
          <Card>
            <h3 style={{ marginBottom: '20px' }}>📹 Video Learning</h3>
            <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden' }}>
              <YouTube
                videoId={modules[currentModule].videoId}
                opts={{
                  width: '100%',
                  height: '250',
                  playerVars: {
                    autoplay: 0,
                  }
                }}
              />
            </div>
            <button 
              onClick={() => openYouTubeLink(modules[currentModule].youtubeLink)}
              className="btn-primary"
              style={{ width: '100%', marginTop: '16px' }}
            >
              Watch Full Course on YouTube
            </button>
          </Card>

          <Card>
            <h3 style={{ marginBottom: '20px' }}>📄 PDF Materials</h3>
            <div style={{ 
              background: 'var(--neutralBg)', 
              border: '2px dashed var(--border)', 
              borderRadius: 'var(--radius)', 
              padding: '40px 20px', 
              textAlign: 'center',
              minHeight: '250px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
              <p style={{ color: 'var(--textSecondary)', marginBottom: '16px' }}>
                PDF viewer would display learning materials here
              </p>
              <button className="btn-secondary">
                📥 Download PDF
              </button>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};

export default Learn;