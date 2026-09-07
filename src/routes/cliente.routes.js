const { Router } = require('express');
const clienteController = require('../controllers/cliente.controller');
const validarCampos = require('../middlewares/validarCampos');
const autenticar = require('../middlewares/auth.middleware');
const autorizarRoles = require('../middlewares/roles.middleware');
const {
  soloPropioSiCliente,
  duenoDesdeParametro,
} = require('../middlewares/propiedad.middleware');
const {
  validarCrearCliente,
  validarActualizarCliente,
  validarIdCliente,
} = require('../validators/cliente.validator');

const router = Router();

// Todas las rutas de clientes requieren estar autenticado.
router.use(autenticar);

// El Cliente consulta su propio perfil (debe ir ANTES de '/:id' para que
// Express no interprete "me" como si fuera un id).
router.get(
  '/me',
  autorizarRoles('CLIENTE'),
  clienteController.obtenerMiPerfil
);

router.post(
  '/',
  autorizarRoles('RECEPCIONISTA'),
  validarCrearCliente,
  validarCampos,
  clienteController.crear
);

router.get(
  '/',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'),
  clienteController.listar
);

// Aqui el dueno del recurso es el propio :id, porque es un perfil de cliente.
// Sin esta comprobacion, un cliente podia leer el telefono y la direccion de
// cualquier otro con solo cambiar el UUID.
router.get(
  '/:id',
  validarIdCliente,
  validarCampos,
  soloPropioSiCliente(duenoDesdeParametro('id')),
  clienteController.obtenerPorId
);

router.put(
  '/:id',
  autorizarRoles('RECEPCIONISTA'),
  validarActualizarCliente,
  validarCampos,
  clienteController.actualizar
);

module.exports = router;
