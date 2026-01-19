import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/authHook.jsx';

const ProtectedRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="auth-loading">Checking authentication...</div>
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
};

export default ProtectedRoutes;