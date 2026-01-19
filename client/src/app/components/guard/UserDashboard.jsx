import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/authHook.js';
import { useProduct } from '../../context/ProductContext.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faShoppingCart, faBox, faCreditCard, faHistory } from '@fortawesome/free-solid-svg-icons';
import styles from '../../styles/UserDashboard.module.css';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const { cart, getCartTotal } = useProduct();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const dashboardStats = [
    { label: 'Orders', value: '0', icon: faBox, color: styles.iconBlue },
    { label: 'Cart Items', value: cart.length.toString(), icon: faShoppingCart, color: styles.iconGreen },
    { label: 'Wishlist', value: '0', icon: faHistory, color: styles.iconYellow },
    { label: 'Total Spent', value: `$${getCartTotal().toFixed(2)}`, icon: faCreditCard, color: styles.iconPurple },
  ];

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleContainer}>
            <h1 className={styles.title}>My Account</h1>
            <span className={styles.roleBadge}>
              {user?.role === 'admin' ? 'Administrator' : 'Customer'}
            </span>
          </div>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.welcomeBanner}>
          <div className={styles.bannerContent}>
            <div className={styles.avatar}>
              <FontAwesomeIcon icon={faUser} className={styles.avatarIcon} />
            </div>
            <div className={styles.welcomeText}>
              <h2>Welcome back, {user?.first_name} {user?.last_name}!</h2>
              <p>Manage your account, orders, and preferences</p>
            </div>
          </div>
        </div>

        <div className={styles.statsGrid}>
          {dashboardStats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statInfo}>
                  <p>{stat.label}</p>
                  <div className={styles.value}>{stat.value}</div>
                </div>
                <div className={`${styles.iconContainer} ${stat.color}`}>
                  <FontAwesomeIcon icon={stat.icon} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.tabsContainer}>
          <div className={styles.tabsHeader}>
            <nav className={styles.tabsNav}>
              {['overview', 'orders', 'cart', 'profile'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${styles.tabButton} ${activeTab === tab ? styles.active : ''}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'overview' && (
              <div className={styles.tabSection}>
                <h3>Account Overview</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span>Full Name</span>
                    <span>{user?.first_name} {user?.last_name}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span>Username</span>
                    <span>@{user?.username}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span>Email</span>
                    <span>{user?.email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span>Cart Items</span>
                    <span>{cart.length} items</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className={styles.tabSection}>
                <h3>Profile Settings</h3>
                <p className={styles.emptyText}>Profile management coming soon...</p>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className={styles.tabSection}>
                <h3>Order History</h3>
                <div className={styles.emptyState}>
                  <FontAwesomeIcon icon={faBox} className={styles.emptyIcon} />
                  <p className={styles.emptyText}>No orders yet</p>
                  <button
                    onClick={() => navigate('/products')}
                    className={styles.actionButton}
                  >
                    Start Shopping
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'cart' && (
              <div className={styles.tabSection}>
                <h3>Shopping Cart</h3>
                {cart.length === 0 ? (
                  <div className={styles.emptyState}>
                    <FontAwesomeIcon icon={faShoppingCart} className={styles.emptyIcon} />
                    <p className={styles.emptyText}>Your cart is empty</p>
                    <button
                      onClick={() => navigate('/products')}
                      className={styles.actionButton}
                    >
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className={styles.cartItems}>
                    {cart.map(item => (
                      <div key={item.product_id} className={styles.cartItem}>
                        <img src={item.image} alt={item.name} className={styles.itemImage} />
                        <div className={styles.itemInfo}>
                          <h4>{item.name}</h4>
                          <p>Quantity: {item.quantity}</p>
                          <p>Price: ${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;