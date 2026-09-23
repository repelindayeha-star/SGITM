const { body, param } = require('express-validator');
const { normalizarPlaca, esPlacaMotoValida, MENSAJE_PLACA } = require('../utils/placa');

const anioActual = new Date().getFullYear();

const validarCrearMotocicleta = [
  body('clienteId')
    .notEmpty().withMessage('El clienteId es obligatorio.')
    .isUUID().withMessage('El clienteId debe ser un UUID válido.'),

  // La placa se normaliza ANTES de validarla: la gente escribe "abc 12 d" o
  // "ABC-12D" y las dos son la misma placa. Como customSanitizer corre antes
  // que la comprobacion, lo que llega al servicio ya viene limpio, y la
  // restriccion de unicidad de la base no se puede burlar con un guion.
  body('placa')
    .trim()
    .notEmpty().withMessage('La placa es obligatoria.')
    .customSanitizer(normalizarPlaca)
    .custom(esPlacaMotoValida).withMessage(MENSAJE_PLACA),

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