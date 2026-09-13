import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { Select, Textarea } from '../components/Campo';
import ErrorBanner from '../components/ErrorBanner';
import CargandoInline from '../components/CargandoInline';
import * as ordenService from '../services/orden.service';
import * as clienteService from '../services/cliente.service';
import * as motocicletaService from '../services/motocicleta.service';

export default function OrdenFormulario() {
  const [clientes, setClientes] = useState([]);
  const [motos, setMotos] = useState([]);
  const [clienteId, setClienteId] = useState('');
  const [motocicletaId, setMotocicletaId] = useState('');
  const [descripcionProblema, setDescripcionProblema] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [cargandoClientes, setCargandoClientes] = useState(true);
  const [cargandoMotos, setCargandoMotos] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    clienteService
      .listarClientes()
      .then(setClientes)
      .catch(() => setError('No se pudo cargar la lista de clientes.'))
      .finally(() => setCargandoClientes(false));
  }, []);

  useEffect(() => {
    if (!clienteId) {
      setMotos([]);
      setMotocicletaId('');
      return;
    }
    setCargandoMotos(true);
    motocicletaService
      .listarPorCliente(clienteId)
      .then(setMotos)
      .catch(() => setError('No se pudieron cargar las motocicletas del cliente.'))
      .finally(() => setCargandoMotos(false));
  }, [clienteId]);

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      const orden = await ordenService.crearOrden({ clienteId, motocicletaId, descripcionProblema });
      navigate(`/ordenes/${orden.id}`);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo crear la orden de trabajo.');
    } finally {
      setGuardando(false);
    }
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

      <h1 className="font-display text-2xl font-semibold text-taller-100 uppercase tracking-wide mb-1">
        Nueva orden de trabajo
      </h1>
      <p className="text-taller-400 text-sm mb-7">
        Se generara un codigo unico de seguimiento para el cliente.
      </p>

      {cargandoClientes ? (
        <CargandoInline>Cargando clientes...</CargandoInline>
      ) : clientes.length === 0 ? (
        <div className="rounded-md border border-ambar-500/40 bg-taller-850 px-4 py-3 text-taller-200 text-sm max-w-2xl">
          No hay clientes registrados todavia.{' '}
          <Link to="/clientes/nuevo" className="text-ambar-400 hover:underline">
            Crea uno primero
          </Link>
          .
        </div>
      ) : (
        <form
          onSubmit={manejarSubmit}
          className="relative bg-taller-850 border border-taller-700 rounded-xl p-7 max-w-2xl"
        >
          <span className="absolute top-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
          <span className="absolute top-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />
          <span className="absolute bottom-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
          <span className="absolute bottom-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />

          <ErrorBanner>{error}</ErrorBanner>

          <div className="mb-5">
            <Select etiqueta="Cliente" required value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
              <option value="">Selecciona un cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.usuario?.nombre} - {c.usuario?.email}
                </option>
              ))}
            </Select>
          </div>

          <div className="mb-5">
            {cargandoMotos ? (
              <CargandoInline>Cargando motocicletas...</CargandoInline>
            ) : (
              <Select
                etiqueta="Motocicleta"
                required
                disabled={!clienteId}
                value={motocicletaId}
                onChange={(e) => setMotocicletaId(e.target.value)}
              >
                <option value="">
                  {clienteId ? 'Selecciona una motocicleta' : 'Primero selecciona un cliente'}
                </option>
                {motos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.placa} - {m.marca} {m.modelo}
                  </option>
                ))}
              </Select>
            )}
          </div>

          <div className="mb-7">
            <Textarea
              etiqueta="Descripcion del problema"
              required
              rows={4}
              value={descripcionProblema}
              onChange={(e) => setDescripcionProblema(e.target.value)}
              placeholder="La moto hace un ruido extrano al frenar..."
            />
          </div>

          <button
            type="submit"
            disabled={guardando}
            className="w-full bg-ambar-400 hover:bg-ambar-500 disabled:opacity-60 disabled:cursor-not-allowed text-taller-950 font-semibold text-sm rounded-md py-2.5 flex items-center justify-center gap-2 transition-colors"
          >
            {guardando ? (
              <>
                <LoaderCircle className="w-4 h-4 animate-spin" />
                Creando orden...
              </>
            ) : (
              'Crear orden de trabajo'
            )}
          </button>
        </form>
      )}
    </Layout>
  );
}
