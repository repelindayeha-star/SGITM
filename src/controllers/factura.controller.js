const facturaService = require('../services/factura.service');

async function crear(req, res, next) {
  try {
    const factura = await facturaService.crear(req.body);
    res.status(201).json({ exito: true, mensaje: 'Factura generada correctamente.', data: factura });
  } catch (error) {
    next(error);
  }
}

async function obtenerPorOrdenId(req, res, next) {
  try {
    const factura = await facturaService.obtenerPorOrdenId(req.params.ordenId);
    res.status(200).json({ exito: true, data: factura });
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const factura = await facturaService.obtenerPorId(req.params.id);
    res.status(200).json({ exito: true, data: factura });
  } catch (error) {
    next(error);
  }
}

async function listar(req, res, next) {
  try {
    const facturas = await facturaService.listar();
    res.status(200).json({ exito: true, data: facturas });
  } catch (error) {
    next(error);
  }
}

module.exports = { crear, obtenerPorOrdenId, obtenerPorId, listar };