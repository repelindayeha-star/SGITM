const usuarioService = require('../services/usuario.service');

async function listar(req, res, next) {
  try {
    // ?activo=true|false llega como texto; sin el parametro, no se filtra.
    const activo = req.query.activo === undefined ? undefined : req.query.activo === 'true';

    const usuarios = await usuarioService.listar({ rol: req.query.rol, activo });
    res.status(200).json({ exito: true, data: usuarios });
  } catch (error) {
    next(error);
  }
}

async function obtenerPorId(req, res, next) {
  try {
    const usuario = await usuarioService.obtenerPorId(req.params.id);
    res.status(200).json({ exito: true, data: usuario });
  } catch (error) {
    next(error);
  }
}

async function crear(req, res, next) {
  try {
    const { nombre, email, password, rol } = req.body;
    const usuario = await usuarioService.crear({ nombre, email, password, rol });
    res.status(201).json({
      exito: true,
      mensaje: 'Usuario creado correctamente.',
      data: usuario,
    });
  } catch (error) {
    next(error);
  }
}

async function actualizar(req, res, next) {
  try {
    const { nombre, rol } = req.body;
    const usuario = await usuarioService.actualizar(req.params.id, { nombre, rol });
    res.status(200).json({ exito: true, mensaje: 'Usuario actualizado.', data: usuario });
  } catch (error) {
    next(error);
  }
}

async function cambiarActivo(req, res, next) {
  try {
    // El id de quien solicita evita que alguien se desactive a si mismo.
    const usuario = await usuarioService.cambiarActivo(
      req.params.id,
      req.body.activo,
      req.usuario.id
    );
    res.status(200).json({
      exito: true,
      mensaje: usuario.activo ? 'Usuario activado.' : 'Usuario desactivado.',
      data: usuario,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { listar, obtenerPorId, crear, actualizar, cambiarActivo };
