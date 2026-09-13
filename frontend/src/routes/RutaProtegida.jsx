import { Navigate } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RutaProtegida({ children, rolesPermitidos }) {
  const { usuario, cargando, estaAutenticado } = useAuth();

  if (cargando) {
    return (
      <div className="flex h-screen items-center justify-center bg-taller-900 gap-2 text-taller-400 text-sm">
        <LoaderCircle className="w-4 h-4 animate-spin" />
        Cargando...
      </div>
    );
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/no-autorizado" replace />;
  }

  return children;
}
