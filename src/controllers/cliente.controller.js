const clienteService = require('../services/cliente.service');

async function crear(req, res, next) {
  try {
    const cliente = await clienteService.crear(req.body);
    res.status(201).json({ exito: true, mensaje: 'Cliente creado correctamente.', data: cliente });
  } catch (error) {
    next(error);
  }
}

async function listar(req, res, next) {
  try {
    const clientes = await clienteService.listar();
    res.status(200).json({ exito: true, data: clientes });
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const cliente = await clienteService.obtenerPorId(req.params.id);
    res.status(200).json({ exito: true, data: cliente });
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const cliente = await clienteService.actualizar(req.params.id, req.body);
    res.status(200).json({ exito: true, mensaje: 'Cliente actualizado.', data: cliente });
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    await clienteService.eliminar(req.params.id);
    res.status(200).json({ exito: true, mensaje: 'Cliente eliminado.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { crear, listar, obtenerPorId, actualizar, eliminar };