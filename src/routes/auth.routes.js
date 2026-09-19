const { Router } = require('express');
const authController = require('../controllers/auth.controller');
const validarCampos = require('../middlewares/validarCampos');
const autenticar = require('../middlewares/auth.middleware');
const limitarIntentos = require('../middlewares/limitarIntentos');
const {
  validarRegistro,
  validarLogin,
  validarSolicitudRecuperacion,
  validarRestablecer,
  validarSolicitudCodigo,
  validarConfirmarCodigo,
} = require('../validators/auth.validator');

const router = Router();

// Las rutas de abajo son publicas y tocan credenciales o envian correos.
// Sin freno, cada una sirve para algo distinto: probar contrasenas a ciegas,
// inundar el buzon de otra persona, o adivinar tokens a fuerza bruta.
const frenoLogin = limitarIntentos({
  maximo: 10,
  ventanaMinutos: 15,
  mensaje: 'Demasiados intentos de inicio de sesion. Espera unos minutos.',
});

// Cada llamada a limitarIntentos() lleva su propio contador. Es a proposito:
// si todas las rutas compartieran uno, comprobar un enlace y equivocarse dos
// veces al teclear la contrasena nueva agotaria el cupo de envios, y la
// persona quedaria bloqueada en mitad de su propia recuperacion.
//
// El cupo estrecho se reserva para lo que cuesta caro: mandar correos.
const frenoEnvioCorreo = limitarIntentos({
  maximo: 5,
  ventanaMinutos: 15,
  mensaje: 'Demasiadas solicitudes. Revisa tu correo y espera unos minutos.',
});

const frenoRegistro = limitarIntentos({
  maximo: 5,
  ventanaMinutos: 15,
  mensaje: 'Demasiados registros seguidos. Espera unos minutos.',
});

// Comprobar un enlace no envia nada ni revela nada: el cupo es holgado y solo
// esta para que nadie pruebe tokens al azar en masa.
const frenoComprobacion = limitarIntentos({
  maximo: 40,
  ventanaMinutos: 15,
  mensaje: 'Demasiadas comprobaciones. Espera unos minutos.',
});

// Margen para equivocarse tecleando la contrasena nueva.
const frenoRestablecer = limitarIntentos({
  maximo: 15,
  ventanaMinutos: 15,
  mensaje: 'Demasiados intentos. Solicita un enlace nuevo en unos minutos.',
});

router.post('/registro', frenoRegistro, validarRegistro, validarCampos, authController.registrar);
router.post('/login', frenoLogin, validarLogin, validarCampos, authController.login);

// Recuperacion de contrasena, en tres tiempos:
//   1. se pide el enlace,
//   2. la pantalla comprueba que el enlace sigue vivo antes de pedir nada,
//   3. se envia la contrasena nueva y el token se gasta.
router.post(
  '/recuperar-password',
  frenoEnvioCorreo,
  validarSolicitudRecuperacion,
  validarCampos,
  authController.solicitarRecuperacion
);
router.get(
  '/recuperar-password/:token',
  frenoComprobacion,
  authController.comprobarTokenRecuperacion
);
router.post(
  '/restablecer-password',
  frenoRestablecer,
  validarRestablecer,
  validarCampos,
  authController.restablecerPassword
);

router.get('/verificar-correo/:token', frenoComprobacion, authController.verificarEmail);

// Codigos de seis digitos.
//
// Pedir un codigo manda un correo: va con el freno estrecho, el mismo que
// protege de usar el sistema para inundar el buzon de otra persona.
//
// Confirmar un codigo NO manda nada, asi que lleva el freno holgado, con
// margen para que alguien se equivoque tecleando. La defensa de verdad
// contra la fuerza bruta no es este freno sino el contador de intentos que
// vive en la propia fila del codigo: ese sigue contando aunque el servidor
// corra repartido en varias instancias, donde un contador en memoria no
// serviria de nada.
router.post(
  '/activar/solicitar',
  frenoEnvioCorreo,
  validarSolicitudCodigo,
  validarCampos,
  authController.solicitarCodigoActivacion
);
router.post(
  '/activar/confirmar',
  frenoRestablecer,
  validarConfirmarCodigo,
  validarCampos,
  authController.confirmarActivacion
);
router.post(
  '/recuperar-codigo/solicitar',
  frenoEnvioCorreo,
  validarSolicitudCodigo,
  validarCampos,
  authController.solicitarCodigoRecuperacion
);
router.post(
  '/recuperar-codigo/confirmar',
  frenoRestablecer,
  validarConfirmarCodigo,
  validarCampos,
  authController.confirmarRecuperacion
);

// Ruta protegida: requiere un token JWT válido en el header Authorization.
router.get('/perfil', autenticar, (req, res) => {
  res.json({ exito: true, data: req.usuario });
});

module.exports = router;
