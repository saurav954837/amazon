import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/authHook.js';
import { authApi } from '../../hooks/authHook.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUsers,
  faBoxes,
  faChartLine,
  faCog,
  faShoppingCart,
  faDollarSign,
  faUserShield
} from '@fortawesome/free-solid-svg-icons';
import styles from '../../styles/AdminDashboard.module.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      const [usersResponse, productsResponse] = await Promise.all([
        authApi.get('/admin/users'),
        authApi.get('/products')
      ]);

      let totalOrders = 0;
      let totalRevenue = 0;

      setStats({
        totalUsers: usersResponse.data.success ? (usersResponse.data.data?.length || 0) : 0,
        totalProducts: productsResponse.data.success ? (productsResponse.data.data?.length || 0) : 0,
        totalOrders: totalOrders,
        totalRevenue: totalRevenue
      });

    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      
      if (error.response?.status === 403) {
        alert('Access denied. You need admin privileges.');
        navigate('/dashboard');
      } else if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        logout();
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const adminModules = [
    {
      title: 'User Management',
      description: 'Manage all users and their permissions',
      icon: faUsers,
      color: styles.iconBlue,
      path: '/admin/users',
    },
    {
      title: 'Product Management',
      description: 'Add, edit, or remove products',
      icon: faBoxes,
      color: styles.iconGreen,
      path: '/admin/products',
    },
    {
      title: 'Order Management',
      description: 'View and process all orders',
      icon: faShoppingCart,
      color: styles.iconYellow,
      path: '/admin/orders',
    },
  ];

  return (
    <div className={styles.adminContainer}>
      <header className={styles.adminHeader}>
        <div className={styles.headerWrapper}>
          <div className={styles.brand}>
            <div className={styles.adminLogo}>
              <FontAwesomeIcon icon={faUserShield} />
            </div>
            <div className={styles.brandInfo}>
              <h1>Admin Dashboard</h1>
              <p>Welcome, {user?.first_name} {user?.last_name}</p>
            </div>
          </div>
          <div className={styles.headerActions}>
            <button
              onClick={handleLogout}
              className={styles.adminLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className={styles.dashboardContent}>
        <div className={styles.statsOverview}>
          <div className={styles.statTile}>
            <div className={styles.statContent}>
              <div className={`${styles.statIcon} ${styles.statsIconBlue}`}>
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div className={styles.statInfo}>
                <p>Total Users</p>
                <div className={styles.value}>
                  {loading ? '...' : stats.totalUsers}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.statTile}>
            <div className={styles.statContent}>
              <div className={`${styles.statIcon} ${styles.statsIconGreen}`}>
                <FontAwesomeIcon icon={faBoxes} />
              </div>
              <div className={styles.statInfo}>
                <p>Total Products</p>
                <div className={styles.value}>
                  {loading ? '...' : stats.totalProducts}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.statTile}>
            <div className={styles.statContent}>
              <div className={`${styles.statIcon} ${styles.statsIconYellow}`}>
                <FontAwesomeIcon icon={faShoppingCart} />
              </div>
              <div className={styles.statInfo}>
                <p>Total Orders</p>
                <div className={styles.value}>
                  {loading ? '...' : stats.totalOrders}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.statTile}>
            <div className={styles.statContent}>
              <div className={`${styles.statIcon} ${styles.statsIconEmerald}`}>
                <FontAwesomeIcon icon={faDollarSign} />
              </div>
              <div className={styles.statInfo}>
                <p>Total Revenue</p>
                <div className={styles.value}>
                  ${loading ? '...' : stats.totalRevenue.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modulesSection}>
          <h2 className={styles.sectionTitle}>Administration Modules</h2>
          <div className={styles.modulesGrid}>
            {adminModules.map((module, index) => (
              <div
                key={index}
                className={styles.moduleCard}
                onClick={() => navigate(module.path)}
              >
                <div className={`${styles.moduleIcon} ${module.color}`}>
                  <FontAwesomeIcon icon={module.icon} />
                </div>
                <h3 className={styles.moduleTitle}>{module.title}</h3>
                <p className={styles.moduleDescription}>{module.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.activitySection}>
          <div className={styles.activityHeader}>
            <h2>Recent Activity</h2>
          </div>
          <div className={styles.activityContent}>
            <p className={styles.emptyActivity}>No recent activity</p>
            <p className={styles.emptySubtext}>
              Activity will appear here as users interact with the platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;