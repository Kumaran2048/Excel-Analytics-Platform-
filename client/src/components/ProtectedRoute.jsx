import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/user-dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;