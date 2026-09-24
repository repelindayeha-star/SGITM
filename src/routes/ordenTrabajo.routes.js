const { Router } = require('express');
const ordenController = require('../controllers/ordenTrabajo.controller');
const evidenciaController = require('../controllers/evidencia.controller');
const recibirImagen = require('../middlewares/recibirImagen');
const { validarEvidencia } = require('../validators/evidencia.validator');
const validarCampos = require('../middlewares/validarCampos');
const autenticar = require('../middlewares/auth.middleware');
const autorizarRoles = require('../middlewares/roles.middleware');
const {
  soloPropioSiCliente,
  soloOrdenAsignadaSiMecanico,
  soloMiListaSiMecanico,
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
  soloOrdenAsignadaSiMecanico(),
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
  soloMiListaSiMecanico,
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
  soloOrdenAsignadaSiMecanico(),
  ordenController.cambiarEstado
);

router.put(
  '/:id',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'),
  validarActualizarOrden,
  validarCampos,
  soloOrdenAsignadaSiMecanico(),
  ordenController.actualizar
);

router.delete(
  '/:id',
  autorizarRoles('ADMINISTRADOR'),
  validarIdOrden,
  validarCampos,
  ordenController.eliminar
);

// ── Fotografias de evidencia ─────────────────────────────────────────
//
// Cuelgan de la orden porque no existen sin ella: son el registro de lo que
// se le hizo a ESA moto.
//
// Verlas: tambien el cliente, comprobando que la orden sea suya. Es el
// sentido de la funcion; si el dueno de la moto no puede ver las fotos, no
// sirve de nada haberlas tomado.
router.get(
  '/:id/evidencias',
  validarIdOrden,
  validarCampos,
  soloPropioSiCliente(duenoDeOrden),
  soloOrdenAsignadaSiMecanico(),
  evidenciaController.listar
);

// Subirlas y borrarlas: solo el personal del taller. Un cliente no documenta
// el trabajo, lo recibe.
router.post(
  '/:id/evidencias',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'),
  validarIdOrden,
  validarCampos,
  soloOrdenAsignadaSiMecanico(),
  recibirImagen('imagen'),
  validarEvidencia,
  validarCampos,
  evidenciaController.agregar
);

router.delete(
  '/:id/evidencias/:evidenciaId',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA', 'MECANICO'),
  soloOrdenAsignadaSiMecanico(),
  evidenciaController.eliminar
);

module.exports = router;
