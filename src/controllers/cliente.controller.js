const clienteService = require('../services/cliente.service');
const activacionService = require('../services/activacion.service');

async function crear(req, res, next) {
  try {
    const { nombre, email, telefono, direccion } = req.body;
    const { cliente, correoEnviado } = await activacionService.crearClienteDesdeRecepcion({
      nombre,
      email,
      telefono,
      direccion,
    });

    // Se le dice a la recepcionista si el correo salio o no. Si no salio, el
    // cliente igual quedo registrado y ella puede reenviar el codigo: no se
    // pierde el trabajo por un fallo del proveedor de correo.
    res.status(201).json({
      exito: true,
      mensaje: correoEnviado
        ? 'Cliente registrado. Le enviamos un codigo a su correo para que active su cuenta.'
        : 'Cliente registrado, pero el correo no se pudo enviar. Reenvia el codigo mas tarde.',
      data: cliente,
    });
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

// El Cliente autenticado consulta su propio perfil, usando el id de usuario
// que viene decodificado del JWT (req.usuario.id), no un parametro de la URL.
async function obtenerMiPerfil(req, res, next) {
  try {
    const cliente = await clienteService.obtenerPorUsuarioId(req.usuario.id);
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

module.exports = { crear, listar, obtenerPorId, obtenerMiPerfil, actualizar };