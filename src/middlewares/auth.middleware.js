const { verificarToken } = require('../utils/jwt');
const usuarioRepository = require('../repositories/usuario.repository');
const AppError = require('../utils/AppError');

/**
 * Comprueba que quien hace la peticion es quien dice ser.
 *
 * No basta con que la firma del token sea correcta. Un JWT es valido hasta que
 * caduca, y eso abre dos huecos que aqui se cierran consultando al usuario:
 *
 *   1. Cambiar la contrasena no cerraba las sesiones abiertas. Si a alguien le
 *      robaban la cuenta, cambiar la clave no servia de nada: el token del
 *      intruso seguia funcionando hasta ocho horas. Ahora se compara el
 *      momento en que se firmo el token (iat) con la fecha del ultimo cambio
 *      de contrasena, y el anterior deja de valer. (hallazgo SEG-04)
 *
 *   2. Desactivar una cuenta tampoco la echaba fuera en el acto.
 *
 * El precio es una consulta por peticion. Para el tamano del sistema es un
 * cambio que no se nota, y a cambio "cerrar sesion en todas partes" pasa a ser
 * verdad en vez de una promesa.
 */
async function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No se proporcionó un token de autenticación.', 401));
  }

  const token = authHeader.split(' ')[1];

  let payload;
  try {
    payload = verificarToken(token);
  } catch (error) {
    return next(new AppError('Token inválido o expirado.', 401));
  }

  try {
    const usuario = await usuarioRepository.buscarParaAutenticar(payload.id);

    if (!usuario) {
      return next(new AppError('La cuenta ya no existe.', 401));
    }
    if (!usuario.activo) {
      return next(new AppError('Esta cuenta está inactiva. Contacta al administrador.', 403));
    }

    // 'iat' viene en segundos; la fecha del cambio, en milisegundos.
    const emitidoEn = payload.iat * 1000;
    const cambiadaEn = usuario.passwordCambiadaEn ? new Date(usuario.passwordCambiadaEn).getTime() : 0;

    // El margen de un segundo evita que el token recien emitido tras un cambio
    // de contrasena se invalide a si mismo por redondeo de 'iat'.
    if (cambiadaEn - 1000 > emitidoEn) {
      return next(new AppError('La contraseña cambió. Inicia sesión de nuevo.', 401));
    }

    // Se usa lo que dice la base, no lo que dice el token: si a alguien le
    // cambiaron el rol, el token viejo no le conserva el anterior.
    req.usuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = autenticar;
