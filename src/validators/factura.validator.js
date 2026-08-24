const { body, param } = require('express-validator');

const validarCrearFactura = [
  body('ordenId')
    .notEmpty().withMessage('El ordenId es obligatorio.')
    .isUUID().withMessage('El ordenId debe ser un UUID válido.'),

  body('metodoPago')
    .notEmpty().withMessage('El método de pago es obligatorio.')
    .isIn(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'])
    .withMessage('Método de pago inválido. Válidos: EFECTIVO, TARJETA, TRANSFERENCIA.'),
];

const validarIdFactura = [
  param('id').isUUID().withMessage('El id debe ser un UUID válido.'),
];

const validarOrdenIdFactura = [
  param('ordenId').isUUID().withMessage('El ordenId debe ser un UUID válido.'),
];

module.exports = { validarCrearFactura, validarIdFactura, validarOrdenIdFactura };