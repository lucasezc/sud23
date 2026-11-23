import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, token, sessionLoading } = useAuth();
  const location = useLocation();

  if (sessionLoading) return <main className="grid min-h-screen place-items-center text-sm">Verificando tu sesión...</main>;
  if (!user || !token) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
