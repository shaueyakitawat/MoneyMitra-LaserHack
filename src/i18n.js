import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      nav: {
        home: "Home",

        // Learn Section
        learn: "Learn",
        learningModules: "Learning Modules",
        leaderboard: "Leaderboard",

        // Practice Lab
        practiceLab: "Practice Lab",
        marketHub: "Market Hub",
        virtualPortfolio: "Virtual Portfolio",
        strategyBuilder: "Strategy Builder",
        backtestingEngine: "Backtesting Engine",

        // News & Analysis
        newsAnalysis: "News & Analysis",
        officialResources: "Official Resources",
        newsInsights: "News Insights",
        

        // My Analysis
        myAnalysis: "My Analysis",
        portfolioAnalyzer: "Portfolio Analyzer",
        riskProfile: "Risk Profile",
        aiMentor: "AI Mentor",

        // Admin
        admin: "Admin",
        adminDashboard: "Admin Dashboard",

        // Account
        account: "Account",

        // Others
        analyze: "Analyze",
        assistance: "Assistance",
        financialReport: "Financial Report",
      },

      common: {
        login: "Login",
        logout: "Logout",
        signup: "Sign Up",
        submit: "Submit",
        cancel: "Cancel",
        save: "Save",
        delete: "Delete",
        edit: "Edit",
        loading: "Loading...",
        error: "Error occurred",
        success: "Success",
      },

      home: {
        welcome: "Welcome to MoneyMitra",
        subtitle: "Your Complete Financial Education Platform",
        getStarted: "Get Started",
      },

      disclaimer:
        "MoneyMitra provides educational content only. Not investment advice.",
    },
  },

  // ------------------------ HINDI -------------------------------
  hi: {
    translation: {
      nav: {
        home: "होम",

        learn: "सीखें",
        learningModules: "लर्निंग मॉड्यूल",
        leaderboard: "लीडरबोर्ड",
        

        practiceLab: "प्रैक्टिस लैब",
        marketHub: "मार्केट हब",
        virtualPortfolio: "वर्चुअल पोर्टफोलियो",
        strategyBuilder: "स्ट्रैटेजी बिल्डर",
        backtestingEngine: "बैकटेस्टिंग इंजन",

        newsAnalysis: "समाचार व विश्लेषण",
        officialResources: "आधिकारिक संसाधन",
        newsInsights: "समाचार इनसाइट्स",
        sebiAlerts: "SEBI अलर्ट",

        myAnalysis: "मेरा विश्लेषण",
        portfolioAnalyzer: "पोर्टफोलियो विश्लेषक",
        riskProfile: "रिस्क प्रोफाइल",
        aiMentor: "एआई मेंटर",

        admin: "एडमिन",
        adminDashboard: "एडमिन डैशबोर्ड",

        account: "खाता",

        analyze: "विश्लेषण",
        assistance: "सहायता",
        financialReport: "वित्तीय रिपोर्ट",
      },

      common: {
        login: "लॉगिन",
        logout: "लॉगआउट",
        signup: "साइन अप",
        submit: "सबमिट",
        cancel: "रद्द करें",
        save: "सेव",
        delete: "डिलीट",
        edit: "एडिट",
        loading: "लोड हो रहा है...",
        error: "त्रुटि हुई",
        success: "सफल",
      },

      home: {
        welcome: "MoneyMitra में आपका स्वागत है",
        subtitle: "आपका संपूर्ण वित्तीय शिक्षा मंच",
        getStarted: "शुरू करें",
      },

      disclaimer:
        "MoneyMitra केवल शैक्षणिक सामग्री प्रदान करता है। निवेश सलाह नहीं।",
    },
  },

  // ------------------------ MARATHI -------------------------------
  mr: {
    translation: {
      nav: {
        home: "मुख्यपृष्ठ",

        learn: "शिका",
        learningModules: "शिकण्याचे मॉड्यूल",
        leaderboard: "अव्वल यादी",

        practiceLab: "प्रॅक्टिस लॅब",
        marketHub: "मार्केट हब",
        virtualPortfolio: "व्हर्च्युअल पोर्टफोलिओ",
        strategyBuilder: "स्ट्रॅटेजी बिल्डर",
        backtestingEngine: "बॅकटेस्टिंग इंजिन",

        newsAnalysis: "बातम्या आणि विश्लेषण",
        officialResources: "अधिकृत साधने",
        newsInsights: "बातमी इनसाइट्स",
        sebiAlerts: "SEBI अलर्ट",

        myAnalysis: "माझे विश्लेषण",
        portfolioAnalyzer: "पोर्टफोलिओ विश्लेषक",
        riskProfile: "जोखीम प्रोफाइल",
        aiMentor: "एआय मार्गदर्शक",

        admin: "व्यवस्थापक",
        adminDashboard: "व्यवस्थापक पॅनेल",

        account: "खाते",

        analyze: "विश्लेषण",
        assistance: "मदत",
        financialReport: "आर्थिक अहवाल",
      },

      disclaimer:
        "MoneyMitra फक्त शैक्षणिक सामग्री प्रदान करते. गुंतवणुकीचा सल्ला नाही.",
    },
  },

  // ------------------------ BENGALI -------------------------------
  bn: {
    translation: {
      nav: {
        home: "হোম",

        learn: "শিখুন",
        learningModules: "লার্নিং মডিউল",
        leaderboard: "লিডারবোর্ড",

        practiceLab: "প্র্যাকটিস ল্যাব",
        marketHub: "মার্কেট হাব",
        virtualPortfolio: "ভার্চুয়াল পোর্টফোলিও",
        strategyBuilder: "স্ট্র্যাটেজি বিল্ডার",
        backtestingEngine: "ব্যাকটেস্টিং ইঞ্জিন",

        newsAnalysis: "সংবাদ ও বিশ্লেষণ",
        officialResources: "অফিসিয়াল রিসোর্স",
        newsInsights: "নিউজ ইনসাইটস",
        sebiAlerts: "SEBI অ্যালার্ট",

        myAnalysis: "আমার বিশ্লেষণ",
        portfolioAnalyzer: "পোর্টফোলিও বিশ্লেষক",
        riskProfile: "ঝুঁকি প্রোফাইল",
        aiMentor: "এআই মেন্টর",

        admin: "অ্যাডমিন",
        adminDashboard: "অ্যাডমিন ড্যাশবোর্ড",

        account: "অ্যাকাউন্ট",

        analyze: "বিশ্লেষণ",
        assistance: "সহায়তা",
        financialReport: "ফিনান্সিয়াল রিপোর্ট",
      },

      disclaimer:
        "MoneyMitra শুধুমাত্র শিক্ষামূলক বিষয়বস্তু প্রদান করে। বিনিয়োগ পরামর্শ নয়।",
    },
  },

  // ------------------------ TAMIL -------------------------------
  ta: {
    translation: {
      nav: {
        home: "முகப்பு",

        learn: "கற்றுக்கொள்",
        learningModules: "கற்றல் தொகுதிகள்",
        leaderboard: "தலைவர்களின் பட்டியல்",

        practiceLab: "பயிற்சி கூடம்",
        marketHub: "சந்தை மையம்",
        virtualPortfolio: "மெய்நிகர் போர்ட்ஃபோலியோ",
        strategyBuilder: "வியூஹ உருவாக்கி",
        backtestingEngine: "பின்னோக்கு சோதனை இயந்திரம்",

        newsAnalysis: "செய்தி & பகுப்பாய்வு",
        officialResources: "அதிகாரப்பூர்வ ஆதாரங்கள்",
        newsInsights: "செய்தி பார்வைகள்",
        sebiAlerts: "SEBI எச்சரிக்கை",

        myAnalysis: "என் பகுப்பாய்வு",
        portfolioAnalyzer: "போர்ட்ஃபோலியோ பகுப்பாய்வாளர்",
        riskProfile: "ஆபத்து சுயவிவரம்",
        aiMentor: "ஏஐ பயிற்றுவிப்பாளர்",

        admin: "நிர்வாகி",
        adminDashboard: "நிர்வாக டாஷ்போர்டு",

        account: "கணக்கு",

        analyze: "பகுப்பாய்வு",
        assistance: "உதவி",
        financialReport: "நிதி அறிக்கை",
      },

      disclaimer:
        "MoneyMitra கல்வி நோக்கத்திற்கான உள்ளடக்கத்தை மட்டுமே அளிக்கிறது. முதலீட்டு ஆலோசனை அல்ல.",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
