const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const prisma = require('./config/prismaClient');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Origen explicito, nunca '*'. env.js garantiza que urlFrontend tiene valor,
// asi que ya no existe el caso "falta la variable -> se abre a todo el mundo".
app.use(cors({ origin: env.urlFrontend, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.esProduccion ? 'combined' : 'dev'));

// Health real: consulta la base. Un health que responde OK sin tocar la
// base de datos miente, y es justo lo que un monitor necesita saber.
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ exito: true, mensaje: 'SIGTM backend funcionando', baseDatos: 'ok' });
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
app.use(errorHandler);

module.exports = app;
