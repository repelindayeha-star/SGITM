const AppError = require('../utils/AppError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      exito: false,
      mensaje: err.message,
    });
  }

  // Error de validación única de Prisma (ej. placa/email duplicado)
  if (err.code === 'P2002') {
    return res.status(409).json({
      exito: false,
      mensaje: `Ya existe un registro con ese valor único: ${err.meta?.target}`,
    });
  }

  console.error('[ERROR NO CONTROLADO]', err);
  return res.status(500).json({
    exito: false,
    mensaje: 'Error interno del servidor.',
  });
}

module.exports = errorHandler;