import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import CartSidebar from '../components/CartSidebar.jsx';
import { useAuth } from '../hooks/authHook.js';
import styles from '../styles/MainLayout.module.css';

const MainLayout = () => {
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleCartClick = () => {
    if (!user) {
      navigate('/login', { state: { from: '/cart' } })
      return
    }
    setIsCartOpen(true)
  }

  const handleProfileClick = () => {
    if (user) {
      navigate('/user-dashboard')
    } else {
      navigate('/login')
    }
  }

  const handleAdminClick = () => {
    if (isAdmin) {
      navigate('/admin-dashboard')
    }
  }

  return (
    <div className={styles.layout}>
      <Header
        onCartClick={handleCartClick}
        user={user}
        onProfileClick={handleProfileClick}
        onLogout={logout}
        onAdminClick={handleAdminClick}
        isAdmin={isAdmin}
      />
      <Navbar user={user} />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <Footer />
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        user={user}
      />
    </div>
  )
};
export default MainLayout;