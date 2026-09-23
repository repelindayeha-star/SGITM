import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, LoaderCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import PantallaAuth from '../components/PantallaAuth';
import * as authService from '../services/auth.service';

/**
 * Activar la cuenta (o recuperarla) con el codigo de seis digitos.
 *
 * La misma pantalla sirve para los dos casos porque el recorrido es identico:
 * pedir el codigo, teclearlo y elegir contrasena. Solo cambian los textos y a
 * que par de rutas se llama.
 *
 * Dos decisiones que no se ven pero importan:
 *
 *  - Al pedir el codigo NUNCA se dice "te enviamos un correo", sino "si ese
 *    correo corresponde a una cuenta". El servidor responde igual exista o no
 *    la cuenta, y la pantalla no puede contradecirlo sin delatar quien esta
 *    registrado.
 *
 *  - El codigo se teclea a mano. No llega en un enlace con el secreto dentro,
 *    porque los antivirus y los clientes de correo pre-cargan los enlaces y lo
 *    gastarian antes de que la persona lo abra.
 */
export default function ActivarCuenta({ modo = 'activar' }) {
  const esActivar = modo === 'activar';

  const [paso, setPaso] = useState('pedir'); // pedir -> confirmar -> listo
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const textos = esActivar
    ? {
        titulo: 'Activa tu cuenta',
        descripcion:
          'El taller registro tu motocicleta. Escribe tu correo y te enviamos un codigo para que elijas tu contrasena.',
        boton: 'Enviarme el codigo',
      }
    : {
        titulo: 'Recuperar la contrasena',
        descripcion:
          'Escribe el correo de tu cuenta y te enviamos un codigo de seis digitos.',
        boton: 'Enviarme el codigo',
      };

  async function pedirCodigo(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      if (esActivar) await authService.solicitarCodigoActivacion(email);
      else await authService.solicitarCodigoRecuperacion(email);
      setPaso('confirmar');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo procesar la solicitud. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  }

  async function confirmar(e) {
    e.preventDefault();
    setError('');

    // Se comprueba aqui tambien, no solo en el servidor: asi la persona se
    // entera antes de gastar uno de los cinco intentos del codigo.
    if (password !== confirmacion) {
      setError('Las dos contrasenas no coinciden.');
      return;
    }

    setCargando(true);
    try {
      const datos = { email, codigo, password, confirmacion };
      if (esActivar) await authService.confirmarActivacion(datos);
      else await authService.confirmarRecuperacion(datos);
      setPaso('listo');
    } catch (err) {
      setError(err.response?.data?.mensaje || 'No se pudo confirmar el codigo.');
      setCodigo('');
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

  const bloqueError = error && (
    <div className="mb-5 rounded-md border border-red-800/60 bg-red-950/40 px-3 py-2.5">
      <p className="text-red-300 text-sm">{error}</p>
    </div>
  );

  const claseCampo =
    'w-full bg-taller-900 border border-taller-700 rounded-md px-3 py-2.5 text-taller-100 placeholder-taller-400 text-sm outline-none focus:border-ambar-400 focus:ring-1 focus:ring-ambar-400 transition-colors';
  const claseEtiqueta =
    'block text-taller-200 text-xs font-medium mb-1.5 uppercase tracking-wide';
  const claseBoton =
    'w-full bg-ambar-400 hover:bg-ambar-500 disabled:opacity-60 disabled:cursor-not-allowed text-taller-950 font-semibold text-sm rounded-md py-2.5 flex items-center justify-center gap-2 transition-colors';

  // ---------------------------------------------------------------- listo
  if (paso === 'listo') {
    return (
      <PantallaAuth titulo="Todo listo" pie={volver}>
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-taller-800 border border-taller-700 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6 text-ambar-400" strokeWidth={1.75} />
          </div>
          <p className="text-taller-200 text-sm leading-relaxed">
            Tu contrasena quedo guardada y tu correo verificado. Ya puedes entrar.
          </p>
          <Link to="/login" className={`${claseBoton} mt-6`}>
            Iniciar sesion
          </Link>
        </div>
      </PantallaAuth>
    );
  }

  // ------------------------------------------------------------ confirmar
  if (paso === 'confirmar') {
    return (
      <PantallaAuth
        titulo="Escribe el codigo"
        descripcion={`Si ${email} corresponde a una cuenta activa, le llego un codigo de seis digitos.`}
        pie={volver}
      >
        <form onSubmit={confirmar}>
          {bloqueError}

          <div className="mb-5">
            <label htmlFor="codigo" className={claseEtiqueta}>
              Codigo de seis digitos
            </label>
            <input
              id="codigo"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              autoFocus
              maxLength={6}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              className={`${claseCampo} text-center text-2xl tracking-[0.5em] font-mono`}
            />
            <p className="text-taller-400 text-xs mt-2">
              Caduca en 30 minutos y solo admite cinco intentos.
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="password" className={claseEtiqueta}>
              Tu contrasena nueva
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 8 caracteres, con letra y numero"
              className={claseCampo}
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmacion" className={claseEtiqueta}>
              Repitela
            </label>
            <input
              id="confirmacion"
              type="password"
              autoComplete="new-password"
              required
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
              placeholder="La misma de arriba"
              className={claseCampo}
            />
          </div>

          <button type="submit" disabled={cargando} className={claseBoton}>
            {cargando ? (
              <>
                <LoaderCircle className="w-4 h-4 animate-spin" />
                Comprobando...
              </>
            ) : (
              'Guardar mi contrasena'
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setPaso('pedir');
              setCodigo('');
              setError('');
            }}
            className="w-full mt-4 text-ambar-400 hover:text-ambar-300 text-sm transition-colors"
          >
            No me llego. Pedir otro codigo
          </button>
        </form>
      </PantallaAuth>
    );
  }

  // ---------------------------------------------------------------- pedir
  return (
    <PantallaAuth titulo={textos.titulo} descripcion={textos.descripcion} pie={volver}>
      <form onSubmit={pedirCodigo}>
        {bloqueError}

        <div className="flex justify-center mb-5">
          <div className="w-12 h-12 rounded-full bg-taller-800 border border-taller-700 flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-ambar-400" strokeWidth={1.75} />
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="email" className={claseEtiqueta}>
            Correo electronico
          </label>
          <input
            id="email"
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@correo.com"
            className={claseCampo}
          />
        </div>

        <button type="submit" disabled={cargando} className={claseBoton}>
          {cargando ? (
            <>
              <LoaderCircle className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : (
            textos.boton
          )}
        </button>

        <button
          type="button"
          onClick={() => setPaso('confirmar')}
          className="w-full mt-4 text-ambar-400 hover:text-ambar-300 text-sm transition-colors"
        >
          Ya tengo un codigo
        </button>
      </form>
    </PantallaAuth>
  );
}
