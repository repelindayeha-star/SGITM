const { Router } = require('express');
const ordenController = require('../controllers/ordenTrabajo.controller');
const validarCampos = require('../middlewares/validarCampos');
const autenticar = require('../middlewares/auth.middleware');
const autorizarRoles = require('../middlewares/roles.middleware');
const {
  soloPropioSiCliente,
  duenoDesdeParametro,
  duenoDeOrden,
} = require('../middlewares/propiedad.middleware');
const {
  validarCrearOrden,
  validarAsignarMecanico,
  validarCambiarEstadoOrden,
  validarActualizarOrden,
  validarIdOrden,
  validarCodigoOrden,
} = require('../validators/ordenTrabajo.validator');

const router = Router();

// Ruta publica para seguimiento por codigo/QR: va ANTES del middleware de
// autenticacion. Devuelve una proyeccion reducida (ver el servicio): estado
// de la orden y nada mas. Sin nombres, ni correos, ni cotizacion, ni factura.
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

// El portal del cliente entra por aqui. Sin la comprobacion de propiedad,
// cambiar el UUID mostraba la orden completa de otro cliente: su nombre, su
// correo, el desglose de la cotizacion y el total de la factura.
router.get(
  '/:id',
  validarIdOrden,
  validarCampos,
  soloPropioSiCliente(duenoDeOrden),
  ordenController.obtenerPorId
);

router.get(
  '/cliente/:clienteId',
  soloPropioSiCliente(duenoDesdeParametro('clienteId')),
  ordenController.listarPorCliente
);

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
