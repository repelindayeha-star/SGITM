const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const prisma = require('./config/prismaClient');
const errorHandler = require('./middlewares/errorHandler');
const limitarIntentos = require('./middlewares/limitarIntentos');

const app = express();

// Detras de un proxy (Docker, Render, Railway) la IP real viene en una
// cabecera. Sin esto, el limite de peticiones contaria a todo el mundo como
// una sola direccion y castigaria a los inocentes junto al abusador.
app.set('trust proxy', 1);

// Cabeceras de seguridad. Las que mas importan aqui: X-Content-Type-Options,
// para que el navegador no adivine el tipo de un archivo subido; y la politica
// de referencia, para no filtrar el codigo de una orden al salir a otro sitio.
// La politica de contenido se desactiva porque esto sirve una API, no paginas.
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// Origen explicito, nunca '*'. env.js garantiza que urlFrontend tiene valor,
// asi que ya no existe el caso "falta la variable -> se abre a todo el mundo".
// Se comprueba el origen contra la lista en vez de pasar un solo valor.
//
// Las peticiones sin origen (curl, las pruebas de integracion, los chequeos
// de salud del alojamiento) se dejan pasar: no vienen de un navegador, asi
// que el CORS no las protege de nada y bloquearlas solo romperia el monitoreo.
app.use(
  cors({
    origin(origen, callback) {
      if (!origen) return callback(null, true);
      if (env.origenesPermitidos.includes(origen)) return callback(null, true);
      return callback(new Error(`Origen no permitido: ${origen}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.esProduccion ? 'combined' : 'dev'));

// Freno general, holgado a proposito: no estorba a nadie usando la aplicacion
// y corta el raspado automatico. Las rutas sensibles llevan ademas el suyo,
// mucho mas estrecho (ver auth.routes.js).
app.use(
  '/api',
  limitarIntentos({
    maximo: 300,
    ventanaMinutos: 5,
    mensaje: 'Demasiadas peticiones. Espera un momento.',
  })
);

// Las imagenes guardadas en disco, para el caso en que Cloudinary no este
// configurado. Con Cloudinary esta carpeta se queda vacia y nadie la usa.
app.use('/uploads', express.static(require('./services/almacenamiento.service').CARPETA_LOCAL, {
  maxAge: '7d',
  index: false,
  // Que el navegador no adivine el tipo de un archivo subido por un usuario.
  setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
}));

// Health real: consulta la base. Un health que responde OK sin tocar la
// base de datos miente, y es justo lo que un monitor necesita saber.
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    // Se informa si el correo y las imagenes tienen proveedor configurado.
    //
    // No es un adorno. Las dos cosas fallan EN SILENCIO cuando faltan sus
    // variables: el correo cae a una bandeja de prueba que no entrega nada, y
    // las fotos se guardan en el disco del servidor, que se borra en cada
    // reinicio. Sin este dato, la unica forma de enterarse es que un cliente
    // no reciba su codigo. No se expone ningun secreto, solo si estan puestos.
    res.json({
      exito: true,
      mensaje: 'SIGTM backend funcionando',
      baseDatos: 'ok',
      correo: env.smtp.configurado ? 'configurado' : 'SIN CONFIGURAR',
      imagenes: env.cloudinary.configurado ? 'configurado' : 'SIN CONFIGURAR',
    });
  } catch (error) {
    res.status(503).json({ exito: false, mensaje: 'Sin conexion a la base de datos.' });
  }
});

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/usuarios', require('./routes/usuario.routes'));
app.use('/api/clientes', require('./routes/cliente.routes'));
app.use('/api/motocicletas', require('./routes/motocicleta.routes'));
app.use('/api/citas', require('./routes/cita.routes'));
app.use('/api/ordenes', require('./routes/ordenTrabajo.routes'));
app.use('/api/inventario', require('./routes/inventario.routes'));
app.use('/api/diagnosticos', require('./routes/diagnostico.routes'));
app.use('/api/facturas', require('./routes/factura.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/reportes', require('./routes/reporte.routes'));
app.use(errorHandler);

module.exports = app;
