import { Check, XCircle } from 'lucide-react';
import { PASOS_CLIENTE, indicePasoDeEstado, asientoDePaso } from '../utils/estadosOrden';
import { formatearFechaHora } from '../utils/formato';

/**
 * Avance de la orden en lenguaje de cliente.
 *
 * Un EstadoBadge dice "En cotizacion"; esta linea de tiempo dice ademas si
 * eso es el principio, la mitad o casi el final. Es la diferencia entre una
 * etiqueta y un rastreo.
 *
 * `historial` viene del backend (HistorialEstadoOrden) y es lo que le pone
 * fecha a cada paso. Sin historial el componente igual funciona: pinta el
 * avance, solo que sin fechas.
 *
 * `mostrarAutor` solo se activa en las pantallas internas del taller. En el
 * portal del cliente y en el seguimiento publico los nombres del personal
 * no se muestran.
 */
export default function LineaTiempoOrden({ estado, historial = [], mostrarAutor = false }) {
  if (estado === 'CANCELADA') {
    const asiento = historial.find((h) => h.estadoNuevo === 'CANCELADA');
    return (
      <div className="flex items-start gap-3 rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3">
        <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-red-300 text-sm font-medium">Orden cancelada</p>
          {asiento && (
            <p className="text-taller-400 text-[11px] font-mono mt-0.5">
              {formatearFechaHora(asiento.createdAt)}
              {mostrarAutor && asiento.usuario ? ` Â· ${asiento.usuario.nombre}` : ''}
            </p>
          )}
        </div>
      </div>
    );
  }

  const indiceActual = indicePasoDeEstado(estado);

  return (
    <ol>
      {PASOS_CLIENTE.map((paso, i) => {
        const completado = i < indiceActual;
        const actual = i === indiceActual;
        const alcanzado = completado || actual;
        const asiento = asientoDePaso(paso, historial);
        const esUltimo = i === PASOS_CLIENTE.length - 1;

        return (
          <li key={paso.clave} className="relative flex gap-3 pb-5 last:pb-0">
            {/* Riel que une un punto con el siguiente */}
            {!esUltimo && (
              <span
                aria-hidden="true"
                className={`absolute left-[11px] top-6 bottom-0 w-px ${
                  completado ? 'bg-ambar-400/50' : 'bg-taller-700'
                }`}
              />
            )}

            <span
              className={`relative z-10 shrink-0 w-6 h-6 rounded-full border flex items-center justify-center ${
                completado
                  ? 'bg-ambar-400 border-ambar-400'
                  : actual
                    ? 'bg-taller-900 border-ambar-400'
                    : 'bg-taller-900 border-taller-700'
              }`}
            >
              {completado ? (
                <Check className="w-3.5 h-3.5 text-taller-950" strokeWidth={3} />
              ) : (
                <span
                  className={`w-2 h-2 rounded-full ${
                    actual ? 'bg-ambar-400 motion-safe:animate-pulse' : 'bg-taller-700'
                  }`}
                />
              )}
            </span>

            <div className="min-w-0 pt-0.5">
              <p className={`text-sm font-medium ${alcanzado ? 'text-taller-100' : 'text-taller-400'}`}>
                {paso.titulo}
                {actual && (
                  <span className="ml-2 text-ambar-400 text-[10px] font-mono uppercase tracking-wider">
                    en curso
                  </span>
                )}
              </p>
              <p className="text-taller-400 text-xs mt-0.5">{paso.detalle}</p>
              {asiento && (
                <p className="text-taller-400 text-[11px] font-mono mt-1">
                  {formatearFechaHora(asiento.createdAt)}
                  {mostrarAutor && asiento.usuario ? ` Â· ${asiento.usuario.nombre}` : ''}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
