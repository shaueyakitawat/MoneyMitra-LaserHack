import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        home: 'Home',
        learn: 'Learn',
        quiz: 'Quiz',
        leaderboard: 'Leaderboard',
        market: 'Market',
        portfolio: 'Portfolio',
        backtest: 'Backtest',
        admin: 'Admin',
        analyze: 'Analyze',
        assistance: 'Assistance'
      },
      // Common
      common: {
        login: 'Login',
        logout: 'Logout',
        signup: 'Sign Up',
        submit: 'Submit',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        loading: 'Loading...',
        error: 'Error occurred',
        success: 'Success'
      },
      // Pages
      home: {
        welcome: 'Welcome to JAINvest',
        subtitle: 'Your Complete Financial Education Platform',
        getStarted: 'Get Started'
      },
      market: {
        title: 'Market Monitor',
        delayNotice: 'Market data delayed ~15 min',
        indices: 'Indices',
        topGainers: 'Top Gainers',
        topLosers: 'Top Losers'
      },
      portfolio: {
        title: 'Virtual Portfolio',
        cash: 'Available Cash',
        totalValue: 'Total Value',
        pnl: 'P&L',
        buy: 'Buy',
        sell: 'Sell'
      },
      disclaimer: 'JAINvest provides educational content only. Not investment advice.'
    }
  },
  hi: {
    translation: {
      nav: {
        home: 'होम',
        learn: 'सीखें',
        quiz: 'क्विज़',
        leaderboard: 'लीडरबोर्ड',
        market: 'बाज़ार',
        portfolio: 'पोर्टफोलियो',
        backtest: 'बैकटेस्ट',
        admin: 'एडमिन',
        analyze: 'विश्लेषण',
        assistance: 'सहायता'
      },
      common: {
        login: 'लॉगिन',
        logout: 'लॉगआउट',
        signup: 'साइन अप',
        submit: 'सबमिट',
        cancel: 'रद्द करें',
        save: 'सेव',
        delete: 'डिलीट',
        edit: 'एडिट',
        loading: 'लोड हो रहा है...',
        error: 'त्रुटि हुई',
        success: 'सफल'
      },
      home: {
        welcome: 'JAINvest में आपका स्वागत है',
        subtitle: 'आपका संपूर्ण वित्तीय शिक्षा मंच',
        getStarted: 'शुरू करें'
      },
      market: {
        title: 'बाज़ार मॉनिटर',
        delayNotice: 'बाज़ार डेटा ~15 मिनट देर से',
        indices: 'इंडेक्स',
        topGainers: 'टॉप गेनर्स',
        topLosers: 'टॉप लूज़र्स'
      },
      portfolio: {
        title: 'वर्चुअल पोर्टफोलियो',
        cash: 'उपलब्ध नकदी',
        totalValue: 'कुल मूल्य',
        pnl: 'लाभ/हानि',
        buy: 'खरीदें',
        sell: 'बेचें'
      },
      disclaimer: 'JAINvest केवल शैक्षणिक सामग्री प्रदान करता है। निवेश सलाह नहीं।'
    }
  },
  mr: {
    translation: {
      nav: {
        home: 'मुख्यपृष्ठ',
        learn: 'शिका',
        quiz: 'प्रश्नमंजुषा',
        leaderboard: 'अव्वल यादी',
        market: 'बाजार',
        portfolio: 'गुंतवणूक',
        backtest: 'बॅकटेस्ट',
        admin: 'व्यवस्थापक',
        analyze: 'विश्लेषण',
        assistance: 'मदत'
      },
      disclaimer: 'JAINvest फक्त शैक्षणिक सामग्री प्रदान करते. गुंतवणुकीचा सल्ला नाही.'
    }
  },
  bn: {
    translation: {
      nav: {
        home: 'হোম',
        learn: 'শিখুন',
        quiz: 'কুইজ',
        leaderboard: 'লিডারবোর্ড',
        market: 'বাজার',
        portfolio: 'পোর্টফোলিও',
        backtest: 'ব্যাকটেস্ট',
        admin: 'অ্যাডমিন',
        analyze: 'বিশ্লেষণ',
        assistance: 'সহায়তা'
      },
      disclaimer: 'JAINvest শুধুমাত্র শিক্ষামূলক বিষয়বস্তু প্রদান করে। বিনিয়োগের পরামর্শ নয়।'
    }
  },
  ta: {
    translation: {
      nav: {
        home: 'முகப்பு',
        learn: 'கற்றுக்கொள்',
        quiz: 'வினாடி வினா',
        leaderboard: 'தலைமையிடம்',
        market: 'சந்தை',
        portfolio: 'முதலீட்டு',
        backtest: 'பின்னோட்ட சோதனை',
        admin: 'நிர்வாகி',
        analyze: 'பகுப்பாய்வு',
        assistance: 'உதவி'
      },
      disclaimer: 'JAINvest கல்வி உள்ளடக்கத்தை மட்டுமே வழங்குகிறது. முதலீட்டு ஆலோசனை அல்ல.'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
