const { Router } = require('express');
const clienteController = require('../controllers/cliente.controller');
const validarCampos = require('../middlewares/validarCampos');
const autenticar = require('../middlewares/auth.middleware');
const autorizarRoles = require('../middlewares/roles.middleware');
const {
  validarCrearCliente,
  validarActualizarCliente,
  validarIdCliente,
} = require('../validators/cliente.validator');

const router = Router();

// Todas las rutas de clientes requieren estar autenticado.
router.use(autenticar);

router.post(
  '/',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA'),
  validarCrearCliente,
  validarCampos,
  clienteController.crear
);

router.get(
  '/',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'),
  clienteController.listar
);

router.get(
  '/:id',
  validarIdCliente,
  validarCampos,
  clienteController.obtenerPorId
);

router.put(
  '/:id',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA'),
  validarActualizarCliente,
  validarCampos,
  clienteController.actualizar
);

router.delete(
  '/:id',
  autorizarRoles('ADMINISTRADOR'),
  validarIdCliente,
  validarCampos,
  clienteController.eliminar
);

module.exports = router;