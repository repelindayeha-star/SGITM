const authService = require('../services/auth.service');
const captchaService = require('../services/captcha.service');
const recuperacionService = require('../services/recuperacion.service');

async function registrar(req, res, next) {
  try {
    // 'rol' no se lee del cuerpo a proposito: este endpoint es publico y
    // solo crea clientes. Las cuentas de personal se crearan desde el
    // modulo de usuarios, que exige estar autenticado como ADMINISTRADOR.
    const { nombre, email, password, captchaToken } = req.body;

    await captchaService.verificarCaptcha(captchaToken);

    const usuario = await authService.registrar({ nombre, email, password });

    // El correo de confirmacion no bloquea la respuesta: la cuenta ya existe
    // aunque el servidor de correo este caido.
    recuperacionService.enviarVerificacionEmail(usuario).catch(() => {});

    res.status(201).json({
      exito: true,
      mensaje: 'Usuario registrado correctamente.',
      data: usuario,
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password, captchaToken } = req.body;

    await captchaService.verificarCaptcha(captchaToken);

    const { usuario, token } = await authService.login({ email, password });

    res.status(200).json({
      exito: true,
      mensaje: 'Inicio de sesión exitoso.',
      data: { usuario, token },
    });
  } catch (error) {
    next(error);
  }
}

async function solicitarRecuperacion(req, res, next) {
  try {
    const resultado = await recuperacionService.solicitarRecuperacion(req.body.email);
    // Siempre 200 y siempre el mismo texto, exista o no la cuenta.
    res.status(200).json({ exito: true, mensaje: resultado.mensaje });
  } catch (error) {
    next(error);
  }
}

async function comprobarTokenRecuperacion(req, res, next) {
  try {
    await recuperacionService.validarToken(req.params.token, 'RECUPERACION_PASSWORD');
    res.status(200).json({ exito: true, mensaje: 'El enlace es valido.' });
  } catch (error) {
    next(error);
  }
}

async function restablecerPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    const resultado = await recuperacionService.restablecerPassword({ token, password });
    res.status(200).json({ exito: true, mensaje: resultado.mensaje });
  } catch (error) {
    next(error);
  }
}

async function verificarEmail(req, res, next) {
  try {
    const resultado = await recuperacionService.verificarEmail(req.params.token);
    res.status(200).json({ exito: true, mensaje: resultado.mensaje });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registrar,
  login,
  solicitarRecuperacion,
  comprobarTokenRecuperacion,
  restablecerPassword,
  verificarEmail,
};
