const { Router } = require('express');
const reporteController = require('../controllers/reporte.controller');
const autenticar = require('../middlewares/auth.middleware');
const autorizarRoles = require('../middlewares/roles.middleware');

const router = Router();

// Los informes salen del sistema y se pueden reenviar por correo o imprimir.
// Por eso llevan la misma exigencia que el resto: hay que estar autenticado.
router.use(autenticar);

// La factura la puede descargar quien puede ver la orden. El control de que
// un cliente no vea la factura de otro ya vive en el servicio de facturas.
router.get('/facturas/:id.pdf', reporteController.facturaEnPdf);

// Los informes agregados son del negocio, no de un cliente: solo los ve quien
// administra el taller.
router.get(
  '/operacion.pdf',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA'),
  reporteController.informeOperacion
);

router.get(
  '/ordenes.xlsx',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA'),
  reporteController.ordenesEnExcel
);

module.exports = router;
