import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type AppRole = "citizen" | "authority" | "admin";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const role = user.role as AppRole;

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === "admin") return <Navigate to="/admin-dashboard" replace />;
    if (role === "authority") return <Navigate to="/authority-dashboard" replace />;
    return <Navigate to="/citizen-dashboard" replace />;
  }

  return <>{children}</>;
}
