// YouTube video mappings for learning modules
// These are curated financial literacy videos from trusted sources

export const moduleVideoMappings = {
  // Module 1: Introduction to Investing
  'module-1-basics': {
    'lesson-1-1': 'Xn7KWR9lcAc', // What is Investing? - The Plain Bagel
    'lesson-1-2': 'gFQNPmLKj1k', // Types of Investments - Investopedia
    'lesson-1-3': 'FI_SdZB1d5o', // Risk and Return - Khan Academy
    'lesson-1-4': 'lWNQraLJD5Q', // Setting Financial Goals - Money Guy Show
    'lesson-1-5': 'HQZv9CcH0Q8', // Starting Your Investment Journey - Graham Stephan
  },
  
  // Module 2: Stock Market Fundamentals
  'module-2-stock-market': {
    'lesson-2-1': 'p7HKvqRI_Bo', // How the Stock Market Works - The Plain Bagel
    'lesson-2-2': 'hE2NsJGpEq4', // Stock Exchanges Explained - Investopedia
    'lesson-2-3': 'kJlhPGUd3rY', // Market Indices - Financial Education
    'lesson-2-4': 'LeAltgu_pbM', // Bull vs Bear Markets - Yahoo Finance
    'lesson-2-5': '8-AHIbaVhCY', // IPOs and Public Markets - CNBC
  },
  
  // Module 3: Technical Analysis
  'module-3-technical-analysis': {
    'lesson-3-1': '1t4wZIRQJ_s', // Technical Analysis Basics - Rayner Teo
    'lesson-3-2': '7YCnJKRCCh8', // Candlestick Patterns - ClayTrader
    'lesson-3-3': 'Z8scfmHpcwQ', // Support and Resistance - Trading 212
    'lesson-3-4': 'GIuCaYbX5Ts', // Moving Averages - TD Ameritrade
    'lesson-3-5': 'JCCDjwMUxG0', // Technical Indicators - Investopedia
  },
  
  // Module 4: Fundamental Analysis
  'module-4-fundamental-analysis': {
    'lesson-4-1': 'UZnVt_CvL3w', // Financial Statement Basics - Corporate Finance Institute
    'lesson-4-2': 'COwww5kE6_8', // P/E Ratio Explained - The Plain Bagel
    'lesson-4-3': 'jS_fSeRHC4w', // Valuation Methods - Aswath Damodaran
    'lesson-4-4': '4JZXQJ4dPos', // Company Analysis - New Money
    'lesson-4-5': 'dj9_CuD9Qy4', // Economic Indicators - Khan Academy
  },
  
  // Module 5: Mutual Funds & ETFs
  'module-5-mutual-funds-etfs': {
    'lesson-5-1': 'kkLZPkCzW1c', // Mutual Funds Explained - The Plain Bagel
    'lesson-5-2': 'SP7ismo95ns', // ETFs vs Mutual Funds - Investopedia
    'lesson-5-3': 'fwe-PjrX23o', // Index Funds - Ben Felix
    'lesson-5-4': 'MhYbW6XhL74', // Expense Ratios - Morningstar
    'lesson-5-5': 'YDBEwMT01g0', // Building ETF Portfolio - Graham Stephan
  },
  
  // Module 6: Portfolio Management
  'module-6-portfolio-management': {
    'lesson-6-1': 'TI5p8vqdjTw', // Asset Allocation - Ben Felix
    'lesson-6-2': '13m3Xq4XK_s', // Portfolio Diversification - The Plain Bagel
    'lesson-6-3': 'k7qAd8WLnfc', // Rebalancing - Vanguard
    'lesson-6-4': 'TI5p8vqdjTw', // Modern Portfolio Theory - Patrick Boyle
    'lesson-6-5': 'araNQKzKbyY', // Portfolio Strategies - TD Ameritrade
  },
  
  // Module 7: Options & Derivatives
  'module-7-options-derivatives': {
    'lesson-7-1': '8fPwV5c72hA', // Options Basics - Projectfinance
    'lesson-7-2': 'VJgHkAqohbE', // Call vs Put Options - Option Alpha
    'lesson-7-3': 'GxmIvvROge4', // Options Strategies - Tastytrade
    'lesson-7-4': 'Jl6h1CfOZJw', // Futures Contracts - CME Group
    'lesson-7-5': '6lNy3XdzsD4', // Options Greeks - Option Alpha
  },
  
  // Module 8: Risk Management
  'module-8-risk-management': {
    'lesson-8-1': 'lSShWiZW3Ks', // Investment Risks - Investopedia
    'lesson-8-2': '4V0-r_Nfixs', // Behavioral Finance - Yale
    'lesson-8-3': 'gAqnlFpBHWk', // Risk Metrics - CFA Institute
    'lesson-8-4': 'uj5J0qqkQVA', // Investment Discipline - Money Guy Show
    'lesson-8-5': 'K_y0RxGk5Aw', // Common Mistakes - Ben Felix
  },
  
  // Module 9: Taxation & Regulations
  'module-9-taxation-regulations': {
    'lesson-9-1': 'apaOo8izM1o', // Capital Gains Tax India - CA Rachana Ranade
    'lesson-9-2': 'cXVMchBYvwo', // Tax Saving Investments - Labour Law Advisor
    'lesson-9-3': 'qiZxRi3ylHQ', // Tax Loss Harvesting - Groww
    'lesson-9-4': 'EppaLXaK6jg', // SEBI Regulations - Finology
    'lesson-9-5': 'OIvO2eBv0j4', // KYC and Compliance - Zerodha
  },
  
  // Module 10: Building Long-term Wealth
  'module-10-building-wealth': {
    'lesson-10-1': 'dnC5mDBEb14', // Power of Compounding - Freefincal
    'lesson-10-2': 'JNy2WzIsHp8', // Retirement Planning - Sharan Hegde
    'lesson-10-3': 'qqy5BIKCNPw', // Financial Independence - Our Rich Journey
    'lesson-10-4': 'HQZv9CcH0Q8', // Goal-based Planning - ET Money
    'lesson-10-5': 'Xn7KWR9lcAc', // Estate Planning - Wealth First
  }
};

// Get YouTube video ID for a specific lesson
export const getVideoId = (moduleId, lessonId) => {
  return moduleVideoMappings[moduleId]?.[lessonId] || 'PLACEHOLDER';
};

// Check if video ID is available for a lesson
export const hasVideoId = (moduleId, lessonId) => {
  const videoId = getVideoId(moduleId, lessonId);
  return videoId !== 'PLACEHOLDER';
};

// Get YouTube embed URL
export const getYouTubeEmbedUrl = (videoId) => {
  if (videoId === 'PLACEHOLDER') return null;
  return `https://www.youtube.com/embed/${videoId}`;
};

// Get YouTube watch URL
export const getYouTubeWatchUrl = (videoId) => {
  if (videoId === 'PLACEHOLDER') return null;
  return `https://www.youtube.com/watch?v=${videoId}`;
};

// Bulk update function to replace PLACEHOLDERs in module data
export const updateModuleWithVideoIds = (module) => {
  const updatedLessons = module.lessons.map(lesson => {
    const videoId = getVideoId(module.id, lesson.id);
    return {
      ...lesson,
      videoId: videoId !== 'PLACEHOLDER' ? videoId : lesson.videoId
    };
  });
  
  return {
    ...module,
    lessons: updatedLessons
  };
};