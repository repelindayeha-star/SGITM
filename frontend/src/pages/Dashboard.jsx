import { useEffect, useState } from 'react';
import {
  ClipboardList,
  Users,
  Bike,
  CalendarClock,
  Banknote,
  PackageX,
  AlertTriangle,
  TrendingUp,
  Wrench,
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

  // El administrador es el dueno del negocio: ve plata, no operacion diaria.
  const esAdministrador = usuario?.rol === 'ADMINISTRADOR';
  const negocio = resumen?.negocio;

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

          {esAdministrador && negocio && (
            <div className="relative bg-taller-850 border border-taller-700 rounded-xl p-5 sm:p-6 mb-8">
              <h2 className="flex items-center gap-2 text-taller-100 font-semibold text-sm mb-1 uppercase tracking-wide">
                <TrendingUp className="w-4 h-4 text-ambar-400" />
                Resultados del negocio
              </h2>
              <p className="text-taller-400 text-xs mb-5">
                De donde salieron los ingresos y que produjo cada mecanico.
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                  ['Ingresos del mes', formatearMoneda(negocio.ingresosDelMes)],
                  ['Ingresos totales', formatearMoneda(negocio.ingresosTotales)],
                  ['Ticket promedio', formatearMoneda(negocio.ticketPromedio)],
                  ['Facturas emitidas', negocio.cantidadFacturas],
                ].map(([etiqueta, valor]) => (
                  <div key={etiqueta} className="bg-taller-900 border border-taller-700 rounded-lg px-3 py-3">
                    <p className="text-taller-400 text-[10px] uppercase tracking-wide mb-1">{etiqueta}</p>
                    <p className="text-ambar-400 font-mono text-base font-semibold break-words">{valor}</p>
                  </div>
                ))}
              </div>

              {/* Composicion: cuanto vino del trabajo de la gente y cuanto de
                  vender repuestos. Son dos negocios distintos dentro del mismo
                  taller y conviene verlos separados. */}
              <p className="text-taller-200 text-xs font-medium uppercase tracking-wide mb-2">
                De donde vienen los ingresos
              </p>
              {(() => {
                const mo = Number(negocio.composicion.manoObra) || 0;
                const rp = Number(negocio.composicion.repuestos) || 0;
                const suma = mo + rp;
                const pct = (v) => (suma > 0 ? Math.round((v / suma) * 100) : 0);
                return (
                  <div className="mb-6">
                    <div className="flex h-2.5 rounded-full overflow-hidden bg-taller-900 mb-2">
                      <div className="bg-ambar-400" style={{ width: `${pct(mo)}%` }} />
                      <div className="bg-taller-600" style={{ width: `${pct(rp)}%` }} />
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
                      <span className="text-taller-300">
                        <span className="inline-block w-2 h-2 rounded-full bg-ambar-400 mr-1.5" />
                        Mano de obra <span className="font-mono text-taller-100">{formatearMoneda(mo)}</span>
                        <span className="text-taller-400"> ({pct(mo)}%)</span>
                      </span>
                      <span className="text-taller-300">
                        <span className="inline-block w-2 h-2 rounded-full bg-taller-600 mr-1.5" />
                        Repuestos <span className="font-mono text-taller-100">{formatearMoneda(rp)}</span>
                        <span className="text-taller-400"> ({pct(rp)}%)</span>
                      </span>
                    </div>
                  </div>
                );
              })()}

              <p className="text-taller-200 text-xs font-medium uppercase tracking-wide mb-2">
                Produccion por mecanico
              </p>
              {negocio.porMecanico.length === 0 ? (
                <p className="text-taller-400 text-sm">Todavia no hay facturas emitidas.</p>
              ) : (
                <div className="space-y-2">
                  {negocio.porMecanico.map((m) => {
                    const maximo = Math.max(...negocio.porMecanico.map((x) => x.ingresos), 1);
                    return (
                      <div key={m.nombre} className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 text-taller-200 text-xs w-36 sm:w-44 shrink-0 truncate">
                          <Wrench className="w-3 h-3 text-taller-400 shrink-0" />
                          {m.nombre}
                        </span>
                        <div className="flex-1 h-2 bg-taller-900 rounded-full overflow-hidden min-w-0">
                          <div className="h-full bg-ambar-400 rounded-full"
                               style={{ width: `${(m.ingresos / maximo) * 100}%` }} />
                        </div>
                        <span className="text-taller-100 font-mono text-xs w-24 text-right shrink-0">
                          {formatearMoneda(m.ingresos)}
                        </span>
                        <span className="text-taller-400 text-[11px] w-16 text-right shrink-0 hidden sm:block">
                          {m.ordenes} {m.ordenes === 1 ? 'orden' : 'ordenes'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="text-taller-400 text-[11px] mt-4">
                Los ingresos se reparten por el mecanico asignado a cada orden facturada.
              </p>
            </div>
          )}

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
