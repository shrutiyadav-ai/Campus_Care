import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner spinner-lg"></div>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Authenticating...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required
  if (requiredRole && profile?.role !== requiredRole) {
    // If student tries to access admin route, redirect to student dashboard
    if (profile?.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    }
    // If admin tries to access student route, redirect to admin dashboard
    if (profile?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

