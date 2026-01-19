import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/authHook.js';
import Loader from '../ui/Loader.jsx';

const GuestRoute = () => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader message="Checking authentication..." />
      </div>
    );
  }

  if (isAuthenticated) {
    if (isAdmin) {
      return <Navigate to="/admin-dashboard" replace />;
    }
    return <Navigate to="/user-dashboard" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;