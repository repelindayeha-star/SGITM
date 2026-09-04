import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Bike, User } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import CargandoInline from '../components/CargandoInline';
import ErrorBanner from '../components/ErrorBanner';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import { puede } from '../utils/permisos';
import * as motocicletaService from '../services/motocicleta.service';

export default function Motocicletas() {
  const { usuario } = useAuth();
  const [motos, setMotos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    motocicletaService
      .listarMotocicletas()
      .then(setMotos)
      .catch(() => setError('No se pudo cargar la lista de motocicletas.'))
      .finally(() => setCargando(false));
  }, []);

  const puedeCrear = puede(usuario, 'motocicletas', 'crear');

  return (
    <Layout>
      <PageHeader
        titulo="Motocicletas"
        descripcion="Motocicletas registradas por los clientes."
        accion={
          puedeCrear && (
            <Link
              to="/motocicletas/nueva"
              className="flex items-center gap-2 bg-ambar-400 hover:bg-ambar-500 text-taller-950 font-semibold text-sm rounded-md px-4 py-2.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nueva motocicleta
            </Link>
          )
        }
      />

      {cargando && <CargandoInline>Cargando motocicletas...</CargandoInline>}
      <ErrorBanner>{error}</ErrorBanner>

      {!cargando && !error && motos.length === 0 && (
        <EmptyState
          icono={Bike}
          titulo="Aun no hay motocicletas registradas"
          descripcion={
            puedeCrear ? 'Registra la primera motocicleta de un cliente.' : 'Todavia no hay motocicletas registradas.'
          }
        />
      )}

      {!cargando && motos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {motos.map((moto) => (
            <div key={moto.id} className="relative bg-taller-850 border border-taller-700 rounded-xl p-5">
              <span className="absolute top-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
              <span className="absolute top-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />
              <span className="absolute bottom-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
              <span className="absolute bottom-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />

              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-ambar-400/15 flex items-center justify-center">
                  <Bike className="w-4.5 h-4.5 text-ambar-400" strokeWidth={1.75} />
                </div>
                <Badge variante="neutro">{moto.placa}</Badge>
              </div>

              <p className="text-taller-100 font-semibold font-display text-lg uppercase">
                {moto.marca} {moto.modelo}
              </p>
              <p className="text-taller-600 text-xs font-mono mb-3">
                {moto.anio} {moto.color ? `- ${moto.color}` : ''}
              </p>

              <div className="flex items-center gap-1.5 text-taller-200 text-xs pt-3 border-t border-taller-700">
                <User className="w-3.5 h-3.5 text-taller-600" />
                {moto.cliente?.usuario?.nombre ?? 'Sin cliente'}
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
