import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Wrench,
  User,
  Bike,
  ClipboardList,
  Plus,
  Trash2,
  Receipt,
  LoaderCircle,
} from 'lucide-react';
import Layout from '../components/Layout';
import { Input, Select, Textarea } from '../components/Campo';
import ErrorBanner from '../components/ErrorBanner';
import CargandoInline from '../components/CargandoInline';
import EstadoBadge from '../components/EstadoBadge';
import LineaTiempoOrden from '../components/LineaTiempoOrden';
import GaleriaEvidencias from '../components/GaleriaEvidencias';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { puede } from '../utils/permisos';
import { transicionesDisponibles, ETIQUETAS_ESTADO_ORDEN } from '../utils/estadosOrden';
import { formatearMoneda } from '../utils/formato';
import * as ordenService from '../services/orden.service';
import * as diagnosticoService from '../services/diagnostico.service';
import * as facturaService from '../services/factura.service';
import * as inventarioService from '../services/inventario.service';
import * as usuarioService from '../services/usuario.service';

export default function OrdenDetalle() {
  const { id } = useParams();
  const { usuario } = useAuth();

  const [orden, setOrden] = useState(null);
  const [diagnostico, setDiagnostico] = useState(null);
  const [totalCotizacion, setTotalCotizacion] = useState(null);
  const [factura, setFactura] = useState(null);
  const [repuestos, setRepuestos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargarTodo = useCallback(async () => {
    setError('');
    try {
      const ordenData = await ordenService.obtenerOrden(id);
      setOrden(ordenData);

      try {
        const diag = await diagnosticoService.obtenerPorOrden(id);
        setDiagnostico(diag);
        const total = await diagnosticoService.calcularTotal(diag.id);
        setTotalCotizacion(total);
      } catch {
        setDiagnostico(null);
        setTotalCotizacion(null);
      }

      try {
        const fact = await facturaService.obtenerPorOrden(id);
        setFactura(fact);
      } catch {
        setFactura(null);
      }
    } catch {
      setError('No se pudo cargar la orden de trabajo.');
    } finally {
      setCargando(false);
    }
  }, [id]);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  useEffect(() => {
    if (puede(usuario, 'inventario', 'ver')) {
      inventarioService.listarRepuestos().then(setRepuestos).catch(() => {});
    }
  }, [usuario]);

  if (cargando) {
    return (
      <Layout>
        <CargandoInline>Cargando orden de trabajo...</CargandoInline>
      </Layout>
    );
  }

  if (!orden) {
    return (
      <Layout>
        <ErrorBanner>{error || 'Orden no encontrada.'}</ErrorBanner>
      </Layout>
    );
  }

  return (
    <Layout>
      <Link
        to="/ordenes"
        className="inline-flex items-center gap-1.5 text-taller-400 hover:text-ambar-400 text-sm mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a ordenes
      </Link>

      <ErrorBanner>{error}</ErrorBanner>

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-2xl font-semibold text-taller-100 uppercase tracking-wide">
              {orden.codigo}
            </h1>
            <EstadoBadge estado={orden.estado} />
          </div>
          <p className="text-taller-400 text-sm">{orden.descripcionProblema}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <InfoTarjeta icono={User} etiqueta="Cliente" valor={orden.cliente?.usuario?.nombre ?? '-'} />
        <InfoTarjeta icono={Bike} etiqueta="Motocicleta" valor={`${orden.motocicleta?.placa ?? ''} - ${orden.motocicleta?.marca ?? ''} ${orden.motocicleta?.modelo ?? ''}`} />
        <InfoTarjeta icono={Wrench} etiqueta="Mecanico asignado" valor={orden.mecanico?.nombre ?? 'Sin asignar'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <PanelEstado orden={orden} usuario={usuario} onActualizado={cargarTodo} />
        <PanelMecanico orden={orden} usuario={usuario} onActualizado={cargarTodo} />
      </div>

      <div className="mb-6">
        <Panel titulo="Avance de la orden">
          <LineaTiempoOrden
            estado={orden.estado}
            historial={orden.historialEstados || []}
            mostrarAutor
          />
          {/* El enlace que se le entrega al cliente (o se imprime como QR).
              Es publico a proposito: solo muestra el avance, nada mas. */}
          <p className="text-taller-400 text-[11px] font-mono mt-4 pt-3 border-t border-taller-700 break-all">
            Seguimiento del cliente: {`${window.location.origin}/seguimiento/${orden.codigo}`}
          </p>
        </Panel>
      </div>

      <div className="mb-6">
        <Panel titulo="Evidencias del trabajo">
          <p className="text-taller-400 text-sm mb-4">
            Las fotos que se suban aquí las ve el cliente en su portal y en la página de
            seguimiento. Es lo que le permite comprobar qué se le hizo a la moto.
          </p>
          <GaleriaEvidencias
            ordenId={orden.id}
            evidencias={orden.evidencias || []}
            editable={puede(usuario, 'ordenes', 'editar')}
            ordenCerrada={['ENTREGADA', 'CANCELADA'].includes(orden.estado)}
            alCambiar={cargarTodo}
          />
        </Panel>
      </div>

      <PanelDiagnostico
        orden={orden}
        diagnostico={diagnostico}
        totalCotizacion={totalCotizacion}
        repuestos={repuestos}
        usuario={usuario}
        onActualizado={cargarTodo}
      />

      <PanelFactura
        orden={orden}
        diagnostico={diagnostico}
        factura={factura}
        usuario={usuario}
        onActualizado={cargarTodo}
      />
    </Layout>
  );
}

function InfoTarjeta({ icono: Icono, etiqueta, valor }) {
  return (
    <div className="relative bg-taller-850 border border-taller-700 rounded-xl p-4">
      <div className="flex items-center gap-2 text-taller-400 text-xs font-mono uppercase tracking-wide mb-1.5">
        <Icono className="w-3.5 h-3.5" />
        {etiqueta}
      </div>
      <p className="text-taller-100 text-sm font-medium truncate">{valor}</p>
    </div>
  );
}

function Panel({ titulo, children }) {
  return (
    <div className="relative bg-taller-850 border border-taller-700 rounded-xl p-5">
      <span className="absolute top-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
      <span className="absolute top-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />
      <span className="absolute bottom-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
      <span className="absolute bottom-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />
      <h2 className="text-taller-100 font-semibold text-sm mb-3 uppercase tracking-wide">{titulo}</h2>
      {children}
    </div>
  );
}

function PanelEstado({ orden, usuario, onActualizado }) {
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorLocal, setErrorLocal] = useState('');
  const puedeCambiar = puede(usuario, 'ordenes', 'cambiarEstado');
  const opciones = transicionesDisponibles(orden.estado);

  async function manejarCambio() {
    if (!nuevoEstado) return;
    setGuardando(true);
    setErrorLocal('');
    try {
      await ordenService.cambiarEstadoOrden(orden.id, nuevoEstado);
      setNuevoEstado('');
      onActualizado();
    } catch (err) {
      setErrorLocal(err.response?.data?.mensaje || 'No se pudo cambiar el estado.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Panel titulo="Estado de la orden">
      <p className="text-taller-400 text-xs mb-3">
        Estado actual: <span className="text-taller-200 font-medium">{ETIQUETAS_ESTADO_ORDEN[orden.estado]}</span>
      </p>

      {!puedeCambiar && (
        <p className="text-taller-400 text-xs italic">No tienes permisos para cambiar el estado.</p>
      )}

      {puedeCambiar && opciones.length === 0 && (
        <p className="text-taller-400 text-xs italic">Este es un estado final, no admite mas cambios.</p>
      )}

      {puedeCambiar && opciones.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            value={nuevoEstado}
            onChange={(e) => setNuevoEstado(e.target.value)}
            className="flex-1 bg-taller-900 border border-taller-700 rounded-md px-2.5 py-2 text-taller-100 text-sm outline-none focus:border-ambar-400"
          >
            <option value="">Selecciona siguiente estado</option>
            {opciones.map((o) => (
              <option key={o} value={o}>
                {ETIQUETAS_ESTADO_ORDEN[o]}
              </option>
            ))}
          </select>
          <button
            onClick={manejarCambio}
            disabled={!nuevoEstado || guardando}
            className="bg-ambar-400 hover:bg-ambar-500 disabled:opacity-50 text-taller-950 font-semibold text-xs rounded-md px-3 py-2 flex items-center gap-1.5 transition-colors shrink-0"
          >
            {guardando && <LoaderCircle className="w-3.5 h-3.5 animate-spin" />}
            Aplicar
          </button>
        </div>
      )}
      {errorLocal && <p className="text-red-400 text-xs mt-2">{errorLocal}</p>}
    </Panel>
  );
}

function PanelMecanico({ orden, usuario, onActualizado }) {
  const [mecanicos, setMecanicos] = useState([]);
  const [mecanicoId, setMecanicoId] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errorLocal, setErrorLocal] = useState('');
  const puedeAsignar = puede(usuario, 'ordenes', 'asignarMecanico');

  // Antes esto era un campo de texto donde habia que pegar a mano el UUID del
  // mecanico, sacado de la base de datos: la nota decia que se obtenia "desde
  // el registro de usuarios", un registro que no existia. Ahora se listan
  // desde /api/usuarios?rol=MECANICO&activo=true.
  useEffect(() => {
    if (!puedeAsignar) return;
    usuarioService
      .listarMecanicos()
      .then(setMecanicos)
      .catch(() => setErrorLocal('No se pudo cargar la lista de mecanicos.'));
  }, [puedeAsignar]);

  async function manejarAsignar() {
    if (!mecanicoId) return;
    setGuardando(true);
    setErrorLocal('');
    try {
      await ordenService.asignarMecanico(orden.id, mecanicoId);
      setMecanicoId('');
      onActualizado();
    } catch (err) {
      setErrorLocal(err.response?.data?.mensaje || 'No se pudo asignar el mecanico.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Panel titulo="Mecanico asignado">
      <p className="text-taller-400 text-xs mb-3">
        Actual: <span className="text-taller-200 font-medium">{orden.mecanico?.nombre ?? 'Sin asignar'}</span>
      </p>

      {!puedeAsignar && (
        <p className="text-taller-400 text-xs italic">No tienes permisos para asignar mecanicos.</p>
      )}

      {puedeAsignar && (
        <>
          <div className="flex items-end gap-2">
            <div className="flex-1 min-w-0">
              <Select
                value={mecanicoId}
                onChange={(e) => setMecanicoId(e.target.value)}
                disabled={mecanicos.length === 0}
              >
                <option value="">
                  {mecanicos.length === 0 ? 'No hay mecanicos activos' : 'Selecciona un mecanico'}
                </option>
                {mecanicos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nombre}
                  </option>
                ))}
              </Select>
            </div>
            <button
              onClick={manejarAsignar}
              disabled={!mecanicoId || guardando}
              className="bg-ambar-400 hover:bg-ambar-500 disabled:opacity-50 text-taller-950 font-semibold text-xs rounded-md px-3 py-2.5 flex items-center gap-1.5 transition-colors shrink-0"
            >
              {guardando && <LoaderCircle className="w-3.5 h-3.5 animate-spin" />}
              Asignar
            </button>
          </div>
          {errorLocal && <p className="text-red-400 text-xs mt-2">{errorLocal}</p>}
        </>
      )}
    </Panel>
  );
}

function PanelDiagnostico({ orden, diagnostico, totalCotizacion, repuestos, usuario, onActualizado }) {
  const puedeGestionar = puede(usuario, 'diagnostico', 'gestionar');
  const [descripcion, setDescripcion] = useState('');
  const [manoObra, setManoObra] = useState('');
  const [creando, setCreando] = useState(false);
  const [errorLocal, setErrorLocal] = useState('');

  const [mostrarFormItem, setMostrarFormItem] = useState(false);
  const [itemRepuestoId, setItemRepuestoId] = useState('');
  const [itemDescripcion, setItemDescripcion] = useState('');
  const [itemCantidad, setItemCantidad] = useState('1');
  const [itemPrecio, setItemPrecio] = useState('');
  const [guardandoItem, setGuardandoItem] = useState(false);

  async function manejarCrearDiagnostico(e) {
    e.preventDefault();
    setCreando(true);
    setErrorLocal('');
    try {
      await diagnosticoService.crearDiagnostico({
        ordenId: orden.id,
        descripcion,
        manoObra: Number(manoObra),
      });
      onActualizado();
    } catch (err) {
      setErrorLocal(err.response?.data?.mensaje || 'No se pudo crear el diagnostico.');
    } finally {
      setCreando(false);
    }
  }

  async function manejarAgregarItem(e) {
    e.preventDefault();
    setGuardandoItem(true);
    setErrorLocal('');
    try {
      await diagnosticoService.agregarItem({
        diagnosticoId: diagnostico.id,
        repuestoId: itemRepuestoId || undefined,
        descripcion: itemDescripcion,
        cantidad: Number(itemCantidad),
        precioUnitario: Number(itemPrecio),
      });
      setItemRepuestoId('');
      setItemDescripcion('');
      setItemCantidad('1');
      setItemPrecio('');
      setMostrarFormItem(false);
      onActualizado();
    } catch (err) {
      setErrorLocal(err.response?.data?.mensaje || 'No se pudo agregar el item.');
    } finally {
      setGuardandoItem(false);
    }
  }

  async function manejarEliminarItem(itemId) {
    try {
      await diagnosticoService.eliminarItem(itemId);
      onActualizado();
    } catch {
      setErrorLocal('No se pudo eliminar el item.');
    }
  }

  function manejarSeleccionRepuesto(repuestoId) {
    setItemRepuestoId(repuestoId);
    const rep = repuestos.find((r) => r.id === repuestoId);
    if (rep) {
      setItemDescripcion(rep.nombre);
      setItemPrecio(String(rep.precio));
    }
  }

  return (
    <div className="relative bg-taller-850 border border-taller-700 rounded-xl p-6 mb-6">
      <span className="absolute top-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
      <span className="absolute top-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />
      <span className="absolute bottom-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
      <span className="absolute bottom-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />

      <h2 className="flex items-center gap-2 text-taller-100 font-semibold text-sm mb-4 uppercase tracking-wide">
        <ClipboardList className="w-4 h-4 text-ambar-400" />
        Diagnostico y cotizacion
      </h2>

      {errorLocal && <p className="text-red-400 text-xs mb-3">{errorLocal}</p>}

      {!diagnostico && orden.estado !== 'EN_DIAGNOSTICO' && (
        <p className="text-taller-400 text-sm">
          Aun no hay diagnostico. La orden debe estar en estado <strong>EN_DIAGNOSTICO</strong> para poder registrarlo.
        </p>
      )}

      {!diagnostico && orden.estado === 'EN_DIAGNOSTICO' && !puedeGestionar && (
        <p className="text-taller-400 text-sm">Esta orden aun no tiene un diagnostico registrado.</p>
      )}

      {!diagnostico && orden.estado === 'EN_DIAGNOSTICO' && puedeGestionar && (
        <form onSubmit={manejarCrearDiagnostico} className="max-w-lg space-y-4">
          <Textarea
            etiqueta="Descripcion del diagnostico"
            required
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Se detecto desgaste en pastillas de freno..."
          />
          <Input
            etiqueta="Mano de obra (COP)"
            type="number"
            required
            min={0}
            value={manoObra}
            onChange={(e) => setManoObra(e.target.value)}
            placeholder="30000"
          />
          <button
            type="submit"
            disabled={creando}
            className="bg-ambar-400 hover:bg-ambar-500 disabled:opacity-60 text-taller-950 font-semibold text-sm rounded-md px-4 py-2.5 flex items-center gap-2 transition-colors"
          >
            {creando && <LoaderCircle className="w-4 h-4 animate-spin" />}
            Guardar diagnostico
          </button>
        </form>
      )}

      {diagnostico && (
        <>
          <p className="text-taller-200 text-sm mb-4">{diagnostico.descripcion}</p>

          <div className="rounded-lg border border-taller-700 overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-taller-700 text-left bg-taller-900/40">
                  <th className="px-4 py-2.5 text-taller-400 font-medium text-xs uppercase tracking-wide">Item</th>
                  <th className="px-4 py-2.5 text-taller-400 font-medium text-xs uppercase tracking-wide">Cant.</th>
                  <th className="px-4 py-2.5 text-taller-400 font-medium text-xs uppercase tracking-wide">Precio unit.</th>
                  <th className="px-4 py-2.5 text-taller-400 font-medium text-xs uppercase tracking-wide">Subtotal</th>
                  {puedeGestionar && <th className="px-4 py-2.5" />}
                </tr>
              </thead>
              <tbody>
                {(diagnostico.itemsCotizacion || []).map((item) => (
                  <tr key={item.id} className="border-b border-taller-800 last:border-0">
                    <td className="px-4 py-2.5 text-taller-100">{item.descripcion}</td>
                    <td className="px-4 py-2.5 text-taller-200">{item.cantidad}</td>
                    <td className="px-4 py-2.5 text-taller-200 font-mono text-xs">{formatearMoneda(item.precioUnitario)}</td>
                    <td className="px-4 py-2.5 text-taller-200 font-mono text-xs">
                      {formatearMoneda(item.precioUnitario * item.cantidad)}
                    </td>
                    {puedeGestionar && (
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => manejarEliminarItem(item.id)}
                          className="text-taller-400 hover:text-red-400 transition-colors"
                          aria-label="Eliminar item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {(diagnostico.itemsCotizacion || []).length === 0 && (
                  <tr>
                    <td colSpan={puedeGestionar ? 5 : 4} className="px-4 py-4 text-taller-400 text-xs text-center">
                      Sin items de cotizacion todavia.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalCotizacion && (
            <div className="flex items-center justify-end gap-6 text-sm mb-4">
              <span className="text-taller-400">
                Mano de obra: <span className="text-taller-200 font-mono">{formatearMoneda(totalCotizacion.manoObra)}</span>
              </span>
              <span className="text-taller-100 font-semibold">
                Total: <span className="text-ambar-400 font-mono">{formatearMoneda(totalCotizacion.total)}</span>
              </span>
            </div>
          )}

          {puedeGestionar && !mostrarFormItem && (
            <button
              onClick={() => setMostrarFormItem(true)}
              className="flex items-center gap-1.5 text-ambar-400 hover:text-ambar-300 text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar item
            </button>
          )}

          {puedeGestionar && mostrarFormItem && (
            <form onSubmit={manejarAgregarItem} className="border-t border-taller-700 pt-4 mt-2 max-w-xl space-y-3">
              <Select
                etiqueta="Repuesto del inventario (opcional)"
                value={itemRepuestoId}
                onChange={(e) => manejarSeleccionRepuesto(e.target.value)}
              >
                <option value="">Item libre (sin repuesto asociado)</option>
                {repuestos.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombre} - stock {r.stock}
                  </option>
                ))}
              </Select>
              <Input
                etiqueta="Descripcion"
                required
                value={itemDescripcion}
                onChange={(e) => setItemDescripcion(e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  etiqueta="Cantidad"
                  type="number"
                  min={1}
                  required
                  value={itemCantidad}
                  onChange={(e) => setItemCantidad(e.target.value)}
                />
                <Input
                  etiqueta="Precio unitario"
                  type="number"
                  min={0}
                  required
                  value={itemPrecio}
                  onChange={(e) => setItemPrecio(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={guardandoItem}
                  className="bg-ambar-400 hover:bg-ambar-500 disabled:opacity-60 text-taller-950 font-semibold text-sm rounded-md px-4 py-2 flex items-center gap-2 transition-colors"
                >
                  {guardandoItem && <LoaderCircle className="w-4 h-4 animate-spin" />}
                  Agregar
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarFormItem(false)}
                  className="text-taller-400 hover:text-taller-200 text-sm transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}

function PanelFactura({ orden, diagnostico, factura, usuario, onActualizado }) {
  const puedeVerFacturas = puede(usuario, 'facturas', 'ver');
  const puedeCrear = puede(usuario, 'facturas', 'crear');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [creando, setCreando] = useState(false);
  const [errorLocal, setErrorLocal] = useState('');

  if (!puedeVerFacturas) return null;

  const puedeFacturar = puedeCrear && diagnostico && ['LISTA', 'ENTREGADA'].includes(orden.estado);

  async function manejarCrear() {
    setCreando(true);
    setErrorLocal('');
    try {
      await facturaService.crearFactura({ ordenId: orden.id, metodoPago });
      setModalAbierto(false);
      onActualizado();
    } catch (err) {
      setErrorLocal(err.response?.data?.mensaje || 'No se pudo generar la factura.');
    } finally {
      setCreando(false);
    }
  }

  return (
    <Panel titulo="Facturacion">
      {factura ? (
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-taller-100 font-mono text-sm">{factura.numero}</p>
            <p className="text-taller-400 text-xs">{factura.metodoPago}</p>
          </div>
          <p className="text-ambar-400 font-display text-xl font-semibold">{formatearMoneda(factura.total)}</p>
        </div>
      ) : puedeFacturar ? (
        <button
          onClick={() => setModalAbierto(true)}
          className="flex items-center gap-2 bg-ambar-400 hover:bg-ambar-500 text-taller-950 font-semibold text-sm rounded-md px-4 py-2.5 transition-colors"
        >
          <Receipt className="w-4 h-4" />
          Generar factura
        </button>
      ) : (
        <p className="text-taller-400 text-xs italic">
          {diagnostico
            ? 'La factura se puede generar cuando la orden este en estado LISTA o ENTREGADA.'
            : 'Se necesita un diagnostico con cotizacion antes de facturar.'}
        </p>
      )}

      <Modal abierto={modalAbierto} onCerrar={() => setModalAbierto(false)} titulo="Generar factura" ancho="max-w-sm">
        <div className="space-y-4">
          {errorLocal && <p className="text-red-400 text-xs">{errorLocal}</p>}
          <Select etiqueta="Metodo de pago" value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TARJETA">Tarjeta</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </Select>
          <button
            onClick={manejarCrear}
            disabled={creando}
            className="w-full bg-ambar-400 hover:bg-ambar-500 disabled:opacity-60 text-taller-950 font-semibold text-sm rounded-md py-2.5 flex items-center justify-center gap-2 transition-colors"
          >
            {creando && <LoaderCircle className="w-4 h-4 animate-spin" />}
            Confirmar
          </button>
        </div>
      </Modal>
    </Panel>
  );
}
