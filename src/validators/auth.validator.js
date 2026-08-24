const { body } = require('express-validator');

const validarRegistro = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres.'),

  body('email')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio.')
    .isEmail().withMessage('El correo no tiene un formato válido.'),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria.')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),

  body('captchaToken')
    .notEmpty().withMessage('Debes completar el captcha.'),
];

const validarLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio.')
    .isEmail().withMessage('El correo no tiene un formato válido.'),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria.'),

  body('captchaToken')
    .notEmpty().withMessage('Debes completar el captcha.'),
];

module.exports = { validarRegistro, validarLogin };