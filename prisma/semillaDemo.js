// Ordenes de trabajo de demostracion.
//
// Sin esto la base queda con una sola orden, y entonces el panel de
// indicadores, la linea de tiempo del cliente y los informes se ven vacios.
// Un sistema de taller con una moto no demuestra nada: lo que hay que poder
// ensenar es un taller con trabajo encima, en varias etapas a la vez.
//
// Los datos son inventados a proposito y se reconocen como tales: los codigos
// empiezan por OT-2026-DEMO. No se mezclan con lo que registre el equipo
// probando, y se pueden volver a sembrar sin duplicar nada.
const CODIGO = (n) => `OT-2026-DEMO${String(n).padStart(2, '0')}`;

const diasAtras = (d, hora = 9) => {
  const f = new Date();
  f.setDate(f.getDate() - d);
  f.setHours(hora, 0, 0, 0);
  return f;
};

// Clientes con sus motos. Nombres y placas de la region, para que en pantalla
// se lea como un taller de Medellin y no como una tabla de ejemplo.
const CLIENTES = [
  {
    nombre: 'Marcela Ospina', email: 'marcela.ospina@ejemplo.com',
    telefono: '3104458812', direccion: 'Cra 52 #38-20, Medellin',
    motos: [{ placa: 'JKL45M', marca: 'Yamaha', modelo: 'FZ 2.0', anio: 2021, color: 'Azul' }],
  },
  {
    nombre: 'Andres Restrepo', email: 'andres.restrepo@ejemplo.com',
    telefono: '3016672290', direccion: 'Calle 30 #65-14, Itagui',
    motos: [
      { placa: 'PQR78S', marca: 'Honda', modelo: 'CB 190R', anio: 2020, color: 'Rojo' },
      { placa: 'TUV90W', marca: 'Suzuki', modelo: 'Gixxer 150', anio: 2023, color: 'Gris' },
    ],
  },
  {
    nombre: 'Luisa Cardona', email: 'luisa.cardona@ejemplo.com',
    telefono: '3229981104', direccion: 'Cra 48 #10-55, Envigado',
    motos: [{ placa: 'XYZ23A', marca: 'Bajaj', modelo: 'Boxer CT 100', anio: 2019, color: 'Negro' }],
  },
];

/**
 * Las ocho ordenes cubren los ocho estados.
 *
 * `recorrido` es la secuencia real de etapas por las que paso, con cuantos
 * dias atras ocurrio cada una. De ahi sale el historial, que es lo que le da
 * fechas a la linea de tiempo del cliente: una orden sin historial se ve como
 * si hubiera aparecido de la nada en su estado actual.
 */
const ORDENES = [
  { n: 1, placa: 'JKL45M', problema: 'No enciende en frio. Hay que darle patada varias veces.',
    recorrido: [['RECIBIDA', 1]] },

  { n: 2, placa: 'PQR78S', problema: 'Suena un golpeteo en el motor al acelerar.',
    mecanico: 1, recorrido: [['RECIBIDA', 4], ['EN_DIAGNOSTICO', 3]] },

  { n: 3, placa: 'XYZ23A', problema: 'Frenos delanteros flojos, hay que apretar mucho.',
    mecanico: 2,
    recorrido: [['RECIBIDA', 7], ['EN_DIAGNOSTICO', 6], ['EN_COTIZACION', 5]],
    diagnostico: {
      descripcion: 'Pastillas delanteras desgastadas al limite y liquido de frenos por debajo del minimo.',
      manoObra: 45000,
      items: [{ codigo: 'PAS-FRE-01', descripcion: 'Pastillas de freno delanteras', cantidad: 1 }],
    } },

  { n: 4, placa: 'TUV90W', problema: 'Mantenimiento de los 10.000 km.',
    mecanico: 1,
    recorrido: [['RECIBIDA', 9], ['EN_DIAGNOSTICO', 8], ['EN_COTIZACION', 7], ['APROBADA', 6]],
    diagnostico: {
      descripcion: 'Mantenimiento preventivo: cambio de aceite, filtro y bujia.',
      manoObra: 60000,
      items: [
        { codigo: 'ACE-10W40', descripcion: 'Aceite motor 10W40 (1L)', cantidad: 2 },
        { codigo: 'FIL-ACE-01', descripcion: 'Filtro de aceite universal', cantidad: 1 },
        { codigo: 'BUJ-NGK-01', descripcion: 'Bujia NGK estandar', cantidad: 1 },
      ],
    } },

  { n: 5, placa: 'JKL45M', problema: 'Cadena saltando y piñon gastado.',
    mecanico: 2,
    recorrido: [['RECIBIDA', 12], ['EN_DIAGNOSTICO', 11], ['EN_COTIZACION', 10], ['APROBADA', 9], ['EN_REPARACION', 8]],
    diagnostico: {
      descripcion: 'Kit de arrastre completo al final de su vida util. Se reemplaza el conjunto.',
      manoObra: 80000,
      items: [{ codigo: 'KIT-ARR-01', descripcion: 'Kit de arrastre (piñon, sprocket, cadena)', cantidad: 1 }],
    } },

  { n: 6, placa: 'PQR78S', problema: 'La moto no arranca, la bateria no tiene carga.',
    mecanico: 1,
    recorrido: [['RECIBIDA', 16], ['EN_DIAGNOSTICO', 15], ['EN_COTIZACION', 14], ['APROBADA', 13], ['EN_REPARACION', 12], ['LISTA', 10]],
    diagnostico: {
      descripcion: 'Bateria sin retencion de carga. Se reemplaza y se revisa el sistema de carga.',
      manoObra: 35000,
      items: [{ codigo: 'BAT-12V-01', descripcion: 'Bateria 12V 7Ah', cantidad: 1 }],
    } },

  { n: 7, placa: 'XYZ23A', problema: 'Cambio de aceite y revision general.',
    mecanico: 2,
    recorrido: [['RECIBIDA', 28], ['EN_DIAGNOSTICO', 27], ['EN_COTIZACION', 26], ['APROBADA', 25], ['EN_REPARACION', 24], ['LISTA', 23], ['ENTREGADA', 22]],
    diagnostico: {
      descripcion: 'Cambio de aceite y filtro. Revision de frenos y luces sin novedad.',
      manoObra: 40000,
      items: [
        { codigo: 'ACE-10W40', descripcion: 'Aceite motor 10W40 (1L)', cantidad: 1 },
        { codigo: 'FIL-ACE-01', descripcion: 'Filtro de aceite universal', cantidad: 1 },
      ],
    },
    factura: { metodoPago: 'Efectivo' } },

  { n: 8, placa: 'TUV90W', problema: 'Ruido en la suspension trasera.',
    mecanico: 1,
    recorrido: [['RECIBIDA', 20], ['EN_DIAGNOSTICO', 19], ['CANCELADA', 18]],
    notaFinal: 'El cliente decidio llevarla al concesionario por garantia.' },
];

const ultimo = (recorrido) => recorrido[recorrido.length - 1];

async function sembrarDemo(prisma) {
  console.log('→ Ordenes de trabajo de demostracion...');

  const [mec1, mec2, recepcion] = await Promise.all([
    prisma.usuario.findUnique({ where: { email: 'mecanico1@sigtm.com' } }),
    prisma.usuario.findUnique({ where: { email: 'mecanico2@sigtm.com' } }),
    prisma.usuario.findUnique({ where: { email: 'recepcion@sigtm.com' } }),
  ]);
  const mecanicos = { 1: mec1, 2: mec2 };

  // ── Clientes y motos ───────────────────────────────────────────
  const motoPorPlaca = new Map();

  for (const c of CLIENTES) {
    const usuario = await prisma.usuario.upsert({
      where: { email: c.email },
      update: { nombre: c.nombre },
      // Sin contrasena utilizable: son clientes que el taller registro en
      // mostrador, no cuentas que alguien vaya a usar para entrar.
      create: { nombre: c.nombre, email: c.email, password: 'no-utilizable', rol: 'CLIENTE' },
    });

    const cliente = await prisma.cliente.upsert({
      where: { usuarioId: usuario.id },
      update: { telefono: c.telefono, direccion: c.direccion },
      create: { usuarioId: usuario.id, telefono: c.telefono, direccion: c.direccion },
    });

    for (const m of c.motos) {
      const moto = await prisma.motocicleta.upsert({
        where: { placa: m.placa },
        update: { clienteId: cliente.id, ...m },
        create: { clienteId: cliente.id, ...m },
      });
      motoPorPlaca.set(m.placa, { moto, cliente });
    }
  }

  // ── Repuestos por codigo, para enlazar los items ───────────────
  const repuestos = await prisma.repuesto.findMany();
  const porCodigo = new Map(repuestos.map((r) => [r.codigo, r]));

  // ── Ordenes ────────────────────────────────────────────────────
  let creadas = 0;

  for (const o of ORDENES) {
    const codigo = CODIGO(o.n);
    const { moto, cliente } = motoPorPlaca.get(o.placa);
    const [estadoFinal, diasFinal] = ultimo(o.recorrido);
    const [, diasInicio] = o.recorrido[0];

    // Se rehace entera cada vez: asi la semilla devuelve siempre el mismo
    // estado conocido, aunque alguien haya movido una orden probando.
    const existente = await prisma.ordenTrabajo.findUnique({ where: { codigo } });
    if (existente) {
      await prisma.historialEstadoOrden.deleteMany({ where: { ordenId: existente.id } });
      await prisma.factura.deleteMany({ where: { ordenId: existente.id } });
      const diag = await prisma.diagnostico.findUnique({ where: { ordenId: existente.id } });
      if (diag) {
        await prisma.itemCotizacion.deleteMany({ where: { diagnosticoId: diag.id } });
        await prisma.diagnostico.delete({ where: { id: diag.id } });
      }
      await prisma.ordenTrabajo.delete({ where: { id: existente.id } });
    }

    const orden = await prisma.ordenTrabajo.create({
      data: {
        codigo,
        clienteId: cliente.id,
        motocicletaId: moto.id,
        descripcionProblema: o.problema,
        estado: estadoFinal,
        mecanicoId: o.mecanico ? mecanicos[o.mecanico].id : null,
        fechaRecibido: diasAtras(diasInicio),
        fechaEntrega: estadoFinal === 'ENTREGADA' ? diasAtras(diasFinal, 16) : null,
        createdAt: diasAtras(diasInicio),
      },
    });

    // Historial: un asiento por cada etapa, con su fecha y su autor.
    let anterior = null;
    for (const [estado, dias] of o.recorrido) {
      const quien = ['EN_DIAGNOSTICO', 'EN_COTIZACION', 'EN_REPARACION', 'LISTA'].includes(estado)
        ? mecanicos[o.mecanico || 1]
        : recepcion;
      await prisma.historialEstadoOrden.create({
        data: {
          ordenId: orden.id,
          estadoAnterior: anterior,
          estadoNuevo: estado,
          usuarioId: quien?.id || null,
          nota: anterior === null
            ? 'Orden recibida en el taller'
            : estado === 'CANCELADA' ? o.notaFinal || null : null,
          createdAt: diasAtras(dias, 10),
        },
      });
      anterior = estado;
    }

    // Diagnostico y cotizacion.
    if (o.diagnostico) {
      const d = await prisma.diagnostico.create({
        data: {
          ordenId: orden.id,
          descripcion: o.diagnostico.descripcion,
          manoObra: o.diagnostico.manoObra,
          createdAt: diasAtras(diasInicio - 1, 11),
        },
      });
      for (const item of o.diagnostico.items) {
        const rep = porCodigo.get(item.codigo);
        await prisma.itemCotizacion.create({
          data: {
            diagnosticoId: d.id,
            repuestoId: rep?.id || null,
            descripcion: item.descripcion,
            cantidad: item.cantidad,
            precioUnitario: rep?.precio ?? 0,
          },
        });
      }

      // Factura: solo para lo que de verdad se entrego y se cobro.
      if (o.factura) {
        const subtotal = Number(o.diagnostico.manoObra) +
          o.diagnostico.items.reduce(
            (s, it) => s + Number(porCodigo.get(it.codigo)?.precio || 0) * it.cantidad, 0);
        await prisma.factura.create({
          data: {
            ordenId: orden.id,
            numero: `FAC-2026-DEMO${String(o.n).padStart(2, '0')}`,
            subtotal,
            total: subtotal,
            metodoPago: o.factura.metodoPago,
            createdAt: diasAtras(diasFinal, 17),
          },
        });
      }
    }

    creadas += 1;
  }

  console.log(`   ${creadas} ordenes de demostracion, cubriendo los ocho estados.`);
}

module.exports = { sembrarDemo };
