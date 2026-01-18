import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/authHook.js';
import Loader from '../ui/Loader.jsx';

const AuthLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader message="Checking authentication..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default AuthLayout;