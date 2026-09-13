import { useEffect, useState } from 'react';
import {
  ClipboardList,
  Users,
  Bike,
  CalendarClock,
  Banknote,
  PackageX,
  AlertTriangle,
} from 'lucide-react';
import Layout from '../components/Layout';
import TarjetaMetrica from '../components/TarjetaMetrica';
import CargandoInline from '../components/CargandoInline';
import ErrorBanner from '../components/ErrorBanner';
import { useAuth } from '../context/AuthContext';
import { puede } from '../utils/permisos';
import * as dashboardService from '../services/dashboard.service';
import { formatearMoneda } from '../utils/formato';

const ETIQUETAS_ESTADO = {
  RECIBIDA: 'Recibida',
  EN_DIAGNOSTICO: 'En diagnostico',
  EN_COTIZACION: 'En cotizacion',
  APROBADA: 'Aprobada',
  EN_REPARACION: 'En reparacion',
  LISTA: 'Lista',
  ENTREGADA: 'Entregada',
  CANCELADA: 'Cancelada',
};

export default function Dashboard() {
  const { usuario } = useAuth();
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

  // El Administrador supervisa (clientes, inventario, facturacion);
  // la operacion diaria (ordenes, motos, citas) es dominio de Recepcionista.
  const verOperacion = puede(usuario, 'ordenes', 'ver');

  const totalOrdenesActivas =
    resumen?.ordenesPorEstado
      ?.filter((o) => !['ENTREGADA', 'CANCELADA'].includes(o.estado))
      .reduce((acc, o) => acc + o.cantidad, 0) ?? 0;

  return (
    <Layout>
      <div className="mb-7">
        <h1 className="font-display text-2xl font-semibold text-taller-100 uppercase tracking-wide">
          Panel general
        </h1>
        <p className="text-taller-400 text-sm mt-1">
          {usuario?.rol === 'ADMINISTRADOR'
            ? 'Vision ejecutiva del taller: clientes, inventario e ingresos.'
            : 'Resumen operativo del taller en tiempo real.'}
        </p>
      </div>

      {cargando && <CargandoInline>Cargando indicadores...</CargandoInline>}
      <ErrorBanner>{error}</ErrorBanner>

      {resumen && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {verOperacion && (
              <TarjetaMetrica
                icono={ClipboardList}
                etiqueta="Ordenes activas"
                valor={totalOrdenesActivas}
                acento
                to="/ordenes"
              />
            )}
            <TarjetaMetrica icono={Users} etiqueta="Clientes" valor={resumen.totalClientes} to="/clientes" />
            {verOperacion && (
              <TarjetaMetrica
                icono={Bike}
                etiqueta="Motocicletas"
                valor={resumen.totalMotocicletas}
                to="/motocicletas"
              />
            )}
            {verOperacion && (
              <TarjetaMetrica
                icono={CalendarClock}
                etiqueta="Citas proximas"
                valor={resumen.citasProximas}
                to="/citas"
              />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <TarjetaMetrica
              icono={Banknote}
              etiqueta="Ingresos facturados"
              valor={formatearMoneda(resumen.ingresosFacturados)}
              acento
              to="/facturas"
            />
            <TarjetaMetrica
              icono={PackageX}
              etiqueta="Repuestos stock bajo"
              valor={resumen.repuestosStockBajo.cantidad}
              to="/inventario"
            />
            <TarjetaMetrica
              icono={ClipboardList}
              etiqueta="Facturas emitidas"
              valor={resumen.totalFacturas}
              to="/facturas"
            />
          </div>

          {verOperacion && (
            <div className="relative bg-taller-850 border border-taller-700 rounded-xl p-6 mb-8">
              <span className="absolute top-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
              <span className="absolute top-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />
              <span className="absolute bottom-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
              <span className="absolute bottom-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />

              <h2 className="text-taller-100 font-semibold text-sm mb-4 uppercase tracking-wide">
                Ordenes por estado
              </h2>

              {resumen.ordenesPorEstado.length === 0 ? (
                <p className="text-taller-400 text-sm">No hay ordenes registradas todavia.</p>
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
          )}

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
                      {r.stock} / min. {r.stockMinimo}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}
