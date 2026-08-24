const { body, param } = require('express-validator');

const validarCrearOrden = [
  body('clienteId')
    .notEmpty().withMessage('El clienteId es obligatorio.')
    .isUUID().withMessage('El clienteId debe ser un UUID válido.'),

  body('motocicletaId')
    .notEmpty().withMessage('El motocicletaId es obligatorio.')
    .isUUID().withMessage('El motocicletaId debe ser un UUID válido.'),

  body('descripcionProblema')
    .trim()
    .notEmpty().withMessage('La descripción del problema es obligatoria.')
    .isLength({ min: 5 }).withMessage('La descripción debe tener al menos 5 caracteres.'),
];

const validarAsignarMecanico = [
  param('id').isUUID().withMessage('El id debe ser un UUID válido.'),
  body('mecanicoId')
    .notEmpty().withMessage('El mecanicoId es obligatorio.')
    .isUUID().withMessage('El mecanicoId debe ser un UUID válido.'),
];

const validarCambiarEstadoOrden = [
  param('id').isUUID().withMessage('El id debe ser un UUID válido.'),
  body('estado')
    .notEmpty().withMessage('El estado es obligatorio.')
    .isIn([
      'RECIBIDA',
      'EN_DIAGNOSTICO',
      'EN_COTIZACION',
      'APROBADA',
      'EN_REPARACION',
      'LISTA',
      'ENTREGADA',
      'CANCELADA',
    ])
    .withMessage('Estado inválido.'),
];

const validarActualizarOrden = [
  param('id').isUUID().withMessage('El id debe ser un UUID válido.'),
  body('observaciones').optional().trim(),
];

const validarIdOrden = [
  param('id').isUUID().withMessage('El id debe ser un UUID válido.'),
];

const validarCodigoOrden = [
  param('codigo').trim().notEmpty().withMessage('El código es obligatorio.'),
];

module.exports = {
  validarCrearOrden,
  validarAsignarMecanico,
  validarCambiarEstadoOrden,
  validarActualizarOrden,
  validarIdOrden,
  validarCodigoOrden,
};