import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { rutaInicioPorRol } from '../utils/permisos';

export default function NoAutorizado() {
  const { usuario } = useAuth();
  const rutaInicio = rutaInicioPorRol(usuario?.rol);

  return (
    <div className="min-h-screen bg-taller-900 flex items-center justify-center px-4">
      <div className="relative bg-taller-850 border border-taller-700 rounded-xl p-10 max-w-md text-center">
        <span className="absolute top-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
        <span className="absolute top-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />
        <span className="absolute bottom-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
        <span className="absolute bottom-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />

        <div className="w-14 h-14 rounded-lg bg-red-950/40 border border-red-800/50 flex items-center justify-center mx-auto mb-5">
          <ShieldAlert className="w-7 h-7 text-red-400" strokeWidth={1.75} />
        </div>
        <h1 className="font-display text-xl font-semibold text-taller-100 uppercase tracking-wide mb-2">
          Acceso no autorizado
        </h1>
        <p className="text-taller-400 text-sm mb-6">
          Tu rol no tiene permisos para ver esta seccion del sistema.
        </p>
        <Link
          to={rutaInicio}
          className="inline-block bg-ambar-400 hover:bg-ambar-500 text-taller-950 font-semibold text-sm rounded-md px-5 py-2.5 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
