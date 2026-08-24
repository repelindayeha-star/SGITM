const { Router } = require('express');
const ordenController = require('../controllers/ordenTrabajo.controller');
const validarCampos = require('../middlewares/validarCampos');
const autenticar = require('../middlewares/auth.middleware');
const autorizarRoles = require('../middlewares/roles.middleware');
const {
  validarCrearOrden,
  validarAsignarMecanico,
  validarCambiarEstadoOrden,
  validarActualizarOrden,
  validarIdOrden,
  validarCodigoOrden,
} = require('../validators/ordenTrabajo.validator');

const router = Router();

// Ruta pública para seguimiento por código/QR: va ANTES del middleware de autenticación.
router.get('/seguimiento/:codigo', validarCodigoOrden, validarCampos, ordenController.obtenerPorCodigo);

router.use(autenticar);

router.post(
  '/',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA'),
  validarCrearOrden,
  validarCampos,
  ordenController.crear
);

router.get(
  '/',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'),
  ordenController.listar
);

router.get('/:id', validarIdOrden, validarCampos, ordenController.obtenerPorId);

router.get('/cliente/:clienteId', ordenController.listarPorCliente);

router.get(
  '/mecanico/:mecanicoId',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'),
  ordenController.listarPorMecanico
);

router.patch(
  '/:id/mecanico',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA'),
  validarAsignarMecanico,
  validarCampos,
  ordenController.asignarMecanico
);

router.patch(
  '/:id/estado',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'),
  validarCambiarEstadoOrden,
  validarCampos,
  ordenController.cambiarEstado
);

router.put(
  '/:id',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'),
  validarActualizarOrden,
  validarCampos,
  ordenController.actualizar
);

router.delete(
  '/:id',
  autorizarRoles('ADMINISTRADOR'),
  validarIdOrden,
  validarCampos,
  ordenController.eliminar
);

module.exports = router;