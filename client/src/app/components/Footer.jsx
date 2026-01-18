import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faGlobe } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/Footer.module.css';
import amazon_logo from "../../assets/amazon-header.png";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className={styles.footer}>
      <button className={styles.backToTop} onClick={scrollToTop}>
        <FontAwesomeIcon icon={faArrowUp} />
        Back to top
      </button>
      
      <div className={styles.footerContent}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerColumn}>
              <h3 className={styles.columnTitle}>Get to Know Us</h3>
              <ul className={styles.footerLinks}>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/careers">Careers</Link></li>
                <li><Link to="/press">Press Releases</Link></li>
                <li><Link to="/science">Amazon Science</Link></li>
              </ul>
            </div>
            
            <div className={styles.footerColumn}>
              <h3 className={styles.columnTitle}>Make Money with Us</h3>
              <ul className={styles.footerLinks}>
                <li><Link to="/sell">Sell on Amazon</Link></li>
                <li><Link to="/affiliate">Become an Affiliate</Link></li>
                <li><Link to="/fulfillment">Fulfillment by Amazon</Link></li>
                <li><Link to="/advertise">Advertise Your Products</Link></li>
              </ul>
            </div>
            
            <div className={styles.footerColumn}>
              <h3 className={styles.columnTitle}>Amazon Payment Products</h3>
              <ul className={styles.footerLinks}>
                <li><Link to="/pay">Amazon Pay</Link></li>
                <li><Link to="/business">Amazon Business Card</Link></li>
                <li><Link to="/shop">Shop with Points</Link></li>
                <li><Link to="/reload">Reload Your Balance</Link></li>
              </ul>
            </div>
            
            <div className={styles.footerColumn}>
              <h3 className={styles.columnTitle}>Let Us Help You</h3>
              <ul className={styles.footerLinks}>
                <li><Link to="/covid">COVID-19 and Amazon</Link></li>
                <li><Link to="/account">Your Account</Link></li>
                <li><Link to="/orders">Your Orders</Link></li>
                <li><Link to="/shipping">Shipping Rates & Policies</Link></li>
              </ul>
            </div>
          </div>
          
          <div className={styles.footerBottom}>
            <div className={styles.logoSection}>
              <div className={styles.logo}>
                <img src={amazon_logo} alt='Amazon Logo' width={150} />
              </div>
            </div>
            
            <div className={styles.footerOptions}>
              <div className={styles.currencySelector}>
                <span>EGP - Egyptian Pound</span>
              </div>
              
              <div className={styles.countrySelector}>
                <span>Egypt</span>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className={styles.copyright}>
            <p>&copy; {new Date().getFullYear()}, Amazon.com, Inc. or its affiliates</p>
            <div className={styles.legalLinks}>
              <Link to="/conditions">Conditions of Use</Link>
              <Link to="/privacy">Privacy Notice</Link>
              <Link to="/ads">Interest-Based Ads</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer