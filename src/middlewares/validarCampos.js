const { validationResult } = require('express-validator');

function validarCampos(req, res, next) {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      exito: false,
      mensaje: 'Datos inválidos.',
      errores: errores.array().map((e) => ({ campo: e.path, mensaje: e.msg })),
    });
  }
  next();
}

module.exports = validarCampos;