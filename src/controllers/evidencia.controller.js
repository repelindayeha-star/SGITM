const evidenciaService = require('../services/evidencia.service');

async function listar(req, res, next) {
  try {
    const evidencias = await evidenciaService.listar(req.params.id);
    res.json({ exito: true, data: evidencias });
  } catch (error) {
    next(error);
  }
}

async function agregar(req, res, next) {
  try {
    const evidencia = await evidenciaService.agregar({
      ordenId: req.params.id,
      archivo: req.file,
      momento: req.body.momento,
      descripcion: req.body.descripcion,
      usuarioId: req.usuario.id,
    });
    res.status(201).json({
      exito: true,
      mensaje: 'Evidencia agregada a la orden.',
      data: evidencia,
    });
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    const resultado = await evidenciaService.eliminar(req.params.evidenciaId);
    res.json({ exito: true, mensaje: resultado.mensaje });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, agregar, eliminar };
