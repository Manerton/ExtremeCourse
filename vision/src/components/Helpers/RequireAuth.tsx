import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface RequireAuthProps {
  children: React.ReactNode;
  allowedRoles?: number[]; // сюда можно передать список ролей, которые имеют доступ
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children, allowedRoles }) => {
  const { user, initialized } = useAuth();

  if (!initialized) {
    return <div>Загрузка...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />; // редиректим, если роль не подходит
  }

  return <>{children}</>;
};

export default RequireAuth;
