const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ exito: true, mensaje: 'SIGTM backend funcionando' });
});

app.use('/api/auth', require('./routes/auth.routes'));
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