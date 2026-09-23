import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Wrench, LoaderCircle } from 'lucide-react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useAuth } from '../context/AuthContext';
import { rutaInicioPorRol } from '../utils/permisos';

const CLAVE_SITIO_RECAPTCHA = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const captchaRef = useRef(null);
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  // Si el desafio caduca o el servidor rechaza el intento, el token deja de
  // ser valido: hay que devolver el recuadro a su estado inicial.
  function reiniciarCaptcha() {
    captchaRef.current?.reset();
    setCaptchaToken(null);
  }

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');

    if (!captchaToken) {
      setError('Confirma que no eres un robot para continuar.');
      return;
    }

    setCargando(true);
    try {
      const usuario = await iniciarSesion({ email, password, captchaToken });
      navigate(rutaInicioPorRol(usuario.rol));
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo iniciar sesion. Intenta de nuevo.');
      reiniciarCaptcha();
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-taller-900 flex items-center justify-center px-4 overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-taller-200) 1px, transparent 1px), linear-gradient(90deg, var(--color-taller-200) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-ambar-400 to-transparent opacity-60" />

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-lg bg-taller-800 border border-taller-700 flex items-center justify-center mb-4 shadow-lg">
            <Wrench className="w-7 h-7 text-ambar-400" strokeWidth={1.75} />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-taller-100 tracking-wide uppercase">SIGTM</h1>
          <p className="text-taller-400 text-xs font-mono mt-1 tracking-wider">
            SISTEMA INTEGRAL DE GESTION - TALLERES DE MOTOCICLETAS
          </p>
        </div>

        <div className="relative bg-taller-850 border border-taller-700 rounded-xl shadow-2xl">
          <div className="h-1.5 rounded-t-xl bg-ambar-400" />

          <span className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-taller-600" />
          <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-taller-600" />
          <span className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-taller-600" />
          <span className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-taller-600" />

          <form onSubmit={manejarSubmit} className="px-8 py-9">
            <h2 className="text-taller-100 font-semibold text-lg mb-1">Iniciar sesion</h2>
            <p className="text-taller-400 text-sm mb-6">Ingresa tus credenciales para continuar.</p>

            {error && (
              <div className="mb-5 rounded-md border border-red-800/60 bg-red-950/40 px-3 py-2.5">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-taller-200 text-xs font-medium mb-1.5 uppercase tracking-wide">
                Correo electronico
              </label>
              <input
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@sigtm.com"
                className="w-full bg-taller-900 border border-taller-700 rounded-md px-3 py-2.5 text-taller-100 placeholder-taller-400 text-sm outline-none focus:border-ambar-400 focus:ring-1 focus:ring-ambar-400 transition-colors"
              />
            </div>

            <div className="mb-5">
              <label className="block text-taller-200 text-xs font-medium mb-1.5 uppercase tracking-wide">
                Contrasena
              </label>
              <div className="relative">
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  className="w-full bg-taller-900 border border-taller-700 rounded-md px-3 py-2.5 pr-10 text-taller-100 placeholder-taller-400 text-sm outline-none focus:border-ambar-400 focus:ring-1 focus:ring-ambar-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-taller-400 hover:text-ambar-400 transition-colors"
                  aria-label={mostrarPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                >
                  {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="mb-6 flex justify-center">
              {CLAVE_SITIO_RECAPTCHA ? (
                <ReCAPTCHA
                  ref={captchaRef}
                  sitekey={CLAVE_SITIO_RECAPTCHA}
                  theme="dark"
                  hl="es"
                  onChange={setCaptchaToken}
                  onExpired={() => setCaptchaToken(null)}
                  onErrored={() => setCaptchaToken(null)}
                />
              ) : (
                <p className="text-red-300 text-xs font-mono text-center">
                  Falta VITE_RECAPTCHA_SITE_KEY en frontend/.env
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={cargando || !captchaToken}
              className="w-full bg-ambar-400 hover:bg-ambar-500 disabled:opacity-60 disabled:cursor-not-allowed text-taller-950 font-semibold text-sm rounded-md py-2.5 flex items-center justify-center gap-2 transition-colors"
            >
              {cargando ? (
                <>
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>

            <p className="text-center mt-5">
              <Link
                to="/recuperar-password"
                className="text-taller-400 hover:text-ambar-400 text-sm transition-colors"
              >
                Olvide mi contrasena
              </Link>
        <Link
          to="/activar"
          className="block text-center text-taller-400 hover:text-ambar-400 text-sm mt-3 transition-colors"
        >
          Activar mi cuenta con un codigo
        </Link>
            </p>
          </form>
        </div>

        <p className="text-center text-taller-400 text-xs font-mono mt-6">v1.0.0 - SENA - ADSO 3114227</p>
      </div>
    </div>
  );
}
