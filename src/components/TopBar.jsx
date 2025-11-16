import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from '../styles/components/sidebar.module.css';

const TopBar = () => {
  const { i18n } = useTranslation();

  return (
    <div className={styles.topbar}>
      <Link to="/" className={styles.logo}>MoneyMitra</Link>

      <select
        className={styles.langSelect}
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
      >
        <option value="en">EN</option>
        <option value="hi">हिं</option>
        <option value="mr">मर</option>
        <option value="bn">বাং</option>
        <option value="ta">தமி</option>
      </select>
    </div>
  );
};

export default TopBar;
