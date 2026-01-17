import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faSearch, 
  faShoppingCart, 
  faUser,
  faMapMarkerAlt,
  faBars,
  faGlobe,
  faChevronDown,
  faSignOutAlt,
  faUserCircle,
  faBox,
  faCog
} from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/Header.module.css';
import SearchBar from './SearchBar.jsx';
import { useAuth } from '../hooks/authHook.js';

const Header = ({ onCartClick }) => {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile')
      setShowUserDropdown(false)
    } else {
      navigate('/login')
    }
  }

  const handleLogin = () => {
    navigate('/login')
  }

  const handleSignup = () => {
    navigate('/register')
  }

  const handleAdminClick = () => {
    if (isAdmin) {
      navigate('/admin/dashboard')
      setShowUserDropdown(false)
    }
  }

  const handleOrdersClick = () => {
    if (user) {
      navigate('/orders')
      setShowUserDropdown(false)
    } else {
      navigate('/login', { state: { from: '/orders' } })
    }
  }

  const handleLogout = async () => {
    await logout()
    setShowUserDropdown(false)
  }

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.container}>
          <div className={styles.topBarContent}>
            <div className={styles.logoSection}>
              <Link to="/" className={styles.logo}>
                <span className={styles.logoText}>amazon</span>
                <span className={styles.domain}>.eg</span>
              </Link>
              <div className={styles.deliveryInfo}>
                <FontAwesomeIcon icon={faMapMarkerAlt} className={styles.locationIcon} />
                <div className={styles.deliveryText}>
                  <span className={styles.deliverTo}>Deliver to</span>
                  <span className={styles.location}>Egypt</span>
                </div>
              </div>
            </div>

            <div className={styles.searchSection}>
              <SearchBar />
            </div>

            <div className={styles.userSection}>
              <div className={styles.languageSelector}>
                <FontAwesomeIcon icon={faGlobe} />
                <span>EN</span>
              </div>
              
              <div className={styles.userMenuContainer} ref={dropdownRef}>
                {user ? (
                  <div className={styles.userMenu}>
                    <button 
                      className={styles.accountButton}
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                    >
                      <div className={styles.accountInfo}>
                        <span className={styles.hello}>Hello, {user.firstName}</span>
                        <span className={styles.accountText}>Account & Lists</span>
                      </div>
                      <FontAwesomeIcon 
                        icon={faChevronDown} 
                        className={`${styles.dropdownIcon} ${showUserDropdown ? styles.rotated : ''}`}
                      />
                    </button>
                    
                    {showUserDropdown && (
                      <div className={styles.dropdownMenu}>
                        <div className={styles.dropdownHeader}>
                          <FontAwesomeIcon icon={faUserCircle} className={styles.dropdownHeaderIcon} />
                          <div>
                            <strong>{user.firstName} {user.lastName}</strong>
                            <span>{user.email}</span>
                          </div>
                        </div>
                        
                        <div className={styles.dropdownSection}>
                          <h4>Your Account</h4>
                          <button onClick={handleProfileClick} className={styles.dropdownItem}>
                            <FontAwesomeIcon icon={faUser} />
                            Your Profile
                          </button>
                          <button onClick={handleOrdersClick} className={styles.dropdownItem}>
                            <FontAwesomeIcon icon={faBox} />
                            Your Orders
                          </button>
                        </div>
                        
                        {isAdmin && (
                          <div className={styles.dropdownSection}>
                            <h4>Admin</h4>
                            <button onClick={handleAdminClick} className={styles.dropdownItem}>
                              <FontAwesomeIcon icon={faCog} />
                              Admin Dashboard
                            </button>
                          </div>
                        )}
                        
                        <div className={styles.dropdownFooter}>
                          <button onClick={handleLogout} className={styles.logoutButton}>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.authButtons}>
                    <button className={styles.signInBtn} onClick={handleLogin}>
                      <span className={styles.hello}>Hello, sign in</span>
                      <span className={styles.accountText}>Account & Lists</span>
                    </button>
                  </div>
                )}
              </div>

              <div className={styles.orders} onClick={handleOrdersClick}>
                <span className={styles.returns}>Returns</span>
                <span className={styles.ordersText}>& Orders</span>
              </div>

              <div className={styles.cart} onClick={onCartClick}>
                <FontAwesomeIcon icon={faShoppingCart} className={styles.cartIcon} />
                <span className={styles.cartCount}>0</span>
                <span className={styles.cartText}>Cart</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header;