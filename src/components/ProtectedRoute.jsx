import { Navigate } from 'react-router-dom';
import { getCurrentUser, hasRole } from '../lib/auth';

const ProtectedRoute = ({ children, requiredRole, redirectTo = '/login' }) => {
  const user = getCurrentUser();
  
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }
  
  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;