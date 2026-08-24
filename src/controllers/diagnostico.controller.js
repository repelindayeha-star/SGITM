const diagnosticoService = require('../services/diagnostico.service');

async function crearDiagnostico(req, res, next) {
  try {
    const diagnostico = await diagnosticoService.crearDiagnostico(req.body);
    res.status(201).json({ exito: true, mensaje: 'Diagnóstico creado correctamente.', data: diagnostico });
  } catch (error) {
    next(error);
  }
}

async function obtenerPorOrdenId(req, res, next) {
  try {
    const diagnostico = await diagnosticoService.obtenerPorOrdenId(req.params.ordenId);
    res.status(200).json({ exito: true, data: diagnostico });
  } catch (error) {
    next(error);
  }
}

async function actualizarDiagnostico(req, res, next) {
  try {
    const diagnostico = await diagnosticoService.actualizarDiagnostico(req.params.id, req.body);
    res.status(200).json({ exito: true, mensaje: 'Diagnóstico actualizado.', data: diagnostico });
  } catch (error) {
    next(error);
  }
}

async function agregarItem(req, res, next) {
  try {
    const item = await diagnosticoService.agregarItem(req.body);
    res.status(201).json({ exito: true, mensaje: 'Ítem agregado a la cotización.', data: item });
  } catch (error) {
    next(error);
  }
}

async function eliminarItem(req, res, next) {
  try {
    await diagnosticoService.eliminarItem(req.params.id);
    res.status(200).json({ exito: true, mensaje: 'Ítem eliminado de la cotización.' });
  } catch (error) {
    next(error);
  }
}

async function calcularTotal(req, res, next) {
  try {
    const resumen = await diagnosticoService.calcularTotalCotizacion(req.params.id);
    res.status(200).json({ exito: true, data: resumen });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  crearDiagnostico,
  obtenerPorOrdenId,
  actualizarDiagnostico,
  agregarItem,
  eliminarItem,
  calcularTotal,
};