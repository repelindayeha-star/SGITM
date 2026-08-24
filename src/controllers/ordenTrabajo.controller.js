const ordenService = require('../services/ordenTrabajo.service');

async function crear(req, res, next) {
  try {
    const orden = await ordenService.crear(req.body);
    res.status(201).json({ exito: true, mensaje: 'Orden de trabajo creada correctamente.', data: orden });
  } catch (error) {
    next(error);
  }
}

async function listar(req, res, next) {
  try {
    const ordenes = await ordenService.listar();
    res.status(200).json({ exito: true, data: ordenes });
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const orden = await ordenService.obtenerPorId(req.params.id);
    res.status(200).json({ exito: true, data: orden });
  } catch (error) {
    next(error);
  }
}

// Ruta pública: consulta de estado por código (sin autenticación).
async function obtenerPorCodigo(req, res, next) {
  try {
    const orden = await ordenService.obtenerPorCodigo(req.params.codigo);
    res.status(200).json({ exito: true, data: orden });
  } catch (error) {
    next(error);
  }
}

async function listarPorCliente(req, res, next) {
  try {
    const ordenes = await ordenService.listarPorCliente(req.params.clienteId);
    res.status(200).json({ exito: true, data: ordenes });
  } catch (error) {
    next(error);
  }
}

async function listarPorMecanico(req, res, next) {
  try {
    const ordenes = await ordenService.listarPorMecanico(req.params.mecanicoId);
    res.status(200).json({ exito: true, data: ordenes });
  } catch (error) {
    next(error);
  }
}

async function asignarMecanico(req, res, next) {
  try {
    const orden = await ordenService.asignarMecanico(req.params.id, req.body.mecanicoId);
    res.status(200).json({ exito: true, mensaje: 'Mecánico asignado correctamente.', data: orden });
  } catch (error) {
    next(error);
  }
}

async function cambiarEstado(req, res, next) {
  try {
    const orden = await ordenService.cambiarEstado(req.params.id, req.body.estado);
    res.status(200).json({ exito: true, mensaje: 'Estado de la orden actualizado.', data: orden });
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const orden = await ordenService.actualizar(req.params.id, req.body);
    res.status(200).json({ exito: true, mensaje: 'Orden actualizada.', data: orden });
  } catch (error) {
    next(error);
  }
}

async function eliminar(req, res, next) {
  try {
    await ordenService.eliminar(req.params.id);
    res.status(200).json({ exito: true, mensaje: 'Orden eliminada.' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  crear,
  listar,
  obtenerPorId,
  obtenerPorCodigo,
  listarPorCliente,
  listarPorMecanico,
  asignarMecanico,
  cambiarEstado,
  actualizar,
  eliminar,
};