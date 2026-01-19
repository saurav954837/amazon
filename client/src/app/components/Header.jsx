import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faShoppingCart,
  faUser,
  faMapMarkerAlt,
  faBars,
  faChevronDown,
  faSignOutAlt,
  faUserCircle,
  faBox,
  faCog
} from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/Header.module.css';
import { useAuth } from '../hooks/authHook.js';
import { useProduct } from '../context/ProductContext.jsx';
import amazon_logo from "../../assets/amazon-header.png";

const securityUtils = {
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return '';

    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;',
      '(': '&#40;',
      ')': '&#41;',
      '{': '&#123;',
      '}': '&#125;'
    };

    const sanitizeRegex = /[&<>"'`=(){}]/g;
    return input.replace(sanitizeRegex, (match) => map[match] || match);
  },

  validatePath: (path) => {
    if (!path || typeof path !== 'string') return false;
    const cleanPath = path.split('?')[0].split('#')[0];
    const allowedBasePaths = [
      '/',
      '/dashboard',
      '/login',
      '/register',
      '/orders',
      '/admin-dashboard',
      '/cart',
      '/search',
      '/404'
    ];
    if (allowedBasePaths.some(allowedPath => cleanPath.startsWith(allowedPath))) {
      return true;
    };

    const invalidPatterns = [
      '..',
      '//',
      '~',
      './',
      '/./',
      '/../',
      '\\',
      ';'
    ];

    return !invalidPatterns.some(pattern => path.includes(pattern));
  },

  validateSearchQuery: (query) => {
    if (!query || typeof query !== 'string') return false;
    if (query.length > 150) return false;
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:/i,
      /vbscript:/i,
      /expression/i,
      /alert\(/i,
      /confirm\(/i,
      /prompt\(/i,
      /eval\(/i,
      /document\./i,
      /window\./i,
      /localStorage/i,
      /sessionStorage/i,
      /cookie/i,
      /fetch\(/i,
      /XMLHttpRequest/i,
      /\.innerHTML/i,
      /\.outerHTML/i
    ];

    return !dangerousPatterns.some(pattern => pattern.test(query));
  },

  sanitizeUrlParam: (param) => {
    if (typeof param !== 'string') return '';
    return encodeURIComponent(param).replace(/[!'()*]/g, (c) => {
      return '%' + c.charCodeAt(0).toString(16);
    });
  }
};

const createRateLimiter = (limit = 5, interval = 10000) => {
  const attempts = new Map();
  return {
    canProceed: (key = 'default') => {
      const now = Date.now();
      const userAttempts = attempts.get(key) || [];
      const validAttempts = userAttempts.filter(time => now - time < interval);
      if (validAttempts.length >= limit) {
        return false;
      }

      validAttempts.push(now);
      attempts.set(key, validAttempts);
      return true;
    },
    reset: (key = 'default') => {
      attempts.delete(key);
    }
  };
};

const Header = ({ onCartClick }) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [securityError, setSecurityError] = useState('');
  const { user, logout, isAdmin } = useAuth();
  const { cart, getCartCount } = useProduct();
  const navigate = useNavigate();

  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  const navigationRateLimiter = useRef(createRateLimiter(15, 60000));
  const searchRateLimiter = useRef(createRateLimiter(8, 15000));
  const cartCount = getCartCount();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (securityError) {
      const timer = setTimeout(() => setSecurityError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [securityError]);

  const secureNavigate = useCallback((path, options = {}) => {
    if (!securityUtils.validatePath(path)) {
      console.warn('Security: Invalid navigation path detected:', path);
      navigate('/404');
      return;
    };
    if (!navigationRateLimiter.current.canProceed(user?.id || 'guest')) {
      setSecurityError('Too many navigation attempts. Please wait a moment.');
      return;
    }

    navigate(path, options);
    setShowMobileMenu(false);
  }, [navigate, user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (!securityUtils.validateSearchQuery(searchQuery)) {
      setSecurityError('Invalid search query detected');
      return;
    };
    if (!searchRateLimiter.current.canProceed(user?.id || 'guest')) {
      setSecurityError('Too many search attempts. Please wait a moment.');
      return;
    }

    const sanitizedQuery = securityUtils.sanitizeUrlParam(searchQuery.trim());
    secureNavigate(`/search?q=${sanitizedQuery}`);
    setSearchQuery('');
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if (value.length > 150) {
      setSecurityError('Search query is too long');
      return;
    };
    setSearchQuery(value);
    if (securityError) setSecurityError('');
  };

  const handleProfileClick = () => {
    if (user) {
      secureNavigate('/dashboard');
      setShowUserDropdown(false);
    }
    else if (isAdmin) {
      secureNavigate('/admin-dashboard');
      setShowUserDropdown(false);
    }
    else {
      secureNavigate('/login');
    }
  };

  const handleLogin = () => {
    secureNavigate('/login');
  };

  const handleAdminClick = () => {
    if (isAdmin) {
      secureNavigate('/admin-dashboard');
      setShowUserDropdown(false);
    }
  };

  const handleOrdersClick = () => {
    if (user) {
      secureNavigate('/orders');
      setShowUserDropdown(false);
    } else {
      secureNavigate('/login');
    }
  };

  const handleCartClick = () => {
    if (onCartClick) {
      onCartClick();
    } else {
      secureNavigate('/cart');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserDropdown(false);
      navigationRateLimiter.current.reset(user?.id);
    } catch (error) {
      console.error('Logout error:', error);
      setSecurityError('Failed to logout securely');
    }
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    setShowUserDropdown(false);
  };

  const focusSearch = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <header className={styles.header}>
      {securityError && (
        <div className={styles.securityAlert} role="alert" aria-live="assertive">
          <span className={styles.alertIcon}>⚠️</span>
          <span className={styles.alertText}>{securityError}</span>
          <button
            className={styles.alertClose}
            onClick={() => setSecurityError('')}
            aria-label="Close alert"
          >
            ×
          </button>
        </div>
      )}

      <div className={styles.topBar}>
        <div className={styles.container}>
          <div className={styles.topBarContent}>
            <button
              className={styles.mobileMenuButton}
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
              aria-expanded={showMobileMenu}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>

            <div className={styles.logoSection}>
              <Link
                to="/"
                className={styles.logo}
                onClick={(e) => {
                  e.preventDefault();
                  secureNavigate('/');
                }}
              >
                <img
                  src={amazon_logo}
                  alt="Amazon"
                  width={100}
                  height={30}
                  loading="eager"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.visibility = 'hidden';
                  }}
                />
              </Link>

              <div className={styles.deliveryInfo}>
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className={styles.locationIcon}
                  aria-hidden="true"
                />
                <div className={styles.deliveryText}>
                  <span className={styles.deliverTo}>Deliver to</span>
                  <span className={styles.location}>Egypt</span>
                </div>
              </div>
            </div>

            <div className={styles.searchSection}>
              <form
                onSubmit={handleSearchSubmit}
                className={styles.searchForm}
                role="search"
              >
                <div className={styles.searchWrapper}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search Amazon"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    maxLength="150"
                    aria-label="Search Amazon"
                    aria-describedby="search-instructions"
                  />
                  <button
                    type="submit"
                    className={styles.searchButton}
                    aria-label="Search"
                  >
                    <FontAwesomeIcon icon={faSearch} />
                  </button>
                </div>
              </form>
              <div id="search-instructions" className={styles.srOnly}>
                Press enter to search
              </div>
            </div>

            <div className={styles.userSection}>
              <div className={styles.userMenuContainer} ref={dropdownRef}>
                {user ? (
                  <div className={styles.userMenu}>
                    <button
                      className={styles.accountButton}
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      aria-expanded={showUserDropdown}
                      aria-haspopup="true"
                      aria-label="Account menu"
                    >
                      <div className={styles.accountInfo}>
                        <span className={styles.hello}>
                          Hello, {securityUtils.sanitizeInput(user.first_name) || 'User'}
                        </span>
                        <span className={styles.accountText}>Account & Lists</span>
                      </div>
                      <FontAwesomeIcon
                        icon={faChevronDown}
                        className={`${styles.dropdownIcon} ${showUserDropdown ? styles.rotated : ''}`}
                        aria-hidden="true"
                      />
                    </button>

                    {showUserDropdown && (
                      <div
                        className={styles.dropdownMenu}
                        role="menu"
                        aria-label="Account options"
                      >
                        <div className={styles.dropdownHeader}>
                          <FontAwesomeIcon
                            icon={faUserCircle}
                            className={styles.dropdownHeaderIcon}
                            aria-hidden="true"
                          />
                          <div>
                            <strong>
                              {securityUtils.sanitizeInput(user.first_name)} {securityUtils.sanitizeInput(user.last_name)}
                            </strong>
                            <span>{securityUtils.sanitizeInput(user.email)}</span>
                          </div>
                        </div>

                        <div className={styles.dropdownSection}>
                          <h4>Your Account</h4>
                          <button
                            onClick={handleProfileClick}
                            className={styles.dropdownItem}
                            role="menuitem"
                          >
                            <FontAwesomeIcon icon={faUser} aria-hidden="true" />
                            Your Profile
                          </button>
                          <button
                            onClick={handleOrdersClick}
                            className={styles.dropdownItem}
                            role="menuitem"
                          >
                            <FontAwesomeIcon icon={faBox} aria-hidden="true" />
                            Your Orders
                          </button>
                        </div>

                        {isAdmin && (
                          <div className={styles.dropdownSection}>
                            <h4>Admin</h4>
                            <button
                              onClick={handleAdminClick}
                              className={styles.dropdownItem}
                              role="menuitem"
                            >
                              <FontAwesomeIcon icon={faCog} aria-hidden="true" />
                              Admin Dashboard
                            </button>
                          </div>
                        )}

                        <div className={styles.dropdownFooter}>
                          <button
                            onClick={handleLogout}
                            className={styles.logoutButton}
                            role="menuitem"
                          >
                            <FontAwesomeIcon icon={faSignOutAlt} aria-hidden="true" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={styles.authButtons}>
                    <button
                      className={styles.signInBtn}
                      onClick={handleLogin}
                      aria-label="Sign in to your account"
                    >
                      <span className={styles.hello}>Hello, sign in</span>
                      <span className={styles.accountText}>Account & Lists</span>
                    </button>
                  </div>
                )}
              </div>

              <div
                className={styles.orders}
                onClick={handleOrdersClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleOrdersClick()}
                aria-label="Returns & Orders"
              >
                <span className={styles.returns}>Returns</span>
                <span className={styles.ordersText}>& Orders</span>
              </div>

              {isAdmin ? (
                <>
                  <div
                    className={styles.admin}
                    onClick={handleAdminClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdminClick()}
                    aria-label="Admin Profile"
                  >
                    <div className={styles.adminProfileButton}>
                      <FontAwesomeIcon icon={faUserCircle} className={styles.adminIcon} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={styles.cart}
                    onClick={handleCartClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleCartClick()}
                    aria-label="Shopping cart"
                  >
                    <div className={styles.cartIconWrapper}>
                      <FontAwesomeIcon icon={faShoppingCart} className={styles.cartIcon} />
                      {cartCount > 0 && (
                        <span className={styles.cartCount}>{cartCount}</span>
                      )}
                    </div>
                    <span className={styles.cartText}>Cart</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showMobileMenu && (
        <div className={styles.mobileMenu} ref={mobileMenuRef}>
          <div className={styles.mobileMenuContent}>
            <div className={styles.mobileDeliveryInfo}>
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <div>
                <span>Deliver to Egypt</span>
              </div>
            </div>

            <button
              className={styles.mobileSearchTrigger}
              onClick={focusSearch}
              aria-label="Search"
            >
              <FontAwesomeIcon icon={faSearch} />
              <span>Search Amazon</span>
            </button>

            <nav className={styles.mobileNav}>
              {user ? (
                <>
                  <button onClick={handleProfileClick} className={styles.mobileNavItem}>
                    <FontAwesomeIcon icon={faUser} />
                    Your Profile
                  </button>
                  <button onClick={handleOrdersClick} className={styles.mobileNavItem}>
                    <FontAwesomeIcon icon={faBox} />
                    Your Orders
                  </button>
                  {isAdmin && (
                    <button onClick={handleAdminClick} className={styles.mobileNavItem}>
                      <FontAwesomeIcon icon={faCog} />
                      Admin Dashboard
                    </button>
                  )}
                  <button onClick={handleLogout} className={styles.mobileNavItem}>
                    <FontAwesomeIcon icon={faSignOutAlt} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleLogin} className={styles.mobileNavItem}>
                    <FontAwesomeIcon icon={faUser} />
                    Sign In
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;