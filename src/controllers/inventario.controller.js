const inventarioService = require('../services/inventario.service');

async function crearRepuesto(req, res, next) {
  try {
    const repuesto = await inventarioService.crearRepuesto(req.body);
    res.status(201).json({ exito: true, mensaje: 'Repuesto creado correctamente.', data: repuesto });
  } catch (error) {
    next(error);
  }
}

async function listarRepuestos(req, res, next) {
  try {
    const repuestos = await inventarioService.listarRepuestos();
    res.status(200).json({ exito: true, data: repuestos });
  } catch (error) {
    next(error);
  }
}

async function obtenerRepuestoPorId(req, res, next) {
  try {
    const repuesto = await inventarioService.obtenerRepuestoPorId(req.params.id);
    res.status(200).json({ exito: true, data: repuesto });
  } catch (error) {
    next(error);
  }
}

async function listarStockBajo(req, res, next) {
  try {
    const repuestos = await inventarioService.listarStockBajo();
    res.status(200).json({ exito: true, data: repuestos });
  } catch (error) {
    next(error);
  }
}

async function actualizarRepuesto(req, res, next) {
  try {
    const repuesto = await inventarioService.actualizarRepuesto(req.params.id, req.body);
    res.status(200).json({ exito: true, mensaje: 'Repuesto actualizado.', data: repuesto });
  } catch (error) {
    next(error);
  }
}

async function eliminarRepuesto(req, res, next) {
  try {
    await inventarioService.eliminarRepuesto(req.params.id);
    res.status(200).json({ exito: true, mensaje: 'Repuesto eliminado.' });
  } catch (error) {
    next(error);
  }
}

async function registrarMovimiento(req, res, next) {
  try {
    const movimiento = await inventarioService.registrarMovimiento(req.body);
    res.status(201).json({ exito: true, mensaje: 'Movimiento registrado correctamente.', data: movimiento });
  } catch (error) {
    next(error);
  }
}

async function listarMovimientos(req, res, next) {
  try {
    const movimientos = await inventarioService.listarMovimientos();
    res.status(200).json({ exito: true, data: movimientos });
  } catch (error) {
    next(error);
  }
}

async function listarMovimientosPorRepuesto(req, res, next) {
  try {
    const movimientos = await inventarioService.listarMovimientosPorRepuesto(req.params.id);
    res.status(200).json({ exito: true, data: movimientos });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  crearRepuesto,
  listarRepuestos,
  obtenerRepuestoPorId,
  listarStockBajo,
  actualizarRepuesto,
  eliminarRepuesto,
  registrarMovimiento,
  listarMovimientos,
  listarMovimientosPorRepuesto,
};