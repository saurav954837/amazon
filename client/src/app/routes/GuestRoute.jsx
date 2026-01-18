import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/authHook.js';
import Loader from '../ui/Loader.jsx';

const GuestRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader message="Checking authentication..." />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default GuestRoute;