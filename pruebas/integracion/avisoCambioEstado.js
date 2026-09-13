// Recorre una orden por todas sus etapas y comprueba que el cliente recibe
// un correo en los saltos que le importan y ninguno en los que no.
//
// Crea su propia orden de prueba y la borra al terminar.
//   node pruebas/integracion/avisoCambioEstado.js
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const prisma = require('../../src/config/prismaClient');
const ordenService = require('../../src/services/ordenTrabajo.service');
const correoService = require('../../src/services/correo.service');

const ok = (t) => console.log(`  OK    ${t}`);
const fallo = (t, d) => {
  console.log(`  FALLO ${t}${d ? ' -> ' + d : ''}`);
  process.exitCode = 1;
};

// Se intercepta el envio para no depender del servidor de correo: lo que se
// comprueba aqui es la REGLA (cuando se manda), no el transporte.
const enviados = [];
const enviarReal = correoService.enviar;
correoService.enviar = async (mensaje) => {
  enviados.push(mensaje);
  return { enviado: true };
};

// El aviso sale sin esperar, a proposito. Se le da un respiro al bucle de
// eventos para que termine antes de contar.
const respirar = () => new Promise((r) => setTimeout(r, 150));

async function main() {
  const marca = Date.now();
  let cliente;
  let moto;
  let orden;
  let recepcion;

  try {
    recepcion = await prisma.usuario.findFirst({ where: { rol: 'RECEPCIONISTA' } });
    if (!recepcion) throw new Error('No hay recepcionista. Ejecuta npm run db:seed.');

    const usuarioCliente = await prisma.usuario.create({
      data: {
        nombre: 'Cliente De Prueba',
        email: `aviso-${marca}@sigtm.test`,
        password: 'no-se-usa',
        rol: 'CLIENTE',
      },
    });
    cliente = await prisma.cliente.create({
      data: { usuarioId: usuarioCliente.id, telefono: '3000000000' },
    });
    moto = await prisma.motocicleta.create({
      data: {
        clienteId: cliente.id,
        placa: `TST${String(marca).slice(-3)}`,
        marca: 'Yamaha',
        modelo: 'FZ 2.0',
        anio: 2021,
      },
    });

    orden = await ordenService.crear({
      clienteId: cliente.id,
      motocicletaId: moto.id,
      descripcionProblema: 'No enciende el motor',
      usuarioId: recepcion.id,
    });
    console.log(`\nOrden de prueba: ${orden.codigo}\n`);

    const pasos = [
      ['EN_DIAGNOSTICO', true, 'entra a "la estamos revisando"'],
      ['EN_COTIZACION', false, 'sigue en revision: NO debe mandar otro correo'],
      ['APROBADA', true, 'entra a "en reparacion"'],
      ['EN_REPARACION', false, 'sigue en reparacion: NO debe mandar otro correo'],
      ['LISTA', true, 'entra a "lista para recoger"'],
      ['ENTREGADA', true, 'entrega'],
    ];

    for (const [estado, deberiaAvisar, descripcion] of pasos) {
      const antes = enviados.length;
      await ordenService.cambiarEstado(orden.id, estado, recepcion.id, null);
      await respirar();
      const mando = enviados.length > antes;

      if (mando === deberiaAvisar) ok(`${estado}: ${descripcion}`);
      else fallo(`${estado}: ${descripcion}`, mando ? 'mando y no debia' : 'no mando y debia');
    }

    console.log('');
    enviados.length === 4
      ? ok(`cuatro correos en seis cambios de estado (total: ${enviados.length})`)
      : fallo('numero de correos', `esperaba 4, hubo ${enviados.length}`);

    const asuntos = enviados.map((m) => m.asunto);
    asuntos.some((a) => a.includes('Lista para recoger'))
      ? ok('el correo de "lista para recoger" salio')
      : fallo('falta el correo de moto lista', asuntos.join(' | '));

    enviados.every((m) => m.para.endsWith('@sigtm.test'))
      ? ok('todos los correos fueron al cliente de la orden')
      : fallo('algun correo fue a otro destinatario');

    enviados.every((m) => m.html.includes(orden.codigo))
      ? ok('cada correo lleva el codigo de la orden')
      : fallo('algun correo no lleva el codigo');

    // El correo apunta al seguimiento publico: el cliente no necesita cuenta.
    enviados.every((m) => m.html.includes(`/seguimiento/${orden.codigo}`))
      ? ok('el enlace lleva al seguimiento publico, sin pedir cuenta')
      : fallo('el enlace no apunta al seguimiento publico');

    // Nada de jerga interna en lo que lee el cliente.
    const jerga = enviados.filter((m) => /EN_DIAGNOSTICO|EN_COTIZACION|EN_REPARACION/.test(m.html));
    jerga.length === 0
      ? ok('ningun correo filtra los nombres internos de los estados')
      : fallo('hay jerga interna en el correo', jerga.map((m) => m.asunto).join(' | '));
  } finally {
    correoService.enviar = enviarReal;
    if (orden) {
      await prisma.historialEstadoOrden.deleteMany({ where: { ordenId: orden.id } });
      await prisma.ordenTrabajo.delete({ where: { id: orden.id } }).catch(() => {});
    }
    if (moto) await prisma.motocicleta.delete({ where: { id: moto.id } }).catch(() => {});
    if (cliente) {
      const usuarioId = cliente.usuarioId;
      await prisma.cliente.delete({ where: { id: cliente.id } }).catch(() => {});
      await prisma.usuario.delete({ where: { id: usuarioId } }).catch(() => {});
    }
    await prisma.$disconnect();
    console.log('\nDatos de prueba eliminados.\n');
  }
}

main().catch((e) => {
  console.error('ERROR', e);
  process.exitCode = 1;
});
