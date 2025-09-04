import styles from '../styles/components/card.module.css';

const Card = ({ children, className = '', hover = true, ...props }) => {
  return (
    <div 
      className={`${styles.card} ${hover ? styles.hover : ''} ${className}`} 
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;