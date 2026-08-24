const { body, param } = require('express-validator');

const validarCrearDiagnostico = [
  body('ordenId')
    .notEmpty().withMessage('El ordenId es obligatorio.')
    .isUUID().withMessage('El ordenId debe ser un UUID válido.'),

  body('descripcion')
    .trim()
    .notEmpty().withMessage('La descripción es obligatoria.')
    .isLength({ min: 5 }).withMessage('La descripción debe tener al menos 5 caracteres.'),

  body('manoObra')
    .notEmpty().withMessage('El valor de mano de obra es obligatorio.')
    .isFloat({ min: 0 }).withMessage('La mano de obra debe ser un número mayor o igual a 0.'),
];

const validarActualizarDiagnostico = [
  param('id').isUUID().withMessage('El id debe ser un UUID válido.'),
  body('descripcion').optional().trim(),
  body('manoObra').optional().isFloat({ min: 0 }).withMessage('La mano de obra debe ser válida.'),
];

const validarAgregarItem = [
  body('diagnosticoId')
    .notEmpty().withMessage('El diagnosticoId es obligatorio.')
    .isUUID().withMessage('El diagnosticoId debe ser un UUID válido.'),

  body('repuestoId')
    .optional()
    .isUUID().withMessage('El repuestoId debe ser un UUID válido.'),

  body('descripcion')
    .trim()
    .notEmpty().withMessage('La descripción del ítem es obligatoria.'),

  body('cantidad')
    .notEmpty().withMessage('La cantidad es obligatoria.')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser un entero mayor a 0.'),

  body('precioUnitario')
    .notEmpty().withMessage('El precio unitario es obligatorio.')
    .isFloat({ min: 0 }).withMessage('El precio unitario debe ser mayor o igual a 0.'),
];

const validarIdDiagnostico = [
  param('id').isUUID().withMessage('El id debe ser un UUID válido.'),
];

const validarOrdenId = [
  param('ordenId').isUUID().withMessage('El ordenId debe ser un UUID válido.'),
];

const validarIdItem = [
  param('id').isUUID().withMessage('El id debe ser un UUID válido.'),
];

module.exports = {
  validarCrearDiagnostico,
  validarActualizarDiagnostico,
  validarAgregarItem,
  validarIdDiagnostico,
  validarOrdenId,
  validarIdItem,
};