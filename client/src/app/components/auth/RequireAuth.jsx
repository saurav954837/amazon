import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/authHook.js';
import Loader from '../../ui/Loader.jsx';

const RequireAuth = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="auth-loading">
        <Loader message="Checking authentication..." />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

export default RequireAuth;