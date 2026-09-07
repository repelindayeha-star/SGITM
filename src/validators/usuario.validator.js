const { body, param, query } = require('express-validator');

const ROLES_STAFF = ['ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'];
const ROLES_TODOS = [...ROLES_STAFF, 'CLIENTE'];

const validarListarUsuarios = [
  query('rol').optional().isIn(ROLES_TODOS).withMessage('Rol inválido.'),
  query('activo').optional().isBoolean().withMessage('El filtro activo debe ser true o false.'),
];

const validarCrearUsuario = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres.'),

  body('email')
    .trim()
    .notEmpty().withMessage('El correo es obligatorio.')
    .isEmail().withMessage('El correo no tiene un formato válido.')
    .normalizeEmail({ gmail_remove_dots: false }),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria.')
    .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),

  body('rol')
    .notEmpty().withMessage('El rol es obligatorio.')
    .isIn(ROLES_STAFF)
    .withMessage(`El rol debe ser uno de: ${ROLES_STAFF.join(', ')}`),
];

const validarActualizarUsuario = [
  param('id').isUUID().withMessage('El id debe ser un UUID válido.'),
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres.'),
  body('rol')
    .optional()
    .isIn(ROLES_STAFF)
    .withMessage(`El rol debe ser uno de: ${ROLES_STAFF.join(', ')}`),
];

const validarCambiarActivo = [
  param('id').isUUID().withMessage('El id debe ser un UUID válido.'),
  body('activo')
    .exists().withMessage('El campo activo es obligatorio.')
    .isBoolean().withMessage('El campo activo debe ser true o false.')
    .toBoolean(),
];

const validarIdUsuario = [
  param('id').isUUID().withMessage('El id debe ser un UUID válido.'),
];

module.exports = {
  validarListarUsuarios,
  validarCrearUsuario,
  validarActualizarUsuario,
  validarCambiarActivo,
  validarIdUsuario,
};
