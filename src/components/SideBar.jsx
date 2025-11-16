import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCurrentUser, logout } from '../lib/auth';
import styles from '../styles/components/sidebar.module.css';

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const user = getCurrentUser();

  const [open, setOpen] = useState({
    learn: true,
    practice: true,
    news: false,
    analysis: false,
    admin: false,
    account: false,
  });

  const toggle = (key) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className={styles.sidebar}>
      {/* Learn Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader} onClick={() => toggle("learn")}>
          🎓 Learn
        </div>
        {open.learn && (
          <div className={styles.submenu}>
            <Link className={location.pathname === "/learn" ? styles.active : null} to="/learn">📘 Learning Modules</Link>
            <Link className={location.pathname === "/leaderboard" ? styles.active : null} to="/leaderboard">🏆 Leaderboard</Link>
          </div>
        )}
      </div>

      {/* Practice Lab */}
      <div className={styles.section}>
        <div className={styles.sectionHeader} onClick={() => toggle("practice")}>
          📈 Practice Lab
        </div>
        {open.practice && (
          <div className={styles.submenu}>
            <Link className={location.pathname === "/market" ? styles.active : null} to="/market">📊 Market Hub</Link>
            <Link className={location.pathname === "/portfolio" ? styles.active : null} to="/portfolio">💰 Virtual Portfolio</Link>
            <Link className={location.pathname === "/algo-builder" ? styles.active : null} to="/algo-builder">🧩 Strategy Builder</Link>
            <Link className={location.pathname === "/backtest" ? styles.active : null} to="/backtest">📉 Backtesting Engine</Link>
          </div>
        )}
      </div>

      {/* News & Analysis */}
      <div className={styles.section}>
        <div className={styles.sectionHeader} onClick={() => toggle("news")}>
          📰 News & Analysis
        </div>
        {open.news && (
          <div className={styles.submenu}>
            <Link className={location.pathname === "/resources" ? styles.active : null} to="/resources">📚 Official Resources</Link>
            <Link to="#">📣 News Insights</Link>
            <Link to="#">⚠️ SEBI Alerts</Link>
          </div>
        )}
      </div>

      {/* My Analysis */}
      <div className={styles.section}>
        <div className={styles.sectionHeader} onClick={() => toggle("analysis")}>
          🧠 My Analysis
        </div>
        {open.analysis && (
          <div className={styles.submenu}>
            <Link className={location.pathname === "/analyze" ? styles.active : null} to="/analyze">📄 Portfolio Analyzer</Link>
            <Link className={location.pathname === "/risk-assessment" ? styles.active : null} to="/risk-assessment">📝 Risk Profile</Link>
            <Link className={location.pathname === "/assistance" ? styles.active : null} to="/assistance">🤖 AI Mentor</Link>
          </div>
        )}
      </div>

      {/* Admin (conditional) */}
      {(user?.user?.role === "admin" || user?.user?.role === "reviewer") && (
        <div className={styles.section}>
          <div className={styles.sectionHeader} onClick={() => toggle("admin")}>
            ⚙️ Admin
          </div>
          {open.admin && (
            <div className={styles.submenu}>
              <Link className={location.pathname === "/admin" ? styles.active : null} to="/admin">🛠️ Admin Dashboard</Link>
            </div>
          )}
        </div>
      )}

      {/* Account */}
      <div className={styles.section}>
        <div className={styles.sectionHeader} onClick={() => toggle("account")}>
          👤 Account
        </div>
        {open.account && (
          <div className={styles.submenu}>
            <button onClick={logout} className={styles.logoutBtn}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
