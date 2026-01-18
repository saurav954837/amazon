import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/UnauthorizedPage.module.css';

const UnauthorizedPage = () => {
  return (
    <div className={styles.unauthorizedContainer}>
      <div className={styles.decorativeShapes}>
        <div className={`${styles.shape} ${styles.shape1}`}></div>
        <div className={`${styles.shape} ${styles.shape2}`}></div>
        <div className={`${styles.shape} ${styles.shape3}`}></div>
      </div>
      
      <div className={styles.errorCard}>
        <div className={styles.iconContainer}>
          <div className={styles.iconCircle}>
            <FontAwesomeIcon icon={faLock} className={styles.lockIcon} />
          </div>
        </div>
        
        <h1 className={styles.title}>Access Denied</h1>
        
        <p className={styles.subtitle}>
          You don't have permission to access this page. This area is restricted to administrators only.
        </p>
        
        <div className={styles.actionButtons}>
          <Link to="/dashboard" className={styles.primaryButton}>
            Go to User Dashboard
          </Link>
          
          <Link to="/" className={styles.secondaryButton}>
            Return to Homepage
          </Link>
        </div>
        
        <p className={styles.footerText}>
          If you believe this is an error, please contact the system administrator.
        </p>
      </div>
    </div>
  );
};

export default UnauthorizedPage;