const { body, param } = require('express-validator');

const validarCrearRepuesto = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.'),

  body('codigo')
    .trim()
    .notEmpty().withMessage('El código es obligatorio.'),

  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('El stock debe ser un número entero mayor o igual a 0.'),

  body('stockMinimo')
    .optional()
    .isInt({ min: 0 }).withMessage('El stock mínimo debe ser un número entero mayor o igual a 0.'),

  body('precio')
    .notEmpty().withMessage('El precio es obligatorio.')
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número mayor o igual a 0.'),
];

const validarActualizarRepuesto = [
  param('id').isUUID().withMessage('El id debe ser un UUID válido.'),
  body('nombre').optional().trim(),
  body('precio').optional().isFloat({ min: 0 }).withMessage('El precio debe ser válido.'),
  body('stockMinimo').optional().isInt({ min: 0 }).withMessage('El stock mínimo debe ser válido.'),
];

const validarMovimiento = [
  body('repuestoId')
    .notEmpty().withMessage('El repuestoId es obligatorio.')
    .isUUID().withMessage('El repuestoId debe ser un UUID válido.'),

  body('tipo')
    .notEmpty().withMessage('El tipo es obligatorio.')
    .isIn(['ENTRADA', 'SALIDA']).withMessage('El tipo debe ser ENTRADA o SALIDA.'),

  body('cantidad')
    .notEmpty().withMessage('La cantidad es obligatoria.')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser un entero mayor a 0.'),

  body('motivo')
    .trim()
    .notEmpty().withMessage('El motivo es obligatorio.'),
];

const validarIdRepuesto = [
  param('id').isUUID().withMessage('El id debe ser un UUID válido.'),
];

module.exports = {
  validarCrearRepuesto,
  validarActualizarRepuesto,
  validarMovimiento,
  validarIdRepuesto,
};