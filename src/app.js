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
app.use(errorHandler);

module.exports = app;