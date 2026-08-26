import { useEffect, useState } from 'react';
import {
  ClipboardList,
  Users,
  Bike,
  CalendarClock,
  Banknote,
  PackageX,
  LoaderCircle,
  AlertTriangle,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import TarjetaMetrica from '../components/TarjetaMetrica';
import * as dashboardService from '../services/dashboard.service';

const ETIQUETAS_ESTADO = {
  RECIBIDA: 'Recibida',
  EN_DIAGNOSTICO: 'En diagnóstico',
  EN_COTIZACION: 'En cotización',
  APROBADA: 'Aprobada',
  EN_REPARACION: 'En reparación',
  LISTA: 'Lista',
  ENTREGADA: 'Entregada',
  CANCELADA: 'Cancelada',
};

function formatearMoneda(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor);
}

export default function Dashboard() {
  const [resumen, setResumen] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    dashboardService
      .obtenerResumen()
      .then(setResumen)
      .catch(() => setError('No se pudo cargar el resumen del taller.'))
      .finally(() => setCargando(false));
  }, []);

  const totalOrdenesActivas =
    resumen?.ordenesPorEstado
      ?.filter((o) => !['ENTREGADA', 'CANCELADA'].includes(o.estado))
      .reduce((acc, o) => acc + o.cantidad, 0) ?? 0;

  return (
    <div className="min-h-screen bg-taller-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-7">
          <h1 className="font-display text-2xl font-semibold text-taller-100 uppercase tracking-wide">
            Panel general
          </h1>
          <p className="text-taller-600 text-sm mt-1">Resumen operativo del taller en tiempo real.</p>
        </div>

        {cargando && (
          <div className="flex items-center gap-2 text-taller-600 text-sm">
            <LoaderCircle className="w-4 h-4 animate-spin" />
            Cargando indicadores...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-md border border-red-800/60 bg-red-950/40 px-4 py-3 text-red-300 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {resumen && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <TarjetaMetrica
                icono={ClipboardList}
                etiqueta="Órdenes activas"
                valor={totalOrdenesActivas}
                acento
              />
              <TarjetaMetrica icono={Users} etiqueta="Clientes" valor={resumen.totalClientes} />
              <TarjetaMetrica icono={Bike} etiqueta="Motocicletas" valor={resumen.totalMotocicletas} />
              <TarjetaMetrica
                icono={CalendarClock}
                etiqueta="Citas próximas"
                valor={resumen.citasProximas}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
              <TarjetaMetrica
                icono={Banknote}
                etiqueta="Ingresos facturados"
                valor={formatearMoneda(resumen.ingresosFacturados)}
                acento
              />
              <TarjetaMetrica
                icono={PackageX}
                etiqueta="Repuestos stock bajo"
                valor={resumen.repuestosStockBajo.cantidad}
              />
              <TarjetaMetrica icono={ClipboardList} etiqueta="Facturas emitidas" valor={resumen.totalFacturas} />
            </div>

            <div className="relative bg-taller-850 border border-taller-700 rounded-xl p-6 mb-8">
              <span className="absolute top-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
              <span className="absolute top-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />
              <span className="absolute bottom-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
              <span className="absolute bottom-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />

              <h2 className="text-taller-100 font-semibold text-sm mb-4 uppercase tracking-wide">
                Órdenes por estado
              </h2>

              {resumen.ordenesPorEstado.length === 0 ? (
                <p className="text-taller-600 text-sm">No hay órdenes registradas todavía.</p>
              ) : (
                <div className="space-y-2.5">
                  {resumen.ordenesPorEstado.map((item) => {
                    const maxCantidad = Math.max(...resumen.ordenesPorEstado.map((o) => o.cantidad));
                    const porcentaje = (item.cantidad / maxCantidad) * 100;
                    return (
                      <div key={item.estado} className="flex items-center gap-3">
                        <span className="text-taller-200 text-xs font-mono w-32 shrink-0">
                          {ETIQUETAS_ESTADO[item.estado] || item.estado}
                        </span>
                        <div className="flex-1 h-2 bg-taller-900 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-ambar-400 rounded-full transition-all"
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                        <span className="text-taller-100 text-sm font-semibold w-6 text-right">
                          {item.cantidad}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {resumen.repuestosStockBajo.cantidad > 0 && (
              <div className="relative bg-taller-850 border border-ambar-500/40 rounded-xl p-6">
                <h2 className="flex items-center gap-2 text-ambar-400 font-semibold text-sm mb-4 uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4" />
                  Repuestos con stock bajo
                </h2>
                <div className="space-y-2">
                  {resumen.repuestosStockBajo.detalle.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between border-b border-taller-700 last:border-0 pb-2 last:pb-0"
                    >
                      <span className="text-taller-100 text-sm">{r.nombre}</span>
                      <span className="text-ambar-400 text-xs font-mono">
                        {r.stock} / mín. {r.stockMinimo}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}