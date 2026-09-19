// Parche 2: conecta el alta de clientes y los codigos con la API.
//
//  - cliente.validator  : la recepcionista manda nombre y correo, no usuarioId
//  - cliente.controller : usa el servicio nuevo, no el registro publico
//  - auth.validator     : UNA sola regla de contrasena + validadores de codigo
//  - auth.controller    : cuatro acciones nuevas
//  - auth.routes        : cuatro rutas nuevas, cada una con su freno

const fs = require('fs');
const path = require('path');
const RAIZ = path.join(__dirname, '..');
const leer = (p) => fs.readFileSync(path.join(RAIZ, p), 'utf8');
const guardar = (p, t) => fs.writeFileSync(path.join(RAIZ, p), t, 'utf8');

function exigir(texto, trozo, donde) {
  if (!texto.includes(trozo)) {
    console.error(`ERROR: no encontre en ${donde}:\n---\n${trozo}\n---`);
    process.exit(1);
  }
}

// ============================================================ 1. validador de cliente
{
  const P = 'src/validators/cliente.validator.js';
  let t = leer(P);
  if (t.includes("body('email')")) {
    console.log('1. cliente.validator: ya estaba');
  } else {
    const viejo = `  body('usuarioId')
    .notEmpty().withMessage('El usuarioId es obligatorio.')
    .isUUID().withMessage('El usuarioId debe ser un UUID válido.'),`;
    exigir(t, viejo, P);
    const nuevo = `  // La recepcionista escribe nombre y correo. NO escribe contrasena: la
  // cuenta nace sin una utilizable y el cliente elige la suya con el codigo
  // que le llega al correo. Asi nadie del taller conoce la clave de nadie.
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres.'),

  body('email')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio.')
    .isEmail().withMessage('El correo no tiene un formato válido.')
    .normalizeEmail({ gmail_remove_dots: false }),`;
    guardar(P, t.replace(viejo, nuevo));
    console.log('1. cliente.validator: pide nombre y correo');
  }
}

// ============================================================ 2. controlador de cliente
{
  const P = 'src/controllers/cliente.controller.js';
  let t = leer(P);
  if (t.includes('activacion.service')) {
    console.log('2. cliente.controller: ya estaba');
  } else {
    t = t.replace(
      "const clienteService = require('../services/cliente.service');",
      "const clienteService = require('../services/cliente.service');\nconst activacionService = require('../services/activacion.service');"
    );
    const viejo = `    const cliente = await clienteService.crear(req.body);
    res.status(201).json({ exito: true, mensaje: 'Cliente creado correctamente.', data: cliente });`;
    exigir(t, viejo, P);
    const nuevo = `    const { nombre, email, telefono, direccion } = req.body;
    const { cliente, correoEnviado } = await activacionService.crearClienteDesdeRecepcion({
      nombre,
      email,
      telefono,
      direccion,
    });

    // Se le dice a la recepcionista si el correo salio o no. Si no salio, el
    // cliente igual quedo registrado y ella puede reenviar el codigo: no se
    // pierde el trabajo por un fallo del proveedor de correo.
    res.status(201).json({
      exito: true,
      mensaje: correoEnviado
        ? 'Cliente registrado. Le enviamos un codigo a su correo para que active su cuenta.'
        : 'Cliente registrado, pero el correo no se pudo enviar. Reenvia el codigo mas tarde.',
      data: cliente,
    });`;
    guardar(P, t.replace(viejo, nuevo));
    console.log('2. cliente.controller: usa el alta con codigo');
  }
}

// ============================================================ 3. validador de auth
{
  const P = 'src/validators/auth.validator.js';
  let t = leer(P);
  if (t.includes('reglaPassword')) {
    console.log('3. auth.validator: ya estaba');
  } else {
    const cabecera = `const { body } = require('express-validator');

// UNA sola regla de contrasena para todo el sistema.
//
// Antes el registro exigia ocho caracteres y el restablecimiento exigia ocho
// mas una letra y un numero. Se podia crear una cuenta con una contrasena que
// despues el propio sistema no dejaba volver a poner. Ahora la regla vive en
// un solo sitio y todas las puertas piden lo mismo.
const reglaPassword = (campo = 'password') =>
  body(campo)
    .notEmpty().withMessage('La contraseña es obligatoria.')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.')
    .matches(/[A-Za-z]/).withMessage('La contraseña debe incluir al menos una letra.')
    .matches(/\\d/).withMessage('La contraseña debe incluir al menos un número.');

const reglaEmail = (campo = 'email') =>
  body(campo)
    .trim()
    .notEmpty().withMessage('El correo es obligatorio.')
    .isEmail().withMessage('El correo no tiene un formato válido.')
    .normalizeEmail({ gmail_remove_dots: false });
`;
    exigir(t, "const { body } = require('express-validator');", P);
    t = t.replace("const { body } = require('express-validator');", cabecera);

    const passRegistro = `  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria.')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),`;
    exigir(t, passRegistro, P);
    t = t.replace(passRegistro, '  reglaPassword(),');

    const passRestablecer = `  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria.')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.')
    .matches(/[A-Za-z]/).withMessage('La contraseña debe incluir al menos una letra.')
    .matches(/\\d/).withMessage('La contraseña debe incluir al menos un número.'),`;
    exigir(t, passRestablecer, P);
    t = t.replace(passRestablecer, '  reglaPassword(),');

    const nuevos = `
// Pedir un codigo: solo hace falta el correo.
const validarSolicitudCodigo = [reglaEmail()];

// Confirmar un codigo y dejar la contrasena elegida.
//
// El codigo se exige de seis digitos exactos antes de tocar la base: asi un
// intento mal formado ni siquiera gasta uno de los cinco intentos que tiene
// el codigo de verdad.
const validarConfirmarCodigo = [
  reglaEmail(),

  body('codigo')
    .trim()
    .notEmpty().withMessage('El código es obligatorio.')
    .matches(/^[0-9]{6}$/).withMessage('El código son seis dígitos.'),

  reglaPassword(),

  body('confirmacion')
    .custom((valor, { req }) => valor === req.body.password)
    .withMessage('Las dos contraseñas no coinciden.'),
];

module.exports = {`;
    exigir(t, '\nmodule.exports = {', P);
    t = t.replace('\nmodule.exports = {', nuevos);
    t = t.replace(
      '  validarRestablecer,\n};',
      '  validarRestablecer,\n  validarSolicitudCodigo,\n  validarConfirmarCodigo,\n};'
    );
    guardar(P, t);
    console.log('3. auth.validator: regla unica + validadores de codigo');
  }
}

// ============================================================ 4. controlador de auth
{
  const P = 'src/controllers/auth.controller.js';
  let t = leer(P);
  if (t.includes('activacion.service')) {
    console.log('4. auth.controller: ya estaba');
  } else {
    t = t.replace(
      "const recuperacionService = require('../services/recuperacion.service');",
      "const recuperacionService = require('../services/recuperacion.service');\nconst activacionService = require('../services/activacion.service');"
    );
    const nuevas = `
// --- Codigos de seis digitos -------------------------------------------
//
// Existen ademas de los enlaces porque el cliente de un taller abre el correo
// en el celular y teclea los numeros en la pantalla que ya tiene delante. Las
// cuatro responden siempre 200 con el mismo texto cuando el correo no existe,
// para no confirmarle a nadie que cuentas hay.

async function solicitarCodigoActivacion(req, res, next) {
  try {
    const r = await activacionService.enviarCodigo({
      email: req.body.email,
      tipo: 'VERIFICACION_EMAIL',
    });
    res.status(200).json({ exito: true, mensaje: r.mensaje });
  } catch (error) {
    next(error);
  }
}

async function confirmarActivacion(req, res, next) {
  try {
    const { email, codigo, password } = req.body;
    const r = await activacionService.confirmarCodigo({
      email,
      codigo,
      password,
      tipo: 'VERIFICACION_EMAIL',
    });
    res.status(200).json({ exito: true, mensaje: r.mensaje });
  } catch (error) {
    next(error);
  }
}

async function solicitarCodigoRecuperacion(req, res, next) {
  try {
    const r = await activacionService.enviarCodigo({
      email: req.body.email,
      tipo: 'RECUPERACION_PASSWORD',
    });
    res.status(200).json({ exito: true, mensaje: r.mensaje });
  } catch (error) {
    next(error);
  }
}

async function confirmarRecuperacion(req, res, next) {
  try {
    const { email, codigo, password } = req.body;
    const r = await activacionService.confirmarCodigo({
      email,
      codigo,
      password,
      tipo: 'RECUPERACION_PASSWORD',
    });
    res.status(200).json({ exito: true, mensaje: r.mensaje });
  } catch (error) {
    next(error);
  }
}

module.exports = {`;
    exigir(t, '\nmodule.exports = {', P);
    t = t.replace('\nmodule.exports = {', nuevas);
    t = t.replace(
      '  verificarEmail,\n};',
      '  verificarEmail,\n  solicitarCodigoActivacion,\n  confirmarActivacion,\n  solicitarCodigoRecuperacion,\n  confirmarRecuperacion,\n};'
    );
    guardar(P, t);
    console.log('4. auth.controller: cuatro acciones nuevas');
  }
}

// ============================================================ 5. rutas de auth
{
  const P = 'src/routes/auth.routes.js';
  let t = leer(P);
  if (t.includes('/activar/confirmar')) {
    console.log('5. auth.routes: ya estaba');
  } else {
    t = t.replace(
      '  validarRestablecer,\n} = ',
      '  validarRestablecer,\n  validarSolicitudCodigo,\n  validarConfirmarCodigo,\n} = '
    );
    const marca = "router.get('/verificar-correo/:token', frenoComprobacion, authController.verificarEmail);";
    exigir(t, marca, P);
    const nuevas = `${marca}

// Codigos de seis digitos.
//
// Pedir un codigo manda un correo: va con el freno estrecho, el mismo que
// protege de usar el sistema para inundar el buzon de otra persona.
//
// Confirmar un codigo NO manda nada, asi que lleva el freno holgado, con
// margen para que alguien se equivoque tecleando. La defensa de verdad
// contra la fuerza bruta no es este freno sino el contador de intentos que
// vive en la propia fila del codigo: ese sigue contando aunque el servidor
// corra repartido en varias instancias, donde un contador en memoria no
// serviria de nada.
router.post(
  '/activar/solicitar',
  frenoEnvioCorreo,
  validarSolicitudCodigo,
  validarCampos,
  authController.solicitarCodigoActivacion
);
router.post(
  '/activar/confirmar',
  frenoRestablecer,
  validarConfirmarCodigo,
  validarCampos,
  authController.confirmarActivacion
);
router.post(
  '/recuperar-codigo/solicitar',
  frenoEnvioCorreo,
  validarSolicitudCodigo,
  validarCampos,
  authController.solicitarCodigoRecuperacion
);
router.post(
  '/recuperar-codigo/confirmar',
  frenoRestablecer,
  validarConfirmarCodigo,
  validarCampos,
  authController.confirmarRecuperacion
);`;
    guardar(P, t.replace(marca, nuevas));
    console.log('5. auth.routes: cuatro rutas nuevas');
  }
}

// ============================================================ comprobacion
console.log('');
console.log('=== COMPROBACION: ¿carga todo sin romperse? ===');
const app = require(path.join(RAIZ, 'src', 'app.js'));
console.log('  la aplicacion carga: si');
console.log('');
console.log('=== RUTAS DE /api/auth ===');
const pila = app._router.stack.find((c) => c.name === 'router' && c.regexp.toString().includes('auth'));
if (pila) {
  pila.handle.stack
    .filter((c) => c.route)
    .forEach((c) => {
      const m = Object.keys(c.route.methods)[0].toUpperCase();
      console.log(`  ${m.padEnd(5)} /api/auth${c.route.path}`);
    });
}
