import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect unauthorized roles back to their default dashboard
    const defaultRoute = 
      user?.role === 'admin' 
        ? '/admin' 
        : user?.role === 'guide' 
        ? '/guide' 
        : '/dashboard';
    return <Navigate to={defaultRoute} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
