import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Wrench, ShieldCheck, LoaderCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  async function manejarSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      // NOTA: 'captchaToken' se reemplaza por el token real del checkbox
      // de reCAPTCHA cuando se integre el componente visual del captcha.
      await iniciarSesion({ email, password, captchaToken: 'test-bypass-sigtm' });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo iniciar sesión. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-taller-900 flex items-center justify-center px-4 overflow-hidden">
      {/* Textura de fondo tipo plano técnico */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(var(--color-taller-200) 1px, transparent 1px), linear-gradient(90deg, var(--color-taller-200) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Franja ámbar difusa superior */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-ambar-400 to-transparent opacity-60" />

      <div className="relative w-full max-w-md">
        {/* Encabezado de marca */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-lg bg-taller-800 border border-taller-700 flex items-center justify-center mb-4 shadow-lg">
            <Wrench className="w-7 h-7 text-ambar-400" strokeWidth={1.75} />
          </div>
          <h1 className="font-display text-3xl font-semibold text-taller-100 tracking-wide uppercase">
            SIGTM
          </h1>
          <p className="text-taller-600 text-xs font-mono mt-1 tracking-wider">
            SISTEMA INTEGRAL DE GESTIÓN · TALLERES DE MOTOCICLETAS
          </p>
        </div>

        {/* Tarjeta con remaches */}
        <div className="relative bg-taller-850 border border-taller-700 rounded-xl shadow-2xl">
          {/* Barra superior tipo cinta de precaución */}
          <div className="h-1.5 rounded-t-xl bg-ambar-400" />

          {/* Remaches (esquinas) */}
          <span className="absolute top-3 left-3 w-1.5 h-1.5 rounded-full bg-taller-600" />
          <span className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-taller-600" />
          <span className="absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full bg-taller-600" />
          <span className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-taller-600" />

          <form onSubmit={manejarSubmit} className="px-8 py-9">
            <h2 className="text-taller-100 font-semibold text-lg mb-1">Iniciar sesión</h2>
            <p className="text-taller-600 text-sm mb-6">Ingresa tus credenciales para continuar.</p>

            {error && (
              <div className="mb-5 rounded-md border border-red-800/60 bg-red-950/40 px-3 py-2.5">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-taller-200 text-xs font-medium mb-1.5 uppercase tracking-wide">
                Correo electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@sigtm.com"
                className="w-full bg-taller-900 border border-taller-700 rounded-md px-3 py-2.5 text-taller-100 placeholder-taller-600 text-sm outline-none focus:border-ambar-400 focus:ring-1 focus:ring-ambar-400 transition-colors"
              />
            </div>

            <div className="mb-5">
              <label className="block text-taller-200 text-xs font-medium mb-1.5 uppercase tracking-wide">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={mostrarPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-taller-900 border border-taller-700 rounded-md px-3 py-2.5 pr-10 text-taller-100 placeholder-taller-600 text-sm outline-none focus:border-ambar-400 focus:ring-1 focus:ring-ambar-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-taller-600 hover:text-ambar-400 transition-colors"
                  aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {mostrarPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Placeholder visual del captcha, se reemplaza por el checkbox real de reCAPTCHA */}
            <div className="mb-6 flex items-center gap-2.5 rounded-md border border-dashed border-taller-700 bg-taller-900/60 px-3 py-2.5">
              <ShieldCheck className="w-4 h-4 text-taller-600 shrink-0" />
              <span className="text-taller-600 text-xs font-mono">reCAPTCHA se integrará aquí</span>
            </div>

            <button
              type="submit"
              disabled={cargando}
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
          </form>
        </div>

        <p className="text-center text-taller-700 text-xs font-mono mt-6">v1.0.0 · SENA — ADSO 3114227</p>
      </div>
    </div>
  );
}