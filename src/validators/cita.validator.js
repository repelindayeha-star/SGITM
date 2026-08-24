const { body, param } = require('express-validator');

const validarCrearCita = [
  body('clienteId')
    .notEmpty().withMessage('El clienteId es obligatorio.')
    .isUUID().withMessage('El clienteId debe ser un UUID válido.'),

  body('motocicletaId')
    .notEmpty().withMessage('El motocicletaId es obligatorio.')
    .isUUID().withMessage('El motocicletaId debe ser un UUID válido.'),

  body('fechaHora')
    .notEmpty().withMessage('La fecha y hora son obligatorias.')
    .isISO8601().withMessage('La fecha debe tener formato ISO 8601 (ej. 2026-09-01T14:00:00).'),

  body('motivo')
    .trim()
    .notEmpty().withMessage('El motivo es obligatorio.')
    .isLength({ min: 3 }).withMessage('El motivo debe tener al menos 3 caracteres.'),
];

const validarActualizarCita = [
  param('id').isUUID().withMessage('El id debe ser un UUID válido.'),
  body('fechaHora')
    .optional()
    .isISO8601().withMessage('La fecha debe tener formato ISO 8601.'),
  body('motivo').optional().trim(),
];

const validarCambiarEstadoCita = [
  param('id').isUUID().withMessage('El id debe ser un UUID válido.'),
  body('estado')
    .notEmpty().withMessage('El estado es obligatorio.')
    .isIn(['PROGRAMADA', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'])
    .withMessage('Estado inválido.'),
];

const validarIdCita = [
  param('id').isUUID().withMessage('El id debe ser un UUID válido.'),
];

module.exports = {
  validarCrearCita,
  validarActualizarCita,
  validarCambiarEstadoCita,
  validarIdCita,
};