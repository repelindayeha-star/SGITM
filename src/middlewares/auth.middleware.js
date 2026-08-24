const { verificarToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No se proporcionó un token de autenticación.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verificarToken(token);
    // Adjuntamos el usuario decodificado a la petición
    // para que los controllers/servicios sepan quién hace la solicitud.
    req.usuario = payload;
    next();
  } catch (error) {
    return next(new AppError('Token inválido o expirado.', 401));
  }
}

module.exports = autenticar;