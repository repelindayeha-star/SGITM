import { useEffect, useState } from 'react';
import { Bike, ClipboardList, CalendarClock, Plus, LoaderCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import CargandoInline from '../components/CargandoInline';
import ErrorBanner from '../components/ErrorBanner';
import EmptyState from '../components/EmptyState';
import EstadoBadge from '../components/EstadoBadge';
import LineaTiempoOrden from '../components/LineaTiempoOrden';
import GaleriaEvidencias from '../components/GaleriaEvidencias';
import Modal from '../components/Modal';
import { Select, Input, Textarea } from '../components/Campo';
import { formatearFechaHora, formatearMoneda, aInputDatetimeLocal } from '../utils/formato';
import * as clienteService from '../services/cliente.service';
import * as motocicletaService from '../services/motocicleta.service';
import * as ordenService from '../services/orden.service';
import * as citaService from '../services/cita.service';

export default function PortalCliente() {
  const [cliente, setCliente] = useState(null);
  const [motos, setMotos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalCita, setModalCita] = useState(false);

  async function cargarTodo() {
    setError('');
    try {
      const miPerfil = await clienteService.obtenerMiPerfil();
      setCliente(miPerfil);
      const [misMotos, misOrdenes, misCitas] = await Promise.all([
        motocicletaService.listarPorCliente(miPerfil.id),
        ordenService.listarPorCliente(miPerfil.id),
        citaService.listarPorCliente(miPerfil.id),
      ]);
      setMotos(misMotos);
      setOrdenes(misOrdenes);
      setCitas(misCitas);
    } catch {
      setError('No se pudo cargar tu informacion. Contacta al taller si el problema persiste.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargarTodo();
  }, []);

  return (
    <div className="min-h-screen bg-taller-900">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-7">
          <h1 className="font-display text-2xl font-semibold text-taller-100 uppercase tracking-wide">
            Mi taller
          </h1>
          <p className="text-taller-400 text-sm mt-1">Tus motocicletas, ordenes y citas en un solo lugar.</p>
        </div>

        {cargando && <CargandoInline>Cargando tu informacion...</CargandoInline>}
        <ErrorBanner>{error}</ErrorBanner>

        {cliente && (
          <>
            <Seccion titulo="Mis motocicletas" icono={Bike}>
              {motos.length === 0 ? (
                <EmptyState
                  icono={Bike}
                  titulo="Aun no tienes motocicletas registradas"
                  descripcion="Acercate al taller para registrar tu motocicleta."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {motos.map((m) => (
                    <div key={m.id} className="relative bg-taller-850 border border-taller-700 rounded-xl p-5">
                      <span className="absolute top-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
                      <span className="absolute top-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />
                      <span className="absolute bottom-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
                      <span className="absolute bottom-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />
                      <div className="w-9 h-9 rounded-lg bg-ambar-400/15 flex items-center justify-center mb-3">
                        <Bike className="w-4.5 h-4.5 text-ambar-400" strokeWidth={1.75} />
                      </div>
                      <p className="text-taller-100 font-semibold font-display text-lg uppercase">
                        {m.marca} {m.modelo}
                      </p>
                      <p className="text-taller-400 text-xs font-mono">
                        {m.placa} - {m.anio} {m.color ? `- ${m.color}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Seccion>

            <Seccion titulo="Mis ordenes de trabajo" icono={ClipboardList}>
              {ordenes.length === 0 ? (
                <EmptyState icono={ClipboardList} titulo="No tienes ordenes de trabajo registradas" />
              ) : (
                <div className="space-y-3">
                  {ordenes.map((orden) => {
                    const totalItems = (orden.diagnostico?.itemsCotizacion || []).reduce(
                      (acc, item) => acc + Number(item.precioUnitario) * Number(item.cantidad),
                      0
                    );
                    const totalCotizacion = orden.diagnostico ? Number(orden.diagnostico.manoObra) + totalItems : null;

                    return (
                      <div key={orden.id} className="relative bg-taller-850 border border-taller-700 rounded-xl p-5">
                        <span className="absolute top-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
                        <span className="absolute top-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />
                        <span className="absolute bottom-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
                        <span className="absolute bottom-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />

                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                          <span className="text-taller-100 font-mono text-sm">{orden.codigo}</span>
                          <EstadoBadge estado={orden.estado} />
                        </div>
                        <p className="text-taller-200 text-sm mb-2">{orden.descripcionProblema}</p>
                        <p className="text-taller-400 text-xs font-mono mb-4">{orden.motocicleta?.placa}</p>

                        <LineaTiempoOrden
                          estado={orden.estado}
                          historial={orden.historialEstados || []}
                        />

                        {orden.evidencias?.length > 0 && (
                          <div className="border-t border-taller-700 pt-3 mb-3">
                            <p className="text-taller-200 text-xs font-medium uppercase tracking-wide mb-2.5">
                              Fotos del trabajo
                            </p>
                            <GaleriaEvidencias ordenId={orden.id} evidencias={orden.evidencias} />
                          </div>
                        )}

                        {orden.diagnostico && (
                          <div className="border-t border-taller-700 pt-3 text-xs">
                            <p className="text-taller-400 mb-1">{orden.diagnostico.descripcion}</p>
                            {totalCotizacion !== null && (
                              <p className="text-ambar-400 font-mono">
                                Cotizacion estimada: {formatearMoneda(totalCotizacion)}
                              </p>
                            )}
                          </div>
                        )}

                        {orden.factura && (
                          <div className="border-t border-taller-700 pt-3 mt-3 flex items-center justify-between text-xs">
                            <span className="text-taller-400 font-mono">{orden.factura.numero}</span>
                            <span className="text-taller-100 font-semibold font-mono">
                              {formatearMoneda(orden.factura.total)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Seccion>

            <Seccion
              titulo="Mis citas"
              icono={CalendarClock}
              accion={
                motos.length > 0 && (
                  <button
                    onClick={() => setModalCita(true)}
                    className="flex items-center gap-1.5 bg-ambar-400 hover:bg-ambar-500 text-taller-950 font-semibold text-xs rounded-md px-3 py-2 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agendar cita
                  </button>
                )
              }
            >
              {citas.length === 0 ? (
                <EmptyState icono={CalendarClock} titulo="No tienes citas agendadas" />
              ) : (
                <div className="space-y-2">
                  {citas.map((cita) => (
                    <div
                      key={cita.id}
                      className="flex items-center justify-between bg-taller-850 border border-taller-700 rounded-lg px-4 py-3"
                    >
                      <div>
                        <p className="text-taller-100 text-sm font-mono">{formatearFechaHora(cita.fechaHora)}</p>
                        <p className="text-taller-400 text-xs">{cita.motivo}</p>
                      </div>
                      <EstadoBadge estado={cita.estado} />
                    </div>
                  ))}
                </div>
              )}
            </Seccion>
          </>
        )}
      </main>

      <ModalNuevaCita
        abierto={modalCita}
        onCerrar={() => setModalCita(false)}
        cliente={cliente}
        motos={motos}
        onCreada={() => {
          setModalCita(false);
          cargarTodo();
        }}
      />
    </div>
  );
}

function Seccion({ titulo, icono: Icono, accion, children }) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="flex items-center gap-2 text-taller-100 font-semibold text-sm uppercase tracking-wide">
          <Icono className="w-4 h-4 text-ambar-400" />
          {titulo}
        </h2>
        {accion}
      </div>
      {children}
    </section>
  );
}

function ModalNuevaCita({ abierto, onCerrar, cliente, motos, onCreada }) {
  const [motocicletaId, setMotocicletaId] = useState('');
  const [fechaHora, setFechaHora] = useState('');
  const [motivo, setMotivo] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  async function manejarSubmit(e) {
    e.preventDefault();
    setGuardando(true);
    setError('');
    try {
      await citaService.crearCita({
        clienteId: cliente.id,
        motocicletaId,
        fechaHora: new Date(fechaHora).toISOString(),
        motivo,
      });
      setMotocicletaId('');
      setFechaHora('');
      setMotivo('');
      onCreada();
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo agendar la cita.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal abierto={abierto} onCerrar={onCerrar} titulo="Agendar cita">
      <form onSubmit={manejarSubmit} className="space-y-4">
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <Select etiqueta="Motocicleta" required value={motocicletaId} onChange={(e) => setMotocicletaId(e.target.value)}>
          <option value="">Selecciona tu motocicleta</option>
          {motos.map((m) => (
            <option key={m.id} value={m.id}>
              {m.placa} - {m.marca} {m.modelo}
            </option>
          ))}
        </Select>
        <Input
          etiqueta="Fecha y hora"
          type="datetime-local"
          required
          min={aInputDatetimeLocal()}
          value={fechaHora}
          onChange={(e) => setFechaHora(e.target.value)}
        />
        <Textarea
          etiqueta="Motivo"
          required
          rows={3}
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          placeholder="Revision general, cambio de aceite..."
        />
        <button
          type="submit"
          disabled={guardando}
          className="w-full bg-ambar-400 hover:bg-ambar-500 disabled:opacity-60 text-taller-950 font-semibold text-sm rounded-md py-2.5 flex items-center justify-center gap-2 transition-colors"
        >
          {guardando && <LoaderCircle className="w-4 h-4 animate-spin" />}
          Agendar cita
        </button>
      </form>
    </Modal>
  );
}
