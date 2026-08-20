import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

/**
 * Filtra por rol EN EL FRONTEND solo para no mostrar botones que de todas formas
 * el backend va a rechazar. La autorizacion real (que no se pueda ver info de otro
 * cliente, etc.) siempre se valida en el Service del backend, nunca solo aqui.
 */
export default function ProtectedRoute({ rolRequerido, children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) return <p style={{ padding: 24 }}>Cargando...</p>;
  if (!usuario) return <Navigate to="/login" replace />;
  if (rolRequerido && usuario.rol !== rolRequerido) return <Navigate to="/" replace />;

  return children;
}
