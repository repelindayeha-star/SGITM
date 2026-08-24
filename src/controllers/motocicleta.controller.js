const motocicletaService = require('../services/motocicleta.service');

async function crear(req, res, next) {
  try {
    const moto = await motocicletaService.crear(req.body);
    res.status(201).json({ exito: true, mensaje: 'Motocicleta creada correctamente.', data: moto });
  } catch (error) {
    next(error);
  }
}

async function listar(req, res, next) {
  try {
    const motos = await motocicletaService.listar();
    res.status(200).json({ exito: true, data: motos });
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const moto = await motocicletaService.obtenerPorId(req.params.id);
    res.status(200).json({ exito: true, data: moto });
  } catch (error) {
    next(error);
  }
}

async function listarPorCliente(req, res, next) {
  try {
    const motos = await motocicletaService.listarPorCliente(req.params.clienteId);
    res.status(200).json({ exito: true, data: motos });
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const moto = await motocicletaService.actualizar(req.params.id, req.body);
    res.status(200).json({ exito: true, mensaje: 'Motocicleta actualizada.', data: moto });
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    await motocicletaService.eliminar(req.params.id);
    res.status(200).json({ exito: true, mensaje: 'Motocicleta eliminada.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { crear, listar, obtenerPorId, listarPorCliente, actualizar, eliminar };