const { Router } = require('express');
const reporteController = require('../controllers/reporte.controller');
const autenticar = require('../middlewares/auth.middleware');
const autorizarRoles = require('../middlewares/roles.middleware');
const { soloPropioSiCliente, duenoDeFactura } = require('../middlewares/propiedad.middleware');

const router = Router();

// Los informes salen del sistema y se pueden reenviar por correo o imprimir.
// Por eso llevan la misma exigencia que el resto: hay que estar autenticado.
router.use(autenticar);

// El PDF de la factura lo descarga el taller (administrador y recepcionista)
// y el cliente al que se le cobro. El comentario anterior decia que el control
// de dueno vivia en el servicio de facturas; no era cierto: obtenerPorId no
// recibia el usuario. Cualquier sesion valida con el UUID a la mano se bajaba
// la factura de otro. El candado esta ahora aqui, igual que en /api/facturas.
router.get(
  '/facturas/:id.pdf',
  autorizarRoles('ADMINISTRADOR', 'RECEPCIONISTA', 'CLIENTE'),
  soloPropioSiCliente(duenoDeFactura),
  reporteController.facturaEnPdf
);

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
