const { body } = require('express-validator');

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

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria.')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),

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

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria.')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.')
    .matches(/[A-Za-z]/).withMessage('La contraseña debe incluir al menos una letra.')
    .matches(/\d/).withMessage('La contraseña debe incluir al menos un número.'),

  body('confirmacion')
    .custom((valor, { req }) => valor === req.body.password)
    .withMessage('Las dos contraseñas no coinciden.'),
];

module.exports = {
  validarRegistro,
  validarLogin,
  validarSolicitudRecuperacion,
  validarRestablecer,
};
