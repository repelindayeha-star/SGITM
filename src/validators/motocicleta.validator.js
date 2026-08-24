const { body, param } = require('express-validator');

const anioActual = new Date().getFullYear();

const validarCrearMotocicleta = [
  body('clienteId')
    .notEmpty().withMessage('El clienteId es obligatorio.')
    .isUUID().withMessage('El clienteId debe ser un UUID válido.'),

  body('placa')
    .trim()
    .notEmpty().withMessage('La placa es obligatoria.')
    .isLength({ min: 5, max: 8 }).withMessage('La placa debe tener entre 5 y 8 caracteres.'),

  body('marca')
    .trim()
    .notEmpty().withMessage('La marca es obligatoria.'),

  body('modelo')
    .trim()
    .notEmpty().withMessage('El modelo es obligatorio.'),

  body('anio')
    .notEmpty().withMessage('El año es obligatorio.')
    .isInt({ min: 1980, max: anioActual + 1 })
    .withMessage(`El año debe estar entre 1980 y ${anioActual + 1}.`),

  body('color').optional().trim(),
];

const validarActualizarMotocicleta = [
  param('id').isUUID().withMessage('El id debe ser un UUID válido.'),
  body('marca').optional().trim(),
  body('modelo').optional().trim(),
  body('anio')
    .optional()
    .isInt({ min: 1980, max: anioActual + 1 })
    .withMessage(`El año debe estar entre 1980 y ${anioActual + 1}.`),
  body('color').optional().trim(),
];

const validarIdMotocicleta = [
  param('id').isUUID().withMessage('El id debe ser un UUID válido.'),
];

module.exports = {
  validarCrearMotocicleta,
  validarActualizarMotocicleta,
  validarIdMotocicleta,
};