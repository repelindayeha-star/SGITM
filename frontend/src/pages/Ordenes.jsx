import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, ClipboardList, Wrench } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import CargandoInline from '../components/CargandoInline';
import ErrorBanner from '../components/ErrorBanner';
import EstadoBadge from '../components/EstadoBadge';
import { useAuth } from '../context/AuthContext';
import { puede } from '../utils/permisos';
import * as ordenService from '../services/orden.service';

export default function Ordenes() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    ordenService
      .listarOrdenes()
      .then(setOrdenes)
      .catch(() => setError('No se pudo cargar la lista de ordenes de trabajo.'))
      .finally(() => setCargando(false));
  }, []);

  const puedeCrear = puede(usuario, 'ordenes', 'crear');

  return (
    <Layout>
      <PageHeader
        titulo="Ordenes de trabajo"
        descripcion="Reparaciones en curso y su estado actual."
        accion={
          puedeCrear && (
            <Link
              to="/ordenes/nueva"
              className="flex items-center gap-2 bg-ambar-400 hover:bg-ambar-500 text-taller-950 font-semibold text-sm rounded-md px-4 py-2.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva orden
            </Link>
          )
        }
      />

      {cargando && <CargandoInline>Cargando ordenes...</CargandoInline>}
      <ErrorBanner>{error}</ErrorBanner>

      {!cargando && !error && ordenes.length === 0 && (
        <EmptyState icono={ClipboardList} titulo="Aun no hay ordenes de trabajo" descripcion="Crea la primera orden para iniciar una reparacion." />
      )}

      {!cargando && ordenes.length > 0 && (
        <div className="relative bg-taller-850 border border-taller-700 rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-taller-700 text-left">
                <th className="px-3 sm:px-5 py-3 text-taller-400 font-medium text-xs uppercase tracking-wide">Codigo</th>
                <th className="px-3 sm:px-5 py-3 text-taller-400 font-medium text-xs uppercase tracking-wide">Cliente</th>
                <th className="px-3 sm:px-5 py-3 text-taller-400 font-medium text-xs uppercase tracking-wide">Motocicleta</th>
                <th className="px-3 sm:px-5 py-3 text-taller-400 font-medium text-xs uppercase tracking-wide">Mecanico</th>
                <th className="px-3 sm:px-5 py-3 text-taller-400 font-medium text-xs uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((orden) => (
                <tr
                  key={orden.id}
                  onClick={() => navigate(`/ordenes/${orden.id}`)}
                  className="border-b border-taller-800 last:border-0 hover:bg-taller-800/40 transition-colors cursor-pointer"
                >
                  <td className="px-3 sm:px-5 py-3.5">
                    <Link
                      to={`/ordenes/${orden.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-taller-100 font-mono text-xs hover:text-ambar-400 transition-colors"
                    >
                      {orden.codigo}
                    </Link>
                  </td>
                  <td className="px-3 sm:px-5 py-3.5 text-taller-200">{orden.cliente?.usuario?.nombre ?? '-'}</td>
                  <td className="px-3 sm:px-5 py-3.5 text-taller-200 font-mono text-xs">{orden.motocicleta?.placa ?? '-'}</td>
                  <td className="px-3 sm:px-5 py-3.5 text-taller-200 text-xs">
                    {orden.mecanico ? (
                      <span className="flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-taller-400" />
                        {orden.mecanico.nombre}
                      </span>
                    ) : (
                      <span className="text-taller-400">Sin asignar</span>
                    )}
                  </td>
                  <td className="px-3 sm:px-5 py-3.5">
                    <EstadoBadge estado={orden.estado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Layout>
  );
}
