import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function ProtectedRoute({ children }) {
  const { session } = useAuth();

  // session === undefined significa que todavía está cargando
  if (session === undefined) return null;

  if (!session) return <Navigate to="/admin/login" replace />;

  return children;
}

export default ProtectedRoute;