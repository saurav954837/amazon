import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHome, faSearch, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import styles from '../styles/NotFound.module.css'

const NotFound = () => {
  return (
    <div className={styles.notFound}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.errorIcon}>
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>
          
          <h1 className={styles.errorTitle}>404 - Page Not Found</h1>
          
          <p className={styles.errorMessage}>
            We're sorry, the page you requested could not be found.<br />
            Please go back to the homepage or try searching for what you're looking for.
          </p>
          
          <div className={styles.actionButtons}>
            <Link to="/" className={styles.homeButton}>
              <FontAwesomeIcon icon={faHome} />
              Go to Homepage
            </Link>
            
            <Link to="/products" className={styles.searchButton}>
              <FontAwesomeIcon icon={faSearch} />
              Browse Products
            </Link>
          </div>
          
          <div className={styles.suggestions}>
            <h3 className={styles.suggestionsTitle}>You might also like:</h3>
            <div className={styles.suggestionsGrid}>
              {[
                { name: 'Today\'s Deals', link: '/deals' },
                { name: 'Best Sellers', link: '/bestsellers' },
                { name: 'New Releases', link: '/new' },
                { name: 'Customer Service', link: '/help' },
              ].map((item, index) => (
                <Link key={index} to={item.link} className={styles.suggestionItem}>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound