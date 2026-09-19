const { body } = require('express-validator');

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
    .matches(/\d/).withMessage('La contraseña debe incluir al menos un número.');

const reglaEmail = (campo = 'email') =>
  body(campo)
    .trim()
    .notEmpty().withMessage('El correo es obligatorio.')
    .isEmail().withMessage('El correo no tiene un formato válido.')
    .normalizeEmail({ gmail_remove_dots: false });


const validarRegistro = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres.'),

  body('email')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio.')
    .isEmail().withMessage('El correo no tiene un formato válido.')
    .normalizeEmail({ gmail_remove_dots: false }),

  reglaPassword(),

  // El registro publico solo crea CLIENTES.
  //
  // Antes este campo no se validaba y el servicio lo tomaba del cuerpo de la
  // peticion: una sola llamada con {"rol":"ADMINISTRADOR"} creaba un
  // administrador sin autenticacion de por medio.
  //
  // Se rechaza explicitamente en vez de ignorarlo en silencio, para que quede
  // registrado el intento. El servicio ademas fuerza el rol por su cuenta:
  // dos barreras para el mismo hueco.
  body('rol')
    .optional()
    .equals('CLIENTE')
    .withMessage('El registro público solo permite crear cuentas de cliente.'),

  body('captchaToken')
    .notEmpty().withMessage('Debes completar el captcha.'),
];

const validarLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio.')
    .isEmail().withMessage('El correo no tiene un formato válido.')
    .normalizeEmail({ gmail_remove_dots: false }),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria.'),

  body('captchaToken')
    .notEmpty().withMessage('Debes completar el captcha.'),
];

const validarSolicitudRecuperacion = [
  body('email')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio.')
    .isEmail().withMessage('El correo no tiene un formato válido.')
    .normalizeEmail({ gmail_remove_dots: false }),
];

// La contrasena nueva se pide dos veces. No es un capricho de formulario:
// si la persona se equivoca al teclear queda fuera de su propia cuenta, y el
// enlace ya se habria gastado.
const validarRestablecer = [
  body('token')
    .trim()
    .notEmpty().withMessage('Falta el token del enlace.'),

  reglaPassword(),

  body('confirmacion')
    .custom((valor, { req }) => valor === req.body.password)
    .withMessage('Las dos contraseñas no coinciden.'),
];

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

module.exports = {
  validarRegistro,
  validarLogin,
  validarSolicitudRecuperacion,
  validarRestablecer,
  validarSolicitudCodigo,
  validarConfirmarCodigo,
};
