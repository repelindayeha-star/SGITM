const { Router } = require('express');
const usuarioController = require('../controllers/usuario.controller');
const validarCampos = require('../middlewares/validarCampos');
const autenticar = require('../middlewares/auth.middleware');
const autorizarRoles = require('../middlewares/roles.middleware');
const {
  validarListarUsuarios,
  validarCrearUsuario,
  validarActualizarUsuario,
  validarCambiarActivo,
  validarIdUsuario,
} = require('../validators/usuario.validator');

const router = Router();

router.use(autenticar);

// La recepcionista tambien lista, porque necesita ver los mecanicos para
// asignarlos a una orden. Todo lo demas es exclusivo del administrador:
// crear personal y cambiar roles es gobierno del sistema, no operacion.
router.get(
  '/',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA'),
  validarListarUsuarios,
  validarCampos,
  usuarioController.listar
);

router.get(
  '/:id',
  autorizarRoles('ADMINISTRADOR'),
  validarIdUsuario,
  validarCampos,
  usuarioController.obtenerPorId
);

router.post(
  '/',
  autorizarRoles('ADMINISTRADOR'),
  validarCrearUsuario,
  validarCampos,
  usuarioController.crear
);

router.put(
  '/:id',
  autorizarRoles('ADMINISTRADOR'),
  validarActualizarUsuario,
  validarCampos,
  usuarioController.actualizar
);

// No hay DELETE a proposito: se desactiva, nunca se borra. Un usuario
// eliminado se llevaria por delante el historial de las ordenes que movio.
router.patch(
  '/:id/activo',
  autorizarRoles('ADMINISTRADOR'),
  validarCambiarActivo,
  validarCampos,
  usuarioController.cambiarActivo
);

module.exports = router;
