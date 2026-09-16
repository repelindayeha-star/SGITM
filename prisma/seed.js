// Datos de demostracion del sistema.
//
// Sin esto, una base de datos recien migrada no tiene ningun usuario y el
// sistema es literalmente inaccesible: no hay forma de iniciar sesion.
//
// Es idempotente (usa upsert), asi que se puede ejecutar las veces que haga
// falta sin duplicar nada:  npm run db:seed
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { sembrarDemo } = require('./semillaDemo');

const prisma = new PrismaClient();

const SALT_ROUNDS = 10;

// Contrasena unica para todas las cuentas de demostracion.
// En un entorno real cada usuario la cambiaria en su primer ingreso.
const PASSWORD_DEMO = 'Sigtm2026*';

async function crearUsuario({ nombre, email, rol }) {
  const password = await bcrypt.hash(PASSWORD_DEMO, SALT_ROUNDS);

  // La contrasena tambien se restaura al actualizar, no solo al crear.
  //
  // Antes no era asi, y el resultado fue este: cuatro de las seis cuentas de
  // demostracion tenian una contrasena distinta a la que dice el manual,
  // porque alguien las cambio probando. Ejecutar la semilla no lo arreglaba,
  // y el fallo solo se habria visto al intentar entrar delante del jurado.
  //
  // Una semilla que no puede devolver el sistema a un estado conocido no
  // sirve para lo unico que existe.
  return prisma.usuario.upsert({
    where: { email },
    update: { nombre, rol, activo: true, password, passwordCambiadaEn: new Date() },
    create: { nombre, email, password, rol },
  });
}

async function main() {
  console.log('\n→ Usuarios...');

  await crearUsuario({
    nombre: 'Administrador SIGTM',
    email: 'admin@sigtm.com',
    rol: 'ADMINISTRADOR',
  });

  await crearUsuario({
    nombre: 'Laura Restrepo',
    email: 'recepcion@sigtm.com',
    rol: 'RECEPCIONISTA',
  });

  await crearUsuario({
    nombre: 'Andrés Gómez',
    email: 'mecanico1@sigtm.com',
    rol: 'MECANICO',
  });

  await crearUsuario({
    nombre: 'Julián Marín',
    email: 'mecanico2@sigtm.com',
    rol: 'MECANICO',
  });

  const usuarioCliente = await crearUsuario({
    nombre: 'Carlos Ruiz',
    email: 'cliente@sigtm.com',
    rol: 'CLIENTE',
  });

  console.log('→ Perfil de cliente y motocicleta...');

  const cliente = await prisma.cliente.upsert({
    where: { usuarioId: usuarioCliente.id },
    update: {},
    create: {
      usuarioId: usuarioCliente.id,
      telefono: '3001234567',
      direccion: 'Calle 50 #45-30, Bello, Antioquia',
    },
  });

  await prisma.motocicleta.upsert({
    where: { placa: 'ABC12D' },
    update: {},
    create: {
      clienteId: cliente.id,
      placa: 'ABC12D',
      marca: 'Bajaj',
      modelo: 'Pulsar NS 200',
      anio: 2022,
      color: 'Negro',
    },
  });

  console.log('→ Catálogo de repuestos...');

  // Los dos ultimos quedan por debajo del stock minimo a proposito, para que
  // el indicador de "stock bajo" del dashboard tenga algo real que mostrar
  // el dia de la sustentacion.
  const repuestos = [
    { codigo: 'ACE-10W40',  nombre: 'Aceite motor 10W40 (1L)',            stock: 40, stockMinimo: 10, precio: 38000 },
    { codigo: 'FIL-ACE-01', nombre: 'Filtro de aceite universal',          stock: 25, stockMinimo: 8,  precio: 22000 },
    { codigo: 'PAS-FRE-01', nombre: 'Pastillas de freno delanteras',       stock: 12, stockMinimo: 6,  precio: 65000 },
    { codigo: 'BUJ-NGK-01', nombre: 'Bujía NGK estándar',                  stock: 30, stockMinimo: 10, precio: 18000 },
    { codigo: 'KIT-ARR-01', nombre: 'Kit de arrastre (piñón, sprocket, cadena)', stock: 4, stockMinimo: 5, precio: 185000 },
    { codigo: 'BAT-12V-01', nombre: 'Batería 12V 7Ah',                     stock: 3,  stockMinimo: 5,  precio: 145000 },
  ];

  for (const repuesto of repuestos) {
    await prisma.repuesto.upsert({
      where: { codigo: repuesto.codigo },
      update: {},
      create: repuesto,
    });
  }

  await sembrarDemo(prisma);

  console.log(`\n✔ Listo. Contraseña para todas las cuentas: ${PASSWORD_DEMO}\n`);
  console.table([
    { rol: 'ADMINISTRADOR', correo: 'admin@sigtm.com' },
    { rol: 'RECEPCIONISTA', correo: 'recepcion@sigtm.com' },
    { rol: 'MECANICO',      correo: 'mecanico1@sigtm.com' },
    { rol: 'MECANICO',      correo: 'mecanico2@sigtm.com' },
    { rol: 'CLIENTE',       correo: 'cliente@sigtm.com' },
  ]);
}

main()
  .catch((error) => {
    console.error('\n✖ Error sembrando datos:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
