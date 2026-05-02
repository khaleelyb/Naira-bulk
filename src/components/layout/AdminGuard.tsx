import { Navigate } from 'react-router-dom';
import { ADMIN_SESSION_KEY } from '../../pages/AdminLoginPage';

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const isAdmin = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';

  if (!isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  return <>{children}</>;
}
