import { Wrench, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ETIQUETAS_ROL = {
  ADMINISTRADOR: 'Administrador',
  RECEPCIONISTA: 'Recepcionista',
  MECANICO: 'Mecánico',
  CLIENTE: 'Cliente',
};

export default function Navbar() {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  function manejarCerrarSesion() {
    cerrarSesion();
    navigate('/login');
  }

  return (
    <header className="bg-taller-850 border-b border-taller-700">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-taller-800 border border-taller-700 flex items-center justify-center">
            <Wrench className="w-4.5 h-4.5 text-ambar-400" strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-display text-taller-100 text-sm font-semibold tracking-wide uppercase leading-none">
              SIGTM
            </p>
            <p className="text-taller-600 text-[11px] font-mono mt-0.5">Panel de control</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-taller-100 text-sm font-medium leading-tight">{usuario?.nombre}</p>
            <p className="text-ambar-400 text-[11px] font-mono uppercase tracking-wide">
              {ETIQUETAS_ROL[usuario?.rol] || usuario?.rol}
            </p>
          </div>
          <button
            onClick={manejarCerrarSesion}
            className="flex items-center gap-1.5 text-taller-600 hover:text-ambar-400 border border-taller-700 hover:border-ambar-400/50 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}