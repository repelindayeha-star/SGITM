// Solo lectura: quien tiene que, para decidir con que cuenta se hace la demo.
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const usuarios = await prisma.usuario.findMany({
    where: { rol: 'CLIENTE' },
    select: { id: true, nombre: true, email: true, activo: true, password: true },
    orderBy: { nombre: 'asc' },
  });

  for (const u of usuarios) {
    const cliente = await prisma.cliente.findUnique({
      where: { usuarioId: u.id },
      select: { id: true },
    });

    let motos = 0;
    let ordenes = 0;
    if (cliente) {
      motos = await prisma.motocicleta.count({ where: { clienteId: cliente.id } });
      ordenes = await prisma.ordenTrabajo.count({ where: { clienteId: cliente.id } });
    }

    const usable = u.password.startsWith('$2');
    console.log(
      `${u.email.padEnd(32)} perfil=${cliente ? 'si' : 'NO'}  motos=${motos}  ordenes=${ordenes}  contrasena=${usable ? 'utilizable' : 'NO UTILIZABLE'}`
    );
  }

  await prisma.$disconnect();
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
