import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import Spline from '@splinetool/react-spline';
import Card from '../components/Card';

// Import icons from lucide-react
import { BookOpen, Target, LineChart, Briefcase, Activity, Bot, TrendingUp, Users, BookOpenCheck, Globe, Trophy, MessageSquare } from 'lucide-react';

const Home = () => {
  const { t } = useTranslation();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const marketRef = useRef(null);
  
  const { scrollYProgress } = useScroll();
  const heroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const featuresInView = useInView(featuresRef, { once: true, amount: 0.2 });
  const marketInView = useInView(marketRef, { once: true, amount: 0.2 });
  
  // Parallax effects
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  // Mouse tracking for hero section
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      title: t('nav.learn'),
      description: 'Interactive learning modules with PDF and video content',
      icon: <BookOpen size={48} strokeWidth={1.5} />,
      path: '/learn',
      color: 'var(--primaryCobalt)'
    },
    {
      title: t('nav.quiz'),
      description: 'Test your knowledge with comprehensive quizzes',
      icon: <Target size={48} strokeWidth={1.5} />,
      path: '/quiz',
      color: 'var(--accentGold)'
    },
    {
      title: t('nav.market'),
      description: 'Real-time market data and analysis tools',
      icon: <LineChart size={48} strokeWidth={1.5} />,
      path: '/market',
      color: 'var(--success)'
    },
    {
      title: t('nav.portfolio'),
      description: 'Virtual trading with ₹1,00,000 starting capital',
      icon: <Briefcase size={48} strokeWidth={1.5} />,
      path: '/portfolio',
      color: 'var(--primaryDeepNavy)'
    },
    {
      title: t('nav.backtest'),
      description: 'Test your strategies with historical data',
      icon: <Activity size={48} strokeWidth={1.5} />,
      path: '/backtest',
      color: 'var(--warning)'
    },
    {
      title: t('nav.analyze'),
      description: 'AI-powered portfolio and document analysis',
      icon: <Bot size={48} strokeWidth={1.5} />,
      path: '/analyze',
      color: 'var(--error)'
    }
  ];

  const comprehensiveFeatures = [
    {
      icon: <BookOpen size={32} strokeWidth={1.5} />,
      category: 'Educational',
      title: 'Interactive Learning Hub',
      description: 'Access comprehensive modules in Original, Simplified, and Vernacular formats across 5+ languages.',
      color: '#10b981'
    },
    {
      icon: <Trophy size={32} strokeWidth={1.5} />,
      category: 'Gamified',
      title: 'Quizzes & Assessments',
      description: 'Test your knowledge with adaptive quizzes and track your progress on the global leaderboard.',
      color: '#10b981'
    },
    {
      icon: <Briefcase size={32} strokeWidth={1.5} />,
      category: 'Practical',
      title: 'Virtual Portfolio',
      description: 'Practice trading with ₹1,00,000 virtual money and learn portfolio management strategies.',
      color: '#10b981'
    },
    {
      icon: <TrendingUp size={32} strokeWidth={1.5} />,
      category: 'Live Data',
      title: 'Real-Time Market Data',
      description: 'Monitor NSE/BSE indices, stocks, and market trends with professional-grade charts.',
      color: '#10b981'
    },
    {
      icon: <LineChart size={32} strokeWidth={1.5} />,
      category: 'Analytics',
      title: 'Advanced Backtesting',
      description: 'Test your investment strategies against historical data to validate your approach.',
      color: '#f59e0b'
    },
    {
      icon: <Globe size={32} strokeWidth={1.5} />,
      category: 'Inclusive',
      title: 'Multilingual Support',
      description: 'Learn in your preferred language with content in Hindi, Marathi, Bengali, Tamil, and English.',
      color: '#10b981'
    },
    {
      icon: <BookOpenCheck size={32} strokeWidth={1.5} />,
      category: 'Trusted',
      title: 'SEBI Compliance',
      description: 'All content follows SEBI guidelines ensuring educational integrity and regulatory compliance.',
      color: '#06b6d4'
    },
    {
      icon: <Users size={32} strokeWidth={1.5} />,
      category: 'Social',
      title: 'Community Learning',
      description: 'Join thousands of learners, compete on leaderboards, and learn from peer insights.',
      color: '#8b5cf6'
    }
  ];

  const marketData = [
    { name: 'NIFTY 50', value: '21,894.50', change: '+156.25', changePercent: '+0.72%', isPositive: true },
    { name: 'SENSEX', value: '72,568.45', change: '+445.87', changePercent: '+0.62%', isPositive: true },
    { name: 'BANK NIFTY', value: '46,785.30', change: '-89.65', changePercent: '-0.19%', isPositive: false },
    { name: 'NIFTY IT', value: '31,245.20', change: '+298.45', changePercent: '+0.97%', isPositive: true }
  ];

  const topMovers = {
    gainers: [
      { name: 'RELIANCE', price: '₹2,456.30', change: '+3.45%' },
      { name: 'TCS', price: '₹3,789.15', change: '+2.87%' },
      { name: 'HDFC BANK', price: '₹1,675.80', change: '+2.34%' }
    ],
    losers: [
      { name: 'BHARTIARTL', price: '₹945.25', change: '-1.89%' },
      { name: 'ICICIBANK', price: '₹1,167.90', change: '-1.45%' },
      { name: 'KOTAKBANK', price: '₹1,789.60', change: '-1.23%' }
    ]
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  };

  const floatingCardVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 1, -1, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', overflow: 'hidden' }} ref={containerRef}>
      {/* Hero Section */}
      <motion.div 
        ref={heroRef}
        style={{
          background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #1e40af 100%)',
          padding: '80px 0',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          y,
          scale
        }}
      >
        {/* Animated Background Elements */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at ${50 + mousePosition.x}% ${50 + mousePosition.y}%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
          }}
          animate={{
            background: [
              `radial-gradient(circle at ${50 + mousePosition.x}% ${50 + mousePosition.y}%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
              `radial-gradient(circle at ${50 + mousePosition.x}% ${50 + mousePosition.y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`,
              `radial-gradient(circle at ${50 + mousePosition.x}% ${50 + mousePosition.y}%, rgba(255,255,255,0.1) 0%, transparent 50%)`
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Geometric Shapes */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              rotate: [0, 360],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5
            }}
          />
        ))}

        <motion.div
          style={{
            position: 'absolute',
            top: '20px',
            left: '40px',
            fontSize: '14px',
            opacity: 0.9
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 0.9, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          SEBI-Compliant Financial Education
        </motion.div>
        
        {/* Floating Cards with Enhanced Animations */}
        <motion.div
          style={{
            position: 'absolute',
            top: '80px',
            right: '100px',
            background: 'rgba(255,255,255,0.95)',
            color: '#374151',
            padding: '12px 20px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
          variants={floatingCardVariants}
          animate="animate"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          whileHover={{ 
            scale: 1.05, 
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            transition: { duration: 0.2 }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={16} color="#10b981" />
            Portfolio Growth
          </div>
          <div style={{ color: '#10b981', fontSize: '16px', marginTop: '4px' }}>+15.3%</div>
        </motion.div>

        <motion.div
          style={{
            position: 'absolute',
            bottom: '60px',
            right: '50px',
            background: 'rgba(255,255,255,0.95)',
            color: '#374151',
            padding: '12px 20px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}
          variants={floatingCardVariants}
          animate="animate"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          whileHover={{ 
            scale: 1.05, 
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            transition: { duration: 0.2 }
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={16} color="#10b981" />
            Quiz Score
          </div>
          <div style={{ color: '#10b981', fontSize: '16px', marginTop: '4px' }}>95%</div>
        </motion.div>

        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={heroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.h1 
                style={{
                  fontSize: '48px',
                  fontWeight: '700',
                  marginBottom: '24px',
                  lineHeight: '1.2'
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Master <motion.span 
                  style={{ color: '#6ee7b7' }}
                  animate={{ 
                    textShadow: [
                      '0 0 20px rgba(110, 231, 183, 0.5)',
                      '0 0 40px rgba(110, 231, 183, 0.8)',
                      '0 0 20px rgba(110, 231, 183, 0.5)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Financial Markets
                </motion.span> with MoneyMitra
              </motion.h1>
              
              <motion.p 
                style={{
                  fontSize: '20px',
                  marginBottom: '40px',
                  opacity: 0.95,
                  lineHeight: '1.6'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 0.95, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Comprehensive investment education platform offering multilingual content, interactive quizzes, portfolio simulation, and real-time market insights.
              </motion.p>

             <motion.div 
  style={{ 
    display: 'flex', 
    gap: '16px', 
    marginBottom: '60px',
    justifyContent: 'flex-start',   // align left
    alignItems: 'center'            // keep vertical alignment
  }}
  initial={{ opacity: 0, y: 20 }}
  animate={heroInView ? { opacity: 1, y: 0 } : {}}
  transition={{ duration: 0.8, delay: 0.8 }}
>
  <motion.div
    whileHover={{ 
      scale: 1.05,
      boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)'
    }}
    whileTap={{ scale: 0.95 }}
  >
    <Link
      to="/learn"
      style={{
        background: '#10b981',
        color: 'white',
        padding: '16px 32px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'all 0.3s ease'
      }}
    >
      <BookOpen size={20} />
      Start Learning
    </Link>
  </motion.div>
  
  <motion.div
    whileHover={{ 
      scale: 1.05,
      backgroundColor: 'rgba(255,255,255,0.3)'
    }}
    whileTap={{ scale: 0.95 }}
  >
    <Link
      to="/portfolio"
      style={{
        background: 'rgba(255,255,255,0.2)',
        color: 'white',
        padding: '16px 32px',
        borderRadius: '8px',
        textDecoration: 'none',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        border: '1px solid rgba(255,255,255,0.3)',
        transition: 'all 0.3s ease'
      }}
    >
      Try Portfolio
    </Link>
  </motion.div>
</motion.div>

              {/* Animated Statistics */}
              <motion.div 
                style={{ display: 'flex', gap: '60px' }}
                variants={containerVariants}
                initial="hidden"
                animate={heroInView ? "visible" : "hidden"}
              >
                {[
                  { number: '50K+', label: 'Active Learners' },
                  { number: '200+', label: 'Learning Modules' },
                  { number: '5+', label: 'Languages' }
                ].map((stat, index) => (
                  <motion.div 
                    key={index}
                    variants={itemVariants}
                    whileHover={{ scale: 1.1 }}
                  >
                    <motion.div 
                      style={{ 
                        fontSize: '36px', 
                        fontWeight: '700', 
                        color: '#6ee7b7' 
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 1 + index * 0.2 }}
                    >
                      {stat.number}
                    </motion.div>
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Side - Spline Component */}
            <motion.div
              style={{
                height: '600px',
                width: '100%',
                borderRadius: '20px',
                position: 'relative',
                overflow: 'visible'
              }}
              initial={{ opacity: 0, x: 50 }}
              animate={heroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 1, delay: 0.6 }}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.3 }
              }}
            >
              {/* Container Background */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  borderRadius: '20px',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  zIndex: -1
                }}
                animate={{
                  boxShadow: [
                    '0 20px 60px rgba(0,0,0,0.15)',
                    '0 25px 80px rgba(16, 185, 129, 0.2)',
                    '0 20px 60px rgba(0,0,0,0.15)'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              
              {/* Spline Container - Full size without blur */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '20px',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                <Spline 
                  scene="https://prod.spline.design/nNgzzGavL3ZRltvE/scene.splinecode"
                  style={{
                    width: '180%',
                    height: '150%',
                    borderRadius: '20px'
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Learning Section */}
      <motion.div 
        ref={featuresRef}
        style={{ padding: '80px 0', background: '#f8fafc' }}
        initial={{ opacity: 0 }}
        animate={featuresInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <motion.div 
            style={{ textAlign: 'center', marginBottom: '60px' }}
            initial={{ opacity: 0, y: 50 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              style={{
                background: '#1e40af',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                display: 'inline-block',
                marginBottom: '20px'
              }}
              whileHover={{ scale: 1.05 }}
              animate={{
                boxShadow: [
                  '0 4px 20px rgba(30, 64, 175, 0.3)',
                  '0 8px 30px rgba(30, 64, 175, 0.5)',
                  '0 4px 20px rgba(30, 64, 175, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Interactive Learning
            </motion.div>
            <h2 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              Learn at Your Own <span style={{ color: '#10b981' }}>Pace & Language</span>
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#64748b',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Access comprehensive financial education with content tailored to different learning styles and available in multiple Indian languages.
            </p>
          </motion.div>

          <motion.div 
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}
            variants={containerVariants}
            initial="hidden"
            animate={featuresInView ? "visible" : "hidden"}
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.path}
                variants={itemVariants}
                whileHover={{ 
                  y: -10,
                  scale: 1.03,
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Link to={feature.path} style={{ textDecoration: 'none' }}>
                  <motion.div
                    style={{
                      background: 'white',
                      padding: '32px',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      textAlign: 'center',
                      height: '100%',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    whileHover={{
                      boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                      border: `1px solid ${feature.color}30`
                    }}
                  >
                    {/* Animated background gradient */}
                    <motion.div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(135deg, ${feature.color}05, transparent)`,
                        opacity: 0
                      }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    <motion.div 
                      style={{ marginBottom: '16px', color: feature.color, position: 'relative' }}
                      whileHover={{ 
                        rotate: [0, -10, 10, -10, 0],
                        scale: 1.1
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 style={{ marginBottom: '12px', color: feature.color, position: 'relative' }}>
                      {feature.title}
                    </h3>
                    <p style={{
                      color: 'var(--textSecondary)',
                      fontSize: '14px',
                      lineHeight: '1.6',
                      position: 'relative'
                    }}>
                      {feature.description}
                    </p>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Comprehensive Features Section */}
      <div style={{ padding: '80px 0' }}>
        <div className="container">
          <motion.div 
            style={{ textAlign: 'center', marginBottom: '60px' }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <motion.div
              style={{
                background: '#1e40af',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                display: 'inline-block',
                marginBottom: '20px'
              }}
              whileHover={{ scale: 1.05 }}
            >
              Comprehensive Features
            </motion.div>
            <h2 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              Everything You Need to <span style={{ color: '#10b981' }}>Master Finance</span>
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#64748b',
              maxWidth: '800px',
              margin: '0 auto'
            }}>
              From beginner-friendly content to advanced portfolio strategies, MoneyMitra provides a complete ecosystem for financial education and practical learning.
            </p>
          </motion.div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '32px' 
          }}>
            {comprehensiveFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -5,
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                style={{
                  background: 'white',
                  padding: '32px',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Hover gradient overlay */}
                <motion.div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, ${feature.color}08, transparent)`,
                    opacity: 0
                  }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                
                <div style={{ marginBottom: '16px', position: 'relative' }}>
                  <motion.div
                    style={{
                      background: `${feature.color}20`,
                      color: feature.color,
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '12px'
                    }}
                    whileHover={{ 
                      rotate: 360,
                      scale: 1.1
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <motion.div 
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: feature.color,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    {feature.category}
                  </motion.div>
                </div>
                <motion.h3 
                  style={{
                    fontSize: '20px',
                    fontWeight: '600',
                    color: '#1e293b',
                    marginBottom: '12px',
                    position: 'relative'
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                >
                  {feature.title}
                </motion.h3>
                <motion.p 
                  style={{
                    color: '#64748b',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    position: 'relative'
                  }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  {feature.description}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Data Section */}
      <motion.div 
        ref={marketRef}
        style={{ padding: '80px 0', background: '#f8fafc' }}
        initial={{ opacity: 0 }}
        animate={marketInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.8 }}
      >
        <div className="container">
          <motion.div 
            style={{ textAlign: 'center', marginBottom: '60px' }}
            initial={{ opacity: 0, y: 30 }}
            animate={marketInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              style={{
                background: '#f59e0b',
                color: 'white',
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '600',
                display: 'inline-block',
                marginBottom: '20px'
              }}
              whileHover={{ scale: 1.05 }}
              animate={{
                boxShadow: [
                  '0 4px 20px rgba(245, 158, 11, 0.3)',
                  '0 8px 30px rgba(245, 158, 11, 0.5)',
                  '0 4px 20px rgba(245, 158, 11, 0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Live Market Data
            </motion.div>
            <h2 style={{
              fontSize: '36px',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '16px'
            }}>
              Stay Updated with Real-Time Markets
            </h2>
            <p style={{
              fontSize: '18px',
              color: '#64748b',
              marginBottom: '8px'
            }}>
              Track market movements and analyze trends with professional-grade data
            </p>
            <motion.p 
              style={{
                fontSize: '14px',
                color: '#f59e0b',
                fontWeight: '600'
              }}
              animate={{
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ⚠️ Market data delayed ~15 minutes | For educational purposes only
            </motion.p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
            {/* Major Indices */}
            <motion.div 
              style={{
                background: 'white',
                padding: '32px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                position: 'relative',
                overflow: 'hidden'
              }}
              initial={{ opacity: 0, x: -50 }}
              animate={marketInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{
                boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                scale: 1.01
              }}
            >
              <motion.div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: 'linear-gradient(90deg, #10b981, #f59e0b, #ef4444)'
                }}
                initial={{ scaleX: 0 }}
                animate={marketInView ? { scaleX: 1 } : {}}
                transition={{ duration: 1, delay: 0.5 }}
              />
              
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1e293b',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <TrendingUp size={20} />
                </motion.div>
                Major Indices
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                {marketData.map((item, index) => (
                  <motion.div 
                    key={index} 
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '16px 0',
                      borderBottom: index < marketData.length - 1 ? '1px solid #f1f5f9' : 'none'
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={marketInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                    whileHover={{ 
                      backgroundColor: '#f8fafc',
                      scale: 1.02,
                      transition: { duration: 0.2 }
                    }}
                  >
                    <div>
                      <motion.div 
                        style={{
                          fontSize: '14px',
                          color: '#64748b',
                          marginBottom: '4px'
                        }}
                        whileHover={{ color: '#1e293b' }}
                      >
                        {item.name}
                      </motion.div>
                      <motion.div 
                        style={{
                          fontSize: '20px',
                          fontWeight: '600',
                          color: '#1e293b'
                        }}
                        animate={{
                          scale: [1, 1.02, 1]
                        }}
                        transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                      >
                        {item.value}
                      </motion.div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <motion.div 
                        style={{
                          color: item.isPositive ? '#10b981' : '#ef4444',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                        animate={{
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                      >
                        {item.change}
                      </motion.div>
                      <div style={{
                        color: item.isPositive ? '#10b981' : '#ef4444',
                        fontSize: '12px'
                      }}>
                        {item.changePercent}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Top Movers */}
            <motion.div 
              style={{
                background: 'white',
                padding: '32px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0'
              }}
              initial={{ opacity: 0, x: 50 }}
              animate={marketInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              whileHover={{
                boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                scale: 1.01
              }}
            >
              <div style={{ marginBottom: '24px' }}>
                <motion.h3 
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#10b981',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <TrendingUp size={16} />
                  </motion.div>
                  Top Gainers
                </motion.h3>
                {topMovers.gainers.map((item, index) => (
                  <motion.div 
                    key={index} 
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px',
                      padding: '8px',
                      borderRadius: '8px'
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={marketInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.6 }}
                    whileHover={{ 
                      backgroundColor: '#f0fdf4',
                      scale: 1.02
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {item.price}
                      </div>
                    </div>
                    <motion.div 
                      style={{
                        color: '#10b981',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                      animate={{
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    >
                      {item.change}
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              <div>
                <motion.h3 
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#ef4444',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <motion.div
                    animate={{ y: [2, -2, 2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <TrendingUp size={16} style={{ transform: 'rotate(180deg)' }} />
                  </motion.div>
                  Top Losers
                </motion.h3>
                {topMovers.losers.map((item, index) => (
                  <motion.div 
                    key={index} 
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px',
                      padding: '8px',
                      borderRadius: '8px'
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={marketInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.8 }}
                    whileHover={{ 
                      backgroundColor: '#fef2f2',
                      scale: 1.02
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {item.price}
                      </div>
                    </div>
                    <motion.div 
                      style={{
                        color: '#ef4444',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                      animate={{
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    >
                      {item.change}
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Demo Access Section */}
      <div style={{ padding: '80px 0' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center' }}
          >
            <motion.div
              style={{
                background: 'white',
                padding: '48px',
                borderRadius: '20px',
                border: '1px solid #e2e8f0',
                position: 'relative',
                overflow: 'hidden'
              }}
              whileHover={{
                boxShadow: '0 25px 80px rgba(0,0,0,0.1)',
                scale: 1.02
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Animated background gradient */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(135deg, #10b98110, #1e40af10)',
                  opacity: 0
                }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              
              <motion.h2 
                style={{ 
                  marginBottom: '24px', 
                  color: 'var(--primaryDeepNavy)',
                  position: 'relative'
                }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Quick Demo Access
              </motion.h2>
              
              <motion.div
                style={{
                  display: 'flex',
                  gap: '16px',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  position: 'relative'
                }}
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {[
                  { role: 'learner', email: 'learner@demo.com', label: 'Demo Learner', color: '#10b981' },
                  { role: 'reviewer', email: 'reviewer@demo.com', label: 'Demo Reviewer', color: '#f59e0b' },
                  { role: 'admin', email: 'admin@demo.com', label: 'Demo Admin', color: '#ef4444' }
                ].map((demo, index) => (
                  <motion.div
                    key={demo.role}
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: `0 10px 30px ${demo.color}30`
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to="/login"
                      state={{ demoUser: demo }}
                      style={{
                        display: 'inline-block',
                        padding: '12px 24px',
                        background: demo.color,
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '8px',
                        fontWeight: '600',
                        fontSize: '14px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {demo.label}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <motion.footer 
        style={{
          background: '#10b981',
          color: 'white',
          padding: '60px 0 40px 0',
          position: 'relative',
          overflow: 'hidden'
        }}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {/* Animated background elements */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: 200 + i * 100,
              height: 200 + i * 100,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              delay: i * 2
            }}
          />
        ))}

        <div className="container" style={{ position: 'relative' }}>
          <motion.div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '40px',
              marginBottom: '40px'
            }}
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={itemVariants}>
              <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
                MoneyMitra
              </h3>
              <p style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.6' }}>
                Empowering financial literacy through comprehensive, multilingual education. Master investment strategies with SEBI-compliant content and practical tools.
              </p>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                Platform
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { to: '/learn', label: 'Learning Hub' },
                  { to: '/quiz', label: 'Quizzes' },
                  { to: '/portfolio', label: 'Portfolio' },
                  { to: '/market', label: 'Market Data' }
                ].map((link, index) => (
                  <motion.div
                    key={link.to}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link 
                      to={link.to} 
                      style={{ 
                        color: 'white', 
                        textDecoration: 'none', 
                        fontSize: '14px', 
                        opacity: 0.9 
                      }}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                Languages
              </h4>
              <div style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.8' }}>
                {[
                  'English',
                  'हिंदी (Hindi)',
                  'मराठी (Marathi)',
                  'বাংলা (Bengali)',
                  'தமிழ் (Tamil)'
                ].map((lang, index) => (
                  <motion.div
                    key={lang}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 0.9, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {lang}
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
                Contact
              </h4>
              <div style={{ fontSize: '14px', opacity: 0.9, lineHeight: '1.8' }}>
                <motion.div whileHover={{ scale: 1.05 }}>support@moneymitra.in</motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>+91 800-MoneyMitra</motion.div>
                <motion.div whileHover={{ scale: 1.05 }}>Mumbai Financial District, Maharashtra, India</motion.div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div 
            style={{
              borderTop: '1px solid rgba(255,255,255,0.2)',
              paddingTop: '32px',
              textAlign: 'center'
            }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              style={{
                background: 'rgba(245,158,11,0.2)',
                border: '1px solid rgba(245,158,11,0.3)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
              }}
              whileHover={{ 
                background: 'rgba(245,158,11,0.3)',
                scale: 1.02
              }}
              transition={{ duration: 0.3 }}
            >
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                Important Disclaimer
              </h4>
              <p style={{ fontSize: '12px', opacity: 0.95, lineHeight: '1.5' }}>
                MoneyMitra provides educational content only and is not investment advice. All market data is delayed approximately 15 minutes and should not be used for trading decisions. Investment in securities market are subject to market risks. Please read all related documents carefully before investing. Past performance is not indicative of future returns. Please consult with a qualified financial advisor or registered investment advisor before making any investment decisions.
              </p>
            </motion.div>

            <motion.p 
              style={{
                color: 'rgba(255,255,255,0.8)',
                fontSize: '14px',
                maxWidth: '800px',
                margin: '0 auto'
              }}
              whileHover={{ opacity: 1 }}
            >
              <strong>{t('disclaimer')}</strong>
            </motion.p>

            <motion.div 
              style={{
                marginTop: '24px',
                fontSize: '12px',
                opacity: 0.7
              }}
              animate={{
                opacity: [0.7, 0.9, 0.7]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              © 2025 MoneyMitra Educational Technologies Pvt. Ltd. All rights reserved.
            </motion.div>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
};

export default Home;