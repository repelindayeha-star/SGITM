const { body, param } = require('express-validator');

const validarCrearCliente = [
  // La recepcionista escribe nombre y correo. NO escribe contrasena: la
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
    .normalizeEmail({ gmail_remove_dots: false }),

  body('telefono')
    .trim()
    .notEmpty().withMessage('El teléfono es obligatorio.')
    .isLength({ min: 7, max: 15 }).withMessage('El teléfono debe tener entre 7 y 15 caracteres.'),

  body('direccion')
    .optional()
    .trim(),
];

const validarActualizarCliente = [
  param('id').isUUID().withMessage('El id debe ser un UUID válido.'),
  body('telefono')
    .optional()
    .trim()
    .isLength({ min: 7, max: 15 }).withMessage('El teléfono debe tener entre 7 y 15 caracteres.'),
  body('direccion').optional().trim(),
];

const validarIdCliente = [
  param('id').isUUID().withMessage('El id debe ser un UUID válido.'),
];

module.exports = { validarCrearCliente, validarActualizarCliente, validarIdCliente };