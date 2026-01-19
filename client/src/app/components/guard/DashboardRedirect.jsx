import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/authHook.js';
import Loader from "../../ui/Loader.jsx";

const DashboardRedirect = () => {
  const { user, loading, getDashboardPath, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      const dashboardPath = getDashboardPath();
      navigate(dashboardPath, { replace: true });
    }
  }, [user, loading, navigate, getDashboardPath, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader message="Redirecting to dashboard..." />
      </div>
    );
  }

  return null;
};

export default DashboardRedirect;