import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Bike } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import CargandoInline from '../components/CargandoInline';
import ErrorBanner from '../components/ErrorBanner';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import { puede } from '../utils/permisos';
import * as clienteService from '../services/cliente.service';

export default function Clientes() {
  const { usuario } = useAuth();
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    clienteService
      .listarClientes()
      .then(setClientes)
      .catch(() => setError('No se pudo cargar la lista de clientes.'))
      .finally(() => setCargando(false));
  }, []);

  const puedeCrear = puede(usuario, 'clientes', 'crear');

  return (
    <Layout>
      <PageHeader
        titulo="Clientes"
        descripcion="Gestion de clientes registrados en el taller."
        accion={
          puedeCrear && (
            <Link
              to="/clientes/nuevo"
              className="flex items-center gap-2 bg-ambar-400 hover:bg-ambar-500 text-taller-950 font-semibold text-sm rounded-md px-4 py-2.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo cliente
            </Link>
          )
        }
      />

      {cargando && <CargandoInline>Cargando clientes...</CargandoInline>}
      <ErrorBanner>{error}</ErrorBanner>

      {!cargando && !error && clientes.length === 0 && (
        <EmptyState
          icono={Users}
          titulo="Aun no hay clientes registrados"
          descripcion={
            puedeCrear
              ? 'Crea el primer cliente para empezar a operar el taller.'
              : 'Todavia no se ha registrado ningun cliente.'
          }
        />
      )}

      {!cargando && clientes.length > 0 && (
        <div className="relative bg-taller-850 border border-taller-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-taller-700 text-left">
                <th className="px-5 py-3 text-taller-400 font-medium text-xs uppercase tracking-wide">Nombre</th>
                <th className="px-5 py-3 text-taller-400 font-medium text-xs uppercase tracking-wide">Correo</th>
                <th className="px-5 py-3 text-taller-400 font-medium text-xs uppercase tracking-wide">Telefono</th>
                <th className="px-5 py-3 text-taller-400 font-medium text-xs uppercase tracking-wide">Motocicletas</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr
                  key={cliente.id}
                  className="border-b border-taller-800 last:border-0 hover:bg-taller-800/40 transition-colors"
                >
                  <td className="px-5 py-3.5 text-taller-100 font-medium">{cliente.usuario?.nombre}</td>
                  <td className="px-5 py-3.5 text-taller-200 font-mono text-xs">{cliente.usuario?.email}</td>
                  <td className="px-5 py-3.5 text-taller-200">{cliente.telefono}</td>
                  <td className="px-5 py-3.5">
                    <Badge variante="ambar">
                      <Bike className="w-3 h-3 mr-1 inline" />
                      {cliente.motocicletas?.length ?? 0}
                    </Badge>
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
