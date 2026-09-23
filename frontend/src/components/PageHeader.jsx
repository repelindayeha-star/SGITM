import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * volver: true  -> vuelve a la pantalla anterior del historial
 *         '/ruta' -> vuelve a esa ruta concreta
 *
 * En el telefono el menu lateral es un cajon que hay que abrir, asi que sin
 * este boton una pantalla de detalle deja a la persona sin salida visible.
 */
export default function PageHeader({ titulo, descripcion, accion, volver }) {
  const navigate = useNavigate();

  return (
    <div className="mb-6 sm:mb-7">
      {volver && (
        <button
          type="button"
          onClick={() => (typeof volver === 'string' ? navigate(volver) : navigate(-1))}
          className="flex items-center gap-1.5 text-taller-400 hover:text-ambar-400 text-sm mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
      )}
      <div className="flex items-start justify-between gap-3 sm:gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="font-display text-xl sm:text-2xl font-semibold text-taller-100 uppercase tracking-wide">
            {titulo}
          </h1>
          {descripcion && <p className="text-taller-400 text-sm mt-1">{descripcion}</p>}
        </div>
        {accion && <div className="shrink-0">{accion}</div>}
      </div>
    </div>
  );
}
