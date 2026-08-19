const { PrismaClient } = require('@prisma/client');

// Patrón singleton: evita crear múltiples conexiones a la BD
// en entornos de desarrollo con hot-reload.
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;