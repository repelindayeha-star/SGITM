import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CalendarClock, User, Bike } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import CargandoInline from '../components/CargandoInline';
import ErrorBanner from '../components/ErrorBanner';
import EstadoBadge from '../components/EstadoBadge';
import { useAuth } from '../context/AuthContext';
import { puede } from '../utils/permisos';
import { formatearFechaHora } from '../utils/formato';
import * as citaService from '../services/cita.service';

const ESTADOS_CITA = ['PROGRAMADA', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'];

export default function Citas() {
  const { usuario } = useAuth();
  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [actualizandoId, setActualizandoId] = useState(null);

  function cargarCitas() {
    setCargando(true);
    citaService
      .listarCitas()
      .then(setCitas)
      .catch(() => setError('No se pudo cargar la lista de citas.'))
      .finally(() => setCargando(false));
  }

  useEffect(() => {
    cargarCitas();
  }, []);

  const puedeCrear = puede(usuario, 'citas', 'crear');
  const puedeCambiarEstado = puede(usuario, 'citas', 'cambiarEstado');

  async function manejarCambioEstado(id, estado) {
    setActualizandoId(id);
    try {
      const citaActualizada = await citaService.cambiarEstadoCita(id, estado);
      setCitas((prev) => prev.map((c) => (c.id === id ? { ...c, estado: citaActualizada.estado } : c)));
    } catch {
      setError('No se pudo actualizar el estado de la cita.');
    } finally {
      setActualizandoId(null);
    }
  }

  return (
    <Layout>
      <PageHeader
        titulo="Citas"
        descripcion="Agenda de citas programadas en el taller."
        accion={
          puedeCrear && (
            <Link
              to="/citas/nueva"
              className="flex items-center gap-2 bg-ambar-400 hover:bg-ambar-500 text-taller-950 font-semibold text-sm rounded-md px-4 py-2.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva cita
            </Link>
          )
        }
      />

      {cargando && <CargandoInline>Cargando citas...</CargandoInline>}
      <ErrorBanner>{error}</ErrorBanner>

      {!cargando && !error && citas.length === 0 && (
        <EmptyState icono={CalendarClock} titulo="Aun no hay citas agendadas" descripcion="Programa la primera cita del taller." />
      )}

      {!cargando && citas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {citas.map((cita) => (
            <div key={cita.id} className="relative bg-taller-850 border border-taller-700 rounded-xl p-5">
              <span className="absolute top-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
              <span className="absolute top-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />
              <span className="absolute bottom-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
              <span className="absolute bottom-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 text-taller-100 font-mono text-sm">
                  <CalendarClock className="w-4 h-4 text-ambar-400" />
                  {formatearFechaHora(cita.fechaHora)}
                </div>
                <EstadoBadge estado={cita.estado} />
              </div>

              <p className="text-taller-100 text-sm mb-3">{cita.motivo}</p>

              <div className="flex items-center gap-4 text-xs text-taller-600 border-t border-taller-700 pt-3 mb-3">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {cita.cliente?.usuario?.nombre ?? '-'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Bike className="w-3.5 h-3.5" />
                  {cita.motocicleta?.placa ?? '-'}
                </span>
              </div>

              {puedeCambiarEstado && (
                <select
                  value={cita.estado}
                  disabled={actualizandoId === cita.id}
                  onChange={(e) => manejarCambioEstado(cita.id, e.target.value)}
                  className="w-full bg-taller-900 border border-taller-700 rounded-md px-2.5 py-1.5 text-taller-200 text-xs outline-none focus:border-ambar-400 disabled:opacity-50"
                >
                  {ESTADOS_CITA.map((estado) => (
                    <option key={estado} value={estado}>
                      {estado}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
