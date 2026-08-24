const authService = require('../services/auth.service');
const captchaService = require('../services/captcha.service');

async function registrar(req, res, next) {
  try {
    const { nombre, email, password, rol, captchaToken } = req.body;

    await captchaService.verificarCaptcha(captchaToken);

    const usuario = await authService.registrar({ nombre, email, password, rol });

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

module.exports = { registrar, login };