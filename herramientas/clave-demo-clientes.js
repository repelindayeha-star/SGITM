// Le pone una contrasena utilizable a los clientes de la demostracion.
//
// Por que hace falta: la semilla los crea con el texto 'no-utilizable', a
// proposito, porque en la vida real la recepcionista NO le inventa una clave a
// un cliente: el cliente se la pone el mismo con el enlace de recuperacion.
// Pero para la sustentacion hace falta poder entrar al portal con una cuenta
// que SI tenga motos y ordenes, y las unicas que las tienen son estas.
//
// Esto hace exactamente lo mismo que haria el flujo de recuperacion: deja una
// contrasena cifrada con bcrypt y mueve la fecha de cambio. No borra ni
// reinicia NADA: solo actualiza el campo password de estos tres usuarios.

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const CLAVE = 'Sigtm2026*';
const RONDAS = 10;

const CORREOS = [
  'marcela.ospina@ejemplo.com',
  'andres.restrepo@ejemplo.com',
  'luisa.cardona@ejemplo.com',
];

(async () => {
  const hash = await bcrypt.hash(CLAVE, RONDAS);

  for (const email of CORREOS) {
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      console.log(`  SALTADO  ${email}  (no existe)`);
      continue;
    }
    if (usuario.rol !== 'CLIENTE') {
      console.log(`  SALTADO  ${email}  (no es CLIENTE, es ${usuario.rol})`);
      continue;
    }

    await prisma.usuario.update({
      where: { email },
      data: { password: hash, passwordCambiadaEn: new Date(), activo: true },
    });

    const cliente = await prisma.cliente.findUnique({ where: { usuarioId: usuario.id } });
    const motos = cliente
      ? await prisma.motocicleta.count({ where: { clienteId: cliente.id } })
      : 0;
    const ordenes = cliente
      ? await prisma.ordenTrabajo.count({ where: { clienteId: cliente.id } })
      : 0;

    console.log(`  LISTO    ${email.padEnd(32)} motos=${motos}  ordenes=${ordenes}`);
  }

  console.log(`\nContrasena para las tres: ${CLAVE}`);
  await prisma.$disconnect();
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
