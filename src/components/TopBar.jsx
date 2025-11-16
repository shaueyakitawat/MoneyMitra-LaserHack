import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { getCurrentUser, logout } from '../lib/auth';
import styles from '../styles/components/sidebar.module.css';

const TopBar = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const user = getCurrentUser();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
    { code: 'bn', name: 'বাংলা', flag: '🇮🇳' },
    { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' }
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  return (
    <div className={styles.topbar}>
      {/* Logo Section */}
      <div className={styles.logoSection}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>💰</span>
          <span className={styles.logoText}>MoneyMitra</span>
        </Link>
        <span className={styles.tagline}>Your Financial Companion</span>
      </div>

      {/* Right Section */}
      <div className={styles.topbarRight}>
        {/* Language Selector */}
        <div className={styles.langDropdown}>
          <button 
            className={styles.langButton}
            onClick={() => setShowLangMenu(!showLangMenu)}
            onBlur={() => setTimeout(() => setShowLangMenu(false), 200)}
          >
            <span className={styles.langFlag}>{currentLang.flag}</span>
            <span className={styles.langCode}>{currentLang.code.toUpperCase()}</span>
            <span className={styles.dropdownArrow}>▾</span>
          </button>
          
          {showLangMenu && (
            <div className={styles.langMenu}>
              {languages.map(lang => (
                <button
                  key={lang.code}
                  className={`${styles.langMenuItem} ${i18n.language === lang.code ? styles.langActive : ''}`}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setShowLangMenu(false);
                  }}
                >
                  <span className={styles.langFlag}>{lang.flag}</span>
                  <span>{lang.name}</span>
                  {i18n.language === lang.code && <span className={styles.checkmark}>✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <button className={styles.notificationBtn} title="Notifications">
          <span className={styles.bellIcon}>🔔</span>
          <span className={styles.notificationBadge}>3</span>
        </button>

        {/* User Profile Dropdown */}
        <div className={styles.profileDropdown}>
          <button 
            className={styles.profileButton}
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            onBlur={() => setTimeout(() => setShowProfileMenu(false), 200)}
          >
            <div className={styles.avatar}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name || 'User'}</span>
              <span className={styles.userRole}>Investor</span>
            </div>
            <span className={styles.dropdownArrow}>▾</span>
          </button>

          {showProfileMenu && (
            <div className={styles.profileMenu}>
              <div className={styles.profileMenuHeader}>
                <div className={styles.avatarLarge}>
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <div className={styles.profileMenuName}>{user?.name || 'User'}</div>
                  <div className={styles.profileMenuEmail}>{user?.email || 'user@example.com'}</div>
                </div>
              </div>
              
              <div className={styles.menuDivider}></div>
              
              <button 
                className={styles.profileMenuItem}
                onClick={() => {
                  navigate('/profile');
                  setShowProfileMenu(false);
                }}
              >
                <span className={styles.menuIcon}>👤</span>
                <span>My Profile</span>
              </button>
              
              <button 
                className={styles.profileMenuItem}
                onClick={() => {
                  navigate('/portfolio');
                  setShowProfileMenu(false);
                }}
              >
                <span className={styles.menuIcon}>💼</span>
                <span>Portfolio</span>
              </button>
              
              <button 
                className={styles.profileMenuItem}
                onClick={() => {
                  navigate('/learn');
                  setShowProfileMenu(false);
                }}
              >
                <span className={styles.menuIcon}>📚</span>
                <span>Learning Hub</span>
              </button>
              
              <div className={styles.menuDivider}></div>
              
              <button 
                className={`${styles.profileMenuItem} ${styles.logoutItem}`}
                onClick={handleLogout}
              >
                <span className={styles.menuIcon}>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
