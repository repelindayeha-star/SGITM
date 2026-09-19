// Parche 3: cierra el modulo por el lado de las pantallas.
//
//  - auth.service (frontend) : las cuatro llamadas nuevas
//  - cliente.service         : crearCliente manda nombre y correo
//  - ClienteFormulario       : FUERA el campo de contrasena
//  - App.jsx                 : rutas /activar y /recuperar-codigo
//  - Login.jsx               : enlace a "Activar mi cuenta"
//  - plantillas/correo       : boton a la pantalla (sin secreto dentro)
//  - servidor                : limpieza de codigos caducados

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const leer = (p) => fs.readFileSync(path.join(RAIZ, p), 'utf8');
const guardar = (p, t) => fs.writeFileSync(path.join(RAIZ, p), t, 'utf8');
function exigir(t, trozo, donde) {
  if (!t.includes(trozo)) {
    console.error(`ERROR en ${donde}: no encontre\n---\n${trozo}\n---`);
    process.exit(1);
  }
}

// ======================================================= 1. auth.service (frontend)
{
  const P = 'frontend/src/services/auth.service.js';
  let t = leer(P);
  if (t.includes('solicitarCodigoActivacion')) {
    console.log('1. auth.service: ya estaba');
  } else {
    t += `
// --- Codigos de seis digitos -------------------------------------------

export async function solicitarCodigoActivacion(email) {
  const { data } = await api.post('/auth/activar/solicitar', { email });
  return data;
}

export async function confirmarActivacion({ email, codigo, password, confirmacion }) {
  const { data } = await api.post('/auth/activar/confirmar', {
    email,
    codigo,
    password,
    confirmacion,
  });
  return data;
}

export async function solicitarCodigoRecuperacion(email) {
  const { data } = await api.post('/auth/recuperar-codigo/solicitar', { email });
  return data;
}

export async function confirmarRecuperacion({ email, codigo, password, confirmacion }) {
  const { data } = await api.post('/auth/recuperar-codigo/confirmar', {
    email,
    codigo,
    password,
    confirmacion,
  });
  return data;
}
`;
    guardar(P, t);
    console.log('1. auth.service: cuatro llamadas nuevas');
  }
}

// ======================================================= 2. cliente.service (frontend)
{
  const P = 'frontend/src/services/cliente.service.js';
  let t = leer(P);
  const viejo = `export async function crearCliente({ usuarioId, telefono, direccion }) {
  const { data } = await api.post('/clientes', { usuarioId, telefono, direccion });
  return data.data;
}`;
  if (!t.includes(viejo)) {
    console.log('2. cliente.service: ya estaba');
  } else {
    const nuevo = `// La recepcionista manda nombre y correo. NO manda contrasena: el servidor
// crea la cuenta sin una utilizable y le envia al cliente un codigo para que
// elija la suya. Devuelve tambien si el correo salio, para poder avisarlo.
export async function crearCliente({ nombre, email, telefono, direccion }) {
  const { data } = await api.post('/clientes', { nombre, email, telefono, direccion });
  return data;
}`;
    guardar(P, t.replace(viejo, nuevo));
    console.log('2. cliente.service: crearCliente sin contrasena');
  }
}

// ======================================================= 3. ClienteFormulario
{
  const P = 'frontend/src/pages/ClienteFormulario.jsx';
  let t = leer(P);
  if (!t.includes('Contrasena temporal')) {
    console.log('3. ClienteFormulario: ya estaba');
  } else {
    t = t.replace(
      "import * as authService from '../services/auth.service';\n",
      ''
    );
    t = t.replace("  const [password, setPassword] = useState('');\n", '');
    t = t.replace(
      "  const [guardando, setGuardando] = useState(false);",
      "  const [guardando, setGuardando] = useState(false);\n  const [aviso, setAviso] = useState('');"
    );

    const viejoSubmit = `      // Paso 1: crear el usuario con rol CLIENTE (captcha en bypass de desarrollo).
      const usuario = await authService.registrar({
        nombre,
        email,
        password,
        rol: 'CLIENTE',
        captchaToken: 'test-bypass-sigtm',
      });

      // Paso 2: crear el perfil de cliente asociado a ese usuario.
      await clienteService.crearCliente({ usuarioId: usuario.id, telefono, direccion });

      navigate('/clientes');`;
    exigir(t, viejoSubmit, P);
    const nuevoSubmit = `      // Una sola llamada. El servidor crea la cuenta y el perfil juntos, sin
      // contrasena utilizable, y le manda al cliente un codigo de seis digitos
      // para que elija la suya. Aqui nadie escribe ni ve una contrasena ajena.
      const respuesta = await clienteService.crearCliente({ nombre, email, telefono, direccion });

      setAviso(respuesta.mensaje || 'Cliente registrado.');
      setTimeout(() => navigate('/clientes'), 2200);`;
    t = t.replace(viejoSubmit, nuevoSubmit);

    t = t.replace(
      'Se creara una cuenta de acceso y el perfil de cliente asociado.',
      'Se le enviara un codigo a su correo para que active su cuenta y elija su propia contrasena.'
    );

    const campoPassword = `          <div className="col-span-2">
            <Input
              etiqueta="Contrasena temporal"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 8 caracteres"
            />
          </div>`;
    exigir(t, campoPassword, P);
    const nota = `          <div className="col-span-2">
            <div className="rounded-md border border-taller-700 bg-taller-900 px-3 py-2.5">
              <p className="text-taller-200 text-xs leading-relaxed">
                <span className="text-ambar-400 font-medium">No escribas ninguna contrasena.</span>{' '}
                Al guardar, al cliente le llega un codigo a su correo y el elige la suya. Nadie del
                taller la conoce.
              </p>
            </div>
          </div>`;
    t = t.replace(campoPassword, nota);

    t = t.replace(
      '        <ErrorBanner>{error}</ErrorBanner>',
      `        <ErrorBanner>{error}</ErrorBanner>

        {aviso && (
          <div className="mb-5 rounded-md border border-ambar-400/50 bg-ambar-400/10 px-3 py-2.5">
            <p className="text-ambar-400 text-sm">{aviso}</p>
          </div>
        )}`
    );

    guardar(P, t);
    console.log('3. ClienteFormulario: fuera el campo de contrasena');
  }
}

// ======================================================= 4. App.jsx
{
  const P = 'frontend/src/App.jsx';
  let t = leer(P);
  if (t.includes('ActivarCuenta')) {
    console.log('4. App.jsx: ya estaba');
  } else {
    const marca = "<Route path=\"/seguimiento\" element={<SeguimientoPublico />} />";
    exigir(t, marca, P);
    t = t.replace(
      marca,
      `${marca}
          <Route path="/activar" element={<ActivarCuenta modo="activar" />} />
          <Route path="/recuperar-codigo" element={<ActivarCuenta modo="recuperar" />} />`
    );
    const importMarca = "import SeguimientoPublico";
    exigir(t, importMarca, P);
    const lineaImport = t.split('\n').find((l) => l.startsWith(importMarca));
    t = t.replace(lineaImport, `${lineaImport}\nimport ActivarCuenta from './pages/ActivarCuenta';`);
    guardar(P, t);
    console.log('4. App.jsx: rutas /activar y /recuperar-codigo');
  }
}

// ======================================================= 5. Login.jsx
{
  const P = 'frontend/src/pages/Login.jsx';
  let t = leer(P);
  if (t.includes('/activar')) {
    console.log('5. Login.jsx: ya estaba');
  } else if (t.includes('Olvide mi contrasena')) {
    t = t.replace(
      /(<Link[^>]*to="\/recuperar-password"[\s\S]*?<\/Link>)/,
      `$1
        <Link
          to="/activar"
          className="block text-center text-taller-400 hover:text-ambar-400 text-sm mt-3 transition-colors"
        >
          Activar mi cuenta con un codigo
        </Link>`
    );
    guardar(P, t);
    console.log('5. Login.jsx: enlace a activar');
  } else {
    console.log('5. Login.jsx: no encontre donde poner el enlace (se salta)');
  }
}

// ======================================================= 6. boton en el correo
{
  const P = 'src/plantillas/correo.js';
  let t = leer(P);
  if (t.includes('enlacePantalla')) {
    console.log('6. plantilla: ya estaba');
  } else {
    // El boton NO lleva ningun secreto: es la direccion pelada de la pantalla.
    // Si un antivirus lo pre-carga, solo abre un formulario vacio. El secreto
    // sigue siendo el codigo, que la persona teclea a mano.
    t = t.replace(
      'function codigoActivacion({ nombre, codigo, minutos }) {',
      'function codigoActivacion({ nombre, codigo, minutos, enlacePantalla }) {'
    );
    t = t.replace(
      "        parrafo('Escribelo en la pantalla de activacion de la aplicacion.') +",
      `        (enlacePantalla
          ? boton(enlacePantalla, 'Ir a la pantalla de activacion')
          : parrafo('Escribelo en la pantalla de activacion de la aplicacion.')) +`
    );
    t = t.replace(
      'function codigoRecuperacion({ nombre, codigo, minutos }) {',
      'function codigoRecuperacion({ nombre, codigo, minutos, enlacePantalla }) {'
    );
    t = t.replace(
      "        nota(`Caduca en ${minutos} minutos y solo admite cinco intentos.`) +",
      `        (enlacePantalla ? boton(enlacePantalla, 'Ir a la pantalla') : '') +
        nota(\`Caduca en \${minutos} minutos y solo admite cinco intentos.\`) +`
    );
    guardar(P, t);
    console.log('6. plantilla: boton sin secreto');
  }
}

// ======================================================= 7. servicio manda el enlace
{
  const P = 'src/services/activacion.service.js';
  let t = leer(P);
  if (t.includes('enlacePantalla')) {
    console.log('7. activacion.service: ya estaba');
  } else {
    t = t.replace(
      "const AppError = require('../utils/AppError');",
      "const AppError = require('../utils/AppError');\nconst env = require('../config/env');"
    );
    t = t.replace(
      `  const mensaje = plantillas.codigoActivacion({
    nombre: usuario.nombre,
    codigo,
    minutos: CADUCIDAD_MINUTOS.VERIFICACION_EMAIL,
  });`,
      `  const mensaje = plantillas.codigoActivacion({
    nombre: usuario.nombre,
    codigo,
    minutos: CADUCIDAD_MINUTOS.VERIFICACION_EMAIL,
    enlacePantalla: \`\${env.urlFrontend}/activar\`,
  });`
    );
    t = t.replace(
      `        ? plantillas.codigoActivacion({ nombre: usuario.nombre, codigo, minutos })
        : plantillas.codigoRecuperacion({ nombre: usuario.nombre, codigo, minutos });`,
      `        ? plantillas.codigoActivacion({
            nombre: usuario.nombre,
            codigo,
            minutos,
            enlacePantalla: \`\${env.urlFrontend}/activar\`,
          })
        : plantillas.codigoRecuperacion({
            nombre: usuario.nombre,
            codigo,
            minutos,
            enlacePantalla: \`\${env.urlFrontend}/recuperar-codigo\`,
          });`
    );
    guardar(P, t);
    console.log('7. activacion.service: manda el enlace de la pantalla');
  }
}

// ======================================================= comprobacion
console.log('');
console.log('=== COMPROBACION ===');
delete require.cache[require.resolve(path.join(RAIZ, 'src/plantillas/correo.js'))];
const pl = require(path.join(RAIZ, 'src/plantillas/correo.js'));
const m = pl.codigoActivacion({
  nombre: 'Marcela',
  codigo: '493021',
  minutos: 30,
  enlacePantalla: 'http://localhost:5173/activar',
});
console.log(`  el correo trae el codigo    : ${m.html.includes('493021') ? 'si' : 'NO'}`);
console.log(`  el correo trae el boton     : ${m.html.includes('/activar') ? 'si' : 'NO'}`);
console.log(`  el boton NO lleva secreto   : ${/activar\?|token=|codigo=/.test(m.html) ? 'MAL' : 'correcto'}`);
require(path.join(RAIZ, 'src/app.js'));
console.log('  el servidor carga           : si');
