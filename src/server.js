// La configuracion se valida antes que nada: si falta una variable el
// proceso muere aqui con un mensaje claro, en lugar de arrancar a medias
// y fallar despues de forma confusa.
const env = require('./config/env');
const app = require('./app');
const prisma = require('./config/prismaClient');

const servidor = app.listen(env.puerto, () => {
  console.log(`Servidor SIGTM [${env.entorno}] en http://localhost:${env.puerto}`);
});

// Cierre ordenado: al recibir la senal de apagado dejamos terminar las
// peticiones en curso y soltamos la conexion a la base antes de salir.
// Sin esto, cada reinicio corta peticiones a la mitad.
async function apagar(senal) {
  console.log(`\n[${senal}] cerrando servidor...`);

  servidor.close(async () => {
    await prisma.$disconnect();
    console.log('Servidor cerrado correctamente.');
    process.exit(0);
  });

  // Red de seguridad: si algo se queda colgado, salimos igual a los 10 s.
  setTimeout(() => {
    console.error('Cierre forzado tras 10 s de espera.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => apagar('SIGTERM'));
process.on('SIGINT', () => apagar('SIGINT'));
