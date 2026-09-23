import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { Input, Select } from '../components/Campo';
import ErrorBanner from '../components/ErrorBanner';
import CargandoInline from '../components/CargandoInline';
import * as motocicletaService from '../services/motocicleta.service';
import * as clienteService from '../services/cliente.service';

export default function MotocicletaFormulario() {
  const [searchParams] = useSearchParams();
  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState(searchParams.get('clienteId') || '');
  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [anio, setAnio] = useState('');
  const [color, setColor] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [cargandoClientes, setCargandoClientes] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    clienteService
      .listarClientes()
      .then(setClientes)
      .catch(() => setError('No se pudo cargar la lista de clientes.'))
      .finally(() => setCargandoClientes(false));
  }, []);

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await motocicletaService.crearMotocicleta({
        clienteId,
        placa,
        marca,
        modelo,
        anio: Number(anio),
        color,
      });
      navigate('/motocicletas');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo crear la motocicleta.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Layout>
      <Link
        to="/motocicletas"
        className="inline-flex items-center gap-1.5 text-taller-400 hover:text-ambar-400 text-sm mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a motocicletas
      </Link>

      <h1 className="font-display text-2xl font-semibold text-taller-100 uppercase tracking-wide mb-1">
        Nueva motocicleta
      </h1>
      <p className="text-taller-400 text-sm mb-7">Registra una motocicleta asociada a un cliente.</p>

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
            <Select
              etiqueta="Cliente"
              required
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
            >
              <option value="">Selecciona un cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.usuario?.nombre} - {c.usuario?.email}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {/* El marcador decia ABC123, que es formato de CARRO. Esta
                aplicacion es de motocicletas: tres letras, dos numeros y una
                letra final opcional. El patron lo hace cumplir el propio
                navegador; el servidor lo vuelve a comprobar de todas formas. */}
            <div>
              <Input
                etiqueta="Placa"
                type="text"
                required
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase().replace(/[\s-]/g, ''))}
                placeholder="ABC12D"
                maxLength={6}
                pattern="[A-Za-z]{3}[0-9]{2}[A-Za-z]?"
                title="Tres letras, dos numeros y una letra final opcional. Ejemplos: ABC12 o ABC12D"
                className="uppercase"
              />
              <p className="text-taller-400 text-[11px] mt-1">
                Formato de motocicleta: 3 letras + 2 numeros + letra opcional
              </p>
            </div>
            <Input
              etiqueta="Anio"
              type="number"
              required
              min={1980}
              max={2027}
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              placeholder="2022"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
            <Input
              etiqueta="Marca"
              type="text"
              required
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              placeholder="Yamaha"
            />
            <Input
              etiqueta="Modelo"
              type="text"
              required
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              placeholder="FZ 2.0"
            />
          </div>

          <div className="mb-7">
            <Input
              etiqueta="Color"
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Opcional"
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
                Guardando...
              </>
            ) : (
              'Registrar motocicleta'
            )}
          </button>
        </form>
      )}
    </Layout>
  );
}
