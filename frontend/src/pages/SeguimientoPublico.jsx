import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Wrench, Search, Bike, LoaderCircle } from 'lucide-react';
import LineaTiempoOrden from '../components/LineaTiempoOrden';
import GaleriaEvidencias from '../components/GaleriaEvidencias';
import EstadoBadge from '../components/EstadoBadge';
import { formatearFecha } from '../utils/formato';
import * as ordenService from '../services/orden.service';

/**
 * Seguimiento publico por codigo/QR. No requiere iniciar sesion.
 *
 * El backend ya generaba un `codigo` unico por orden desde el primer dia y
 * exponia /ordenes/seguimiento/:codigo, pero no habia ninguna pantalla que lo
 * usara. Esta es esa pantalla.
 *
 * El endpoint devuelve una proyeccion reducida a proposito: estado, avance y
 * datos de la moto. Ni nombres, ni telefonos, ni cotizacion, ni factura.
 */
export default function SeguimientoPublico() {
  const { codigo: codigoUrl } = useParams();
  const navigate = useNavigate();

  const [codigo, setCodigo] = useState(codigoUrl || '');
  const [orden, setOrden] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const buscar = useCallback(async (valor) => {
    const limpio = (valor || '').trim().toUpperCase();
    if (!limpio) return;

    setCargando(true);
    setError('');
    setOrden(null);

    try {
      const datos = await ordenService.obtenerPorCodigo(limpio);
      setOrden(datos);
    } catch (err) {
      setError(
        err.response?.status === 404
          ? 'No encontramos ninguna orden con ese codigo. Revisa que este completo.'
          : 'No pudimos consultar el estado en este momento. Intenta de nuevo.'
      );
    } finally {
      setCargando(false);
    }
  }, []);

  // Si llega por QR el codigo viene en la URL: consultamos de una.
  useEffect(() => {
    if (codigoUrl) buscar(codigoUrl);
  }, [codigoUrl, buscar]);

  function manejarSubmit(e) {
    e.preventDefault();
    const limpio = codigo.trim().toUpperCase();
    if (!limpio) return;
    // Deja el codigo en la URL para que la consulta se pueda compartir.
    navigate(`/seguimiento/${limpio}`);
  }

  return (
    <div className="relative min-h-screen bg-taller-900 px-4 py-10 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-taller-200) 1px, transparent 1px), linear-gradient(90deg, var(--color-taller-200) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-ambar-400 to-transparent opacity-60" />

      <div className="relative w-full max-w-lg mx-auto">
        <div className="flex flex-col items-center mb-7">
          <div className="w-12 h-12 rounded-lg bg-taller-800 border border-taller-700 flex items-center justify-center mb-3">
            <Wrench className="w-6 h-6 text-ambar-400" strokeWidth={1.75} />
          </div>
          <h1 className="font-display text-2xl font-semibold text-taller-100 tracking-wide uppercase">
            Estado de tu moto
          </h1>
          <p className="text-taller-400 text-xs font-mono mt-1 tracking-wider">
            CONSULTA CON EL CODIGO DE TU ORDEN
          </p>
        </div>

        <form onSubmit={manejarSubmit} className="flex gap-2 mb-6">
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="OT-2026-XXXXXX"
            aria-label="Codigo de la orden"
            className="flex-1 bg-taller-850 border border-taller-700 rounded-md px-3 py-2.5 text-taller-100 placeholder-taller-400 text-sm font-mono uppercase outline-none focus:border-ambar-400 focus:ring-1 focus:ring-ambar-400 transition-colors"
          />
          <button
            type="submit"
            disabled={cargando || !codigo.trim()}
            className="bg-ambar-400 hover:bg-ambar-500 disabled:opacity-50 text-taller-950 font-semibold text-sm rounded-md px-4 flex items-center gap-2 transition-colors shrink-0"
          >
            {cargando ? (
              <LoaderCircle className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Consultar
          </button>
        </form>

        {error && (
          <div className="rounded-md border border-red-800/60 bg-red-950/40 px-3 py-2.5 mb-6">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {orden && (
          <div className="relative bg-taller-850 border border-taller-700 rounded-xl p-6">
            <span className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-taller-700" />
            <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-taller-700" />
            <span className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-taller-700" />
            <span className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-taller-700" />

            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <span className="text-taller-100 font-mono text-sm">{orden.codigo}</span>
              <EstadoBadge estado={orden.estado} />
            </div>

            <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-taller-700">
              <Bike className="w-4 h-4 text-ambar-400 shrink-0" strokeWidth={1.75} />
              <div className="min-w-0">
                <p className="text-taller-100 text-sm font-medium">
                  {orden.motocicleta?.marca} {orden.motocicleta?.modelo}
                </p>
                <p className="text-taller-400 text-xs font-mono">
                  {orden.motocicleta?.anio} · Recibida el {formatearFecha(orden.fechaRecibido)}
                </p>
              </div>
            </div>

            {orden.descripcionProblema && (
              <p className="text-taller-200 text-sm mb-5">{orden.descripcionProblema}</p>
            )}

            <LineaTiempoOrden estado={orden.estado} historial={orden.historialEstados || []} />

            {orden.evidencias?.length > 0 && (
              <div className="mt-6 pt-5 border-t border-taller-700">
                <h2 className="text-taller-100 text-sm font-semibold uppercase tracking-wide mb-1">
                  Fotos del trabajo
                </h2>
                <p className="text-taller-400 text-xs mb-4">
                  Lo que el taller registró mientras trabajaba en tu moto.
                </p>
                <GaleriaEvidencias ordenId={orden.id} evidencias={orden.evidencias} />
              </div>
            )}
          </div>
        )}

        <p className="text-center text-taller-400 text-xs font-mono mt-8">
          SIGTM · Sistema Integral de Gestion - Talleres de Motocicletas
        </p>
      </div>
    </div>
  );
}
