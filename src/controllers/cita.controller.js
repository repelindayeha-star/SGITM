const citaService = require('../services/cita.service');

async function crear(req, res, next) {
  try {
    const cita = await citaService.crear(req.body);
    res.status(201).json({ exito: true, mensaje: 'Cita creada correctamente.', data: cita });
  } catch (error) {
    next(error);
  }
}

async function listar(req, res, next) {
  try {
    const citas = await citaService.listar();
    res.status(200).json({ exito: true, data: citas });
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const cita = await citaService.obtenerPorId(req.params.id);
    res.status(200).json({ exito: true, data: cita });
  } catch (error) {
    next(error);
  }
}

async function listarPorCliente(req, res, next) {
  try {
    const citas = await citaService.listarPorCliente(req.params.clienteId);
    res.status(200).json({ exito: true, data: citas });
  } catch (error) {
    next(error);
  }
}

async function cambiarEstado(req, res, next) {
  try {
    const cita = await citaService.cambiarEstado(req.params.id, req.body.estado);
    res.status(200).json({ exito: true, mensaje: 'Estado de la cita actualizado.', data: cita });
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const cita = await citaService.actualizar(req.params.id, req.body);
    res.status(200).json({ exito: true, mensaje: 'Cita actualizada.', data: cita });
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    await citaService.eliminar(req.params.id);
    res.status(200).json({ exito: true, mensaje: 'Cita eliminada.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  crear,
  listar,
  obtenerPorId,
  listarPorCliente,
  cambiarEstado,
  actualizar,
  eliminar,
};