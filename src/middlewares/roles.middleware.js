const AppError = require('../utils/AppError');

/**
 * Middleware factory: recibe los roles permitidos y devuelve
 * un middleware que verifica que req.usuario.rol esté entre ellos.
 * Debe usarse siempre DESPUÉS del middleware `autenticar`.
 *
 * Ejemplo de uso: autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA')
 */
function autorizarRoles(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.usuario) {
      return next(new AppError('No autenticado.', 401));
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return next(new AppError('No tienes permisos para realizar esta acción.', 403));
    }

    next();
  };
}

module.exports = autorizarRoles;