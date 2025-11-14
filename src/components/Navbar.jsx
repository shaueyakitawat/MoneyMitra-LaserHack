import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCurrentUser, logout } from '../lib/auth';
import styles from '../styles/components/navbar.module.css';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const user = getCurrentUser();

  const navLinks = [
    { path: '/', label: t('nav.home') },
    { path: '/learn', label: t('nav.learn') },
    { path: '/quiz', label: t('nav.quiz') },
    { path: '/leaderboard', label: t('nav.leaderboard') },
    { path: '/market', label: t('nav.market') },
    { path: '/portfolio', label: t('nav.portfolio') },
    { path: '/backtest', label: t('nav.backtest') },
    { path: '/algo-builder', label: '🎨 Algo Builder' },
    { path: '/analyze', label: t('nav.analyze') },
    { path: '/assistance', label: t('nav.assistance') },
    { path: '/get-report', label: '📊 Financial Report' },
    { path: '/resources', label: '📚 Official Resources' },
    { path: '/risk-assessment', label: '🛡️ Risk Assessment' }
  ];

  // Add admin link for admin/reviewer roles
  if (user?.user?.role === 'admin' || user?.user?.role === 'reviewer') {
    navLinks.push({ path: '/admin', label: t('nav.admin') });
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
           MoneyMitra
        </Link>

        {user && (
          <>
            <div className={styles.nav}>
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`${styles.navLink} ${location.pathname === link.path ? styles.active : ''}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className={styles.actions}>
              <select
                className={styles.langSelect}
                value={i18n.language}
                onChange={(e) => changeLanguage(e.target.value)}
              >
                <option value="en">EN</option>
                <option value="hi">हिं</option>
                <option value="mr">मर</option>
                <option value="bn">বাং</option>
                <option value="ta">தமி</option>
              </select>

              <div className={styles.userMenu}>
                <div className={styles.userAvatar}>
                  {user.user.name.charAt(0).toUpperCase()}
                </div>
                <span>{user.user.name}</span>
                <button onClick={handleLogout} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
                  {t('common.logout')}
                </button>
              </div>
            </div>

            <button
              className={styles.mobileMenuBtn}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              ☰
            </button>

            {isMobileMenuOpen && (
              <div className={styles.navMobile}>
                {navLinks.map(link => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`${styles.navLink} ${location.pathname === link.path ? styles.active : ''}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
                <button onClick={handleLogout} className="btn-secondary">
                  {t('common.logout')}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
