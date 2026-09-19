import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, LoaderCircle } from 'lucide-react';
import Layout from '../components/Layout';
import { Input } from '../components/Campo';
import ErrorBanner from '../components/ErrorBanner';
import * as clienteService from '../services/cliente.service';

export default function ClienteFormulario() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState('');
  const navigate = useNavigate();

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      // Una sola llamada. El servidor crea la cuenta y el perfil juntos, sin
      // contrasena utilizable, y le manda al cliente un codigo de seis digitos
      // para que elija la suya. Aqui nadie escribe ni ve una contrasena ajena.
      const respuesta = await clienteService.crearCliente({ nombre, email, telefono, direccion });

      setAviso(respuesta.mensaje || 'Cliente registrado.');
      setTimeout(() => navigate('/clientes'), 2200);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo crear el cliente.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Layout>
      <Link
        to="/clientes"
        className="inline-flex items-center gap-1.5 text-taller-400 hover:text-ambar-400 text-sm mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a clientes
      </Link>

      <h1 className="font-display text-2xl font-semibold text-taller-100 uppercase tracking-wide mb-1">
        Nuevo cliente
      </h1>
      <p className="text-taller-400 text-sm mb-7">
        Se le enviara un codigo a su correo para que active su cuenta y elija su propia contrasena.
      </p>

      <form
        onSubmit={manejarSubmit}
        className="relative bg-taller-850 border border-taller-700 rounded-xl p-7 max-w-2xl"
      >
        <span className="absolute top-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
        <span className="absolute top-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />
        <span className="absolute bottom-2.5 left-2.5 w-1 h-1 rounded-full bg-taller-700" />
        <span className="absolute bottom-2.5 right-2.5 w-1 h-1 rounded-full bg-taller-700" />

        <ErrorBanner>{error}</ErrorBanner>

        {aviso && (
          <div className="mb-5 rounded-md border border-ambar-400/50 bg-ambar-400/10 px-3 py-2.5">
            <p className="text-ambar-400 text-sm">{aviso}</p>
          </div>
        )}

        <p className="text-taller-200 text-xs font-semibold uppercase tracking-wide mb-3">Datos de acceso</p>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="col-span-2">
            <Input
              etiqueta="Nombre completo"
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Juan Perez"
            />
          </div>
          <div className="col-span-2">
            <Input
              etiqueta="Correo electronico"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cliente@correo.com"
            />
          </div>
          <div className="col-span-2">
            <div className="rounded-md border border-taller-700 bg-taller-900 px-3 py-2.5">
              <p className="text-taller-200 text-xs leading-relaxed">
                <span className="text-ambar-400 font-medium">No escribas ninguna contrasena.</span>{' '}
                Al guardar, al cliente le llega un codigo a su correo y el elige la suya. Nadie del
                taller la conoce.
              </p>
            </div>
          </div>
        </div>

        <div className="h-px bg-taller-700 mb-5" />

        <p className="text-taller-200 text-xs font-semibold uppercase tracking-wide mb-3">Datos de contacto</p>
        <div className="grid grid-cols-2 gap-4 mb-7">
          <Input
            etiqueta="Telefono"
            type="tel"
            required
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="3001234567"
          />
          <Input
            etiqueta="Direccion"
            type="text"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
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
              Creando cliente...
            </>
          ) : (
            'Crear cliente'
          )}
        </button>
      </form>
    </Layout>
  );
}
