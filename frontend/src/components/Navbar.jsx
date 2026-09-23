import { Wrench, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ETIQUETAS_ROL = {
  ADMINISTRADOR: 'Administrador',
  RECEPCIONISTA: 'Recepcionista',
  MECANICO: 'Mecánico',
  CLIENTE: 'Cliente',
};

export default function Navbar({ onAbrirMenu }) {
  const { usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();

  function manejarCerrarSesion() {
    cerrarSesion();
    navigate('/login');
  }

  return (
    <header className="bg-taller-850 border-b border-taller-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          {/* Solo en celular: abre el menu. En escritorio la columna lateral
              siempre esta visible, asi que este boton sobra. */}
          {onAbrirMenu && (
            <button
              type="button"
              onClick={onAbrirMenu}
              aria-label="Abrir menu"
              className="md:hidden text-taller-300 hover:text-ambar-400 border border-taller-700 rounded-md p-2 transition-colors"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}
          <div className="w-9 h-9 shrink-0 rounded-lg bg-taller-800 border border-taller-700 hidden sm:flex items-center justify-center">
            <Wrench className="w-4.5 h-4.5 text-ambar-400" strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-display text-taller-100 text-sm font-semibold tracking-wide uppercase leading-none">
              SIGTM
            </p>
            <p className="text-taller-400 text-[11px] font-mono mt-0.5">Panel de control</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-taller-100 text-sm font-medium leading-tight">{usuario?.nombre}</p>
            <p className="text-ambar-400 text-[11px] font-mono uppercase tracking-wide">
              {ETIQUETAS_ROL[usuario?.rol] || usuario?.rol}
            </p>
          </div>
          <button
            onClick={manejarCerrarSesion}
            className="flex items-center gap-1.5 text-taller-400 hover:text-ambar-400 border border-taller-700 hover:border-ambar-400/50 rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
}