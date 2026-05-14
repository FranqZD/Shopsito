import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { toast } from '../utils/toast';

interface Props {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute = ({ children, requiredRole = 'SELLER' }: Props) => {
  const { isAuthenticated, user, token } = useAuthStore();
  const location = useLocation();

  // Check token expiration (with error handling for malformed tokens)
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        useAuthStore.getState().logout();
        toast.info('Session expired. Please log in again.');
        return <Navigate to="/login" state={{ from: location }} replace />;
      }
    } catch {
      useAuthStore.getState().logout();
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    toast.error('Insufficient permissions.');
    return <Navigate to="/products" replace />;
  }

  return <>{children}</>;
};
