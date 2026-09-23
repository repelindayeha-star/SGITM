import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, LoaderCircle, CircleCheck, TriangleAlert } from 'lucide-react';
import PantallaAuth from '../components/PantallaAuth';
import * as authService from '../services/auth.service';

// Reglas visibles desde el principio. Si la persona solo se entera de que
// falta un numero cuando ya envio el formulario, escribe a ciegas.
const REGLAS = [
  { texto: 'Al menos 8 caracteres', cumple: (v) => v.length >= 8 },
  { texto: 'Al menos una letra', cumple: (v) => /[A-Za-z]/.test(v) },
  { texto: 'Al menos un numero', cumple: (v) => /\d/.test(v) },
];

export default function RestablecerPassword() {
  const [parametros] = useSearchParams();
  const token = parametros.get('token') || '';
  const navigate = useNavigate();

  const [estadoEnlace, setEstadoEnlace] = useState('comprobando'); // comprobando | valido | invalido
  const [motivo, setMotivo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [error, setError] = useState('');
  const [listo, setListo] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Se comprueba el enlace ANTES de mostrar el formulario. Escribir una
  // contrasena nueva para descubrir despues que el enlace habia caducado es
  // justo el momento en que la gente abandona.
  useEffect(() => {
    let vigente = true;

    if (!token) {
      setEstadoEnlace('invalido');
      setMotivo('La direccion no trae el codigo del enlace.');
      return undefined;
    }

    authService
      .comprobarTokenRecuperacion(token)
      .then(() => vigente && setEstadoEnlace('valido'))
      .catch((err) => {
        if (!vigente) return;
        setEstadoEnlace('invalido');
        setMotivo(err.response?.data?.mensaje || 'El enlace no es valido.');
      });

    return () => {
      vigente = false;
    };
  }, [token]);

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmacion) {
      setError('Las dos contrasenas no coinciden.');
      return;
    }
    if (!REGLAS.every((r) => r.cumple(password))) {
      setError('La contrasena no cumple los requisitos.');
      return;
    }

    setGuardando(true);
    try {
      await authService.restablecerPassword({ token, password, confirmacion });
      setListo(true);
      setTimeout(() => navigate('/login'), 3500);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo cambiar la contrasena.');
    } finally {
      setGuardando(false);
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

  if (estadoEnlace === 'comprobando') {
    return (
      <PantallaAuth titulo="Comprobando el enlace" pie={volver}>
        <div className="flex items-center gap-3 text-taller-200 text-sm">
          <LoaderCircle className="w-5 h-5 animate-spin text-ambar-400" />
          Un momento...
        </div>
      </PantallaAuth>
    );
  }

  if (estadoEnlace === 'invalido') {
    return (
      <PantallaAuth titulo="Este enlace ya no sirve" pie={volver}>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-taller-800 border border-taller-700 flex items-center justify-center mb-4">
            <TriangleAlert className="w-6 h-6 text-ambar-400" strokeWidth={1.75} />
          </div>
          <p className="text-taller-200 text-sm leading-relaxed">{motivo}</p>
          <p className="text-taller-400 text-xs mt-3 leading-relaxed">
            Los enlaces sirven una sola vez y caducan a los 30 minutos.
          </p>
          <Link
            to="/recuperar-password"
            className="mt-6 w-full bg-ambar-400 hover:bg-ambar-500 text-taller-950 font-semibold text-sm rounded-md py-2.5 transition-colors"
          >
            Pedir un enlace nuevo
          </Link>
        </div>
      </PantallaAuth>
    );
  }

  if (listo) {
    return (
      <PantallaAuth titulo="Contrasena actualizada" pie={volver}>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-taller-800 border border-taller-700 flex items-center justify-center mb-4">
            <CircleCheck className="w-6 h-6 text-ambar-400" strokeWidth={1.75} />
          </div>
          <p className="text-taller-200 text-sm leading-relaxed">
            Ya puedes entrar con tu contrasena nueva.
          </p>
          <p className="text-taller-400 text-xs mt-3 leading-relaxed">
            Por seguridad se cerraron las sesiones que estuvieran abiertas en otros dispositivos.
          </p>
          <Link
            to="/login"
            className="mt-6 w-full bg-ambar-400 hover:bg-ambar-500 text-taller-950 font-semibold text-sm rounded-md py-2.5 transition-colors"
          >
            Ir al inicio de sesion
          </Link>
        </div>
      </PantallaAuth>
    );
  }

  const campo =
    'w-full bg-taller-900 border border-taller-700 rounded-md px-3 py-2.5 pr-10 text-taller-100 placeholder-taller-400 text-sm outline-none focus:border-ambar-400 focus:ring-1 focus:ring-ambar-400 transition-colors';

  return (
    <PantallaAuth
      titulo="Crea una contrasena nueva"
      descripcion="Escribela dos veces para confirmar que no hay ningun error de tecleo."
      pie={volver}
    >
      <form onSubmit={manejarSubmit}>
        {error && (
          <div className="mb-5 rounded-md border border-red-800/60 bg-red-950/40 px-3 py-2.5">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="password" className="block text-taller-200 text-xs font-medium mb-1.5 uppercase tracking-wide">
            Contrasena nueva
          </label>
          <div className="relative">
            <input
              id="password"
              type={mostrar ? 'text' : 'password'}
              autoComplete="new-password"
              required
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className={campo}
            />
            <button
              type="button"
              onClick={() => setMostrar((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-taller-400 hover:text-ambar-400 transition-colors"
              aria-label={mostrar ? 'Ocultar contrasena' : 'Mostrar contrasena'}
            >
              {mostrar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <ul className="mb-4 space-y-1">
          {REGLAS.map((regla) => {
            const cumple = regla.cumple(password);
            return (
              <li
                key={regla.texto}
                className={`flex items-center gap-2 text-xs ${cumple ? 'text-ambar-300' : 'text-taller-400'}`}
              >
                <CircleCheck className="w-3.5 h-3.5 shrink-0" strokeWidth={cumple ? 2.25 : 1.5} />
                {regla.texto}
              </li>
            );
          })}
        </ul>

        <div className="mb-6">
          <label
            htmlFor="confirmacion"
            className="block text-taller-200 text-xs font-medium mb-1.5 uppercase tracking-wide"
          >
            Repite la contrasena
          </label>
          <input
            id="confirmacion"
            type={mostrar ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            placeholder="********"
            className={campo}
          />
          {confirmacion && confirmacion !== password && (
            <p className="text-red-300 text-xs mt-1.5">Las dos contrasenas no coinciden.</p>
          )}
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
            'Guardar la contrasena'
          )}
        </button>
      </form>
    </PantallaAuth>
  );
}
