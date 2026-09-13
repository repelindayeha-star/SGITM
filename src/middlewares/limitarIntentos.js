const AppError = require('../utils/AppError');

/**
 * Limite de intentos por direccion IP, en memoria del proceso.
 *
 * Sin esto, pedir el enlace de recuperacion se puede repetir miles de veces:
 * sirve para inundar el buzon de otra persona y para averiguar, por el tiempo
 * que tarda cada respuesta, que correos existen.
 *
 * LIMITACION CONOCIDA (deuda DT-03): el conteo vive en la memoria de este
 * proceso. Con dos instancias detras de un balanceador, cada una llevaria su
 * propia cuenta y el limite real seria el doble. Para el alcance del proyecto
 * -una sola instancia- es suficiente; la solucion sera llevarlo a Redis.
 */
function limitarIntentos({ maximo = 5, ventanaMinutos = 15, mensaje } = {}) {
  const registros = new Map();
  const ventanaMs = ventanaMinutos * 60 * 1000;

  // Barrido periodico para que el mapa no crezca sin fin. unref() evita que
  // este temporizador mantenga vivo el proceso al cerrar el servidor.
  const limpieza = setInterval(() => {
    const ahora = Date.now();
    for (const [clave, datos] of registros) {
      if (ahora > datos.reinicioEn) registros.delete(clave);
    }
  }, ventanaMs);
  if (typeof limpieza.unref === 'function') limpieza.unref();

  return function (req, res, next) {
    const clave = req.ip || req.connection?.remoteAddress || 'desconocida';
    const ahora = Date.now();
    const datos = registros.get(clave);

    if (!datos || ahora > datos.reinicioEn) {
      registros.set(clave, { intentos: 1, reinicioEn: ahora + ventanaMs });
      return next();
    }

    datos.intentos += 1;

    if (datos.intentos > maximo) {
      const segundos = Math.ceil((datos.reinicioEn - ahora) / 1000);
      res.set('Retry-After', String(segundos));
      return next(
        new AppError(
          mensaje || `Demasiados intentos. Vuelve a intentarlo en ${Math.ceil(segundos / 60)} minutos.`,
          429
        )
      );
    }

    return next();
  };
}

module.exports = limitarIntentos;
