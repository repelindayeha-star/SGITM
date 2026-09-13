import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LoaderCircle, MailCheck } from 'lucide-react';
import PantallaAuth from '../components/PantallaAuth';
import * as authService from '../services/auth.service';

export default function RecuperarPassword() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await authService.solicitarRecuperacion(email);
      setEnviado(true);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo procesar la solicitud. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  const volver = (
    <Link
      to="/login"
      className="inline-flex items-center gap-1.5 text-taller-400 hover:text-ambar-400 text-sm transition-colors"
    >
      <ArrowLeft className="w-4 h-4" />
      Volver al inicio de sesion
    </Link>
  );

  // Pantalla de confirmacion.
  //
  // Dice "si existe una cuenta", nunca "te enviamos un correo": el servidor
  // responde igual exista o no la cuenta, y la pantalla no puede contradecirlo
  // sin delatar quien esta registrado y quien no.
  if (enviado) {
    return (
      <PantallaAuth titulo="Revisa tu correo" pie={volver}>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-taller-800 border border-taller-700 flex items-center justify-center mb-4">
            <MailCheck className="w-6 h-6 text-ambar-400" strokeWidth={1.75} />
          </div>
          <p className="text-taller-200 text-sm leading-relaxed">
            Si <span className="text-taller-100 font-medium">{email}</span> corresponde a una cuenta
            activa, te enviamos un enlace para crear una contrasena nueva.
          </p>
          <p className="text-taller-400 text-xs mt-4 leading-relaxed">
            El enlace sirve una sola vez y caduca en 30 minutos. Si no lo ves, revisa la carpeta de
            correo no deseado.
          </p>
          <button
            type="button"
            onClick={() => setEnviado(false)}
            className="mt-5 text-ambar-400 hover:text-ambar-300 text-sm transition-colors"
          >
            Usar otro correo
          </button>
        </div>
      </PantallaAuth>
    );
  }

  return (
    <PantallaAuth
      titulo="Recuperar la contrasena"
      descripcion="Escribe el correo de tu cuenta y te enviamos un enlace para crear una contrasena nueva."
      pie={volver}
    >
      <form onSubmit={manejarSubmit}>
        {error && (
          <div className="mb-5 rounded-md border border-red-800/60 bg-red-950/40 px-3 py-2.5">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="email" className="block text-taller-200 text-xs font-medium mb-1.5 uppercase tracking-wide">
            Correo electronico
          </label>
          <input
            id="email"
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@sigtm.com"
            className="w-full bg-taller-900 border border-taller-700 rounded-md px-3 py-2.5 text-taller-100 placeholder-taller-400 text-sm outline-none focus:border-ambar-400 focus:ring-1 focus:ring-ambar-400 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-ambar-400 hover:bg-ambar-500 disabled:opacity-60 disabled:cursor-not-allowed text-taller-950 font-semibold text-sm rounded-md py-2.5 flex items-center justify-center gap-2 transition-colors"
        >
          {cargando ? (
            <>
              <LoaderCircle className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviarme el enlace'
          )}
        </button>
      </form>
    </PantallaAuth>
  );
}
