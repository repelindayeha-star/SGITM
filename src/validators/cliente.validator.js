const { body, param } = require('express-validator');

const validarCrearCliente = [
  body('usuarioId')
    .notEmpty().withMessage('El usuarioId es obligatorio.')
    .isUUID().withMessage('El usuarioId debe ser un UUID válido.'),

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