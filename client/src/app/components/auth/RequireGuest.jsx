import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/authHook.js';
import Loader from '../../ui/Loader.jsx';

const RequireGuest = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <Loader />
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RequireGuest