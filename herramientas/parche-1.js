// Parche 1: la plantilla del correo con el codigo, y las dos consultas que
// faltaban en el repositorio de tokens.
//
// Se hace con reemplazos exactos en vez de reescribir los archivos enteros,
// para no pisar nada de lo que ya estaba.

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const P_PLANTILLA = path.join(RAIZ, 'src', 'plantillas', 'correo.js');
const P_REPO = path.join(RAIZ, 'src', 'repositories', 'tokenSeguridad.repository.js');

// ---------------------------------------------------------------- plantilla
let plantilla = fs.readFileSync(P_PLANTILLA, 'utf8');

if (plantilla.includes('codigoActivacion')) {
  console.log('plantilla: ya estaba, no se toca');
} else {
  const bloqueCodigo = `
// El codigo se muestra grande, separado y en una sola linea.
//
// Se escribe como texto suelto y no como imagen ni como tabla apretada porque
// el cliente lo va a leer en el celular, a veces a contraluz, y lo va a teclear
// en otra pantalla. El espaciado entre letras es lo que evita confundir un 8
// con un 0 cuando la pantalla esta sucia de grasa, que es el caso real de un
// taller.
function recuadroCodigo(codigo) {
  return \`<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0;width:100%;">
    <tr><td align="center" style="background:\${NEGRO};border:1px solid \${AMBAR};border-radius:8px;padding:18px 12px;">
      <span style="color:\${AMBAR};font-size:34px;font-weight:bold;letter-spacing:10px;font-family:Consolas,'Courier New',monospace;">\${codigo}</span>
    </td></tr>
  </table>\`;
}

function codigoActivacion({ nombre, codigo, minutos }) {
  return {
    asunto: 'Tu codigo para activar la cuenta - SIGTM',
    html: envoltura({
      titulo: 'Activa tu cuenta',
      cuerpo:
        parrafo(\`Hola \${nombre},\`) +
        parrafo(
          'El taller registro tu motocicleta en SIGTM. Con este codigo activas tu cuenta y eliges tu propia contrasena:'
        ) +
        recuadroCodigo(codigo) +
        parrafo('Escribelo en la pantalla de activacion de la aplicacion.') +
        nota(\`El codigo caduca en \${minutos} minutos y solo admite cinco intentos.\`) +
        nota('Nadie del taller conoce ni puede ver tu contrasena: la eliges tu.') +
        nota('Si no dejaste ninguna moto en el taller, ignora este mensaje y no lo compartas con nadie.'),
    }),
    texto:
      \`Hola \${nombre}.\\n\\n\` +
      \`Tu codigo para activar la cuenta en SIGTM es: \${codigo}\\n\\n\` +
      \`Caduca en \${minutos} minutos y solo admite cinco intentos.\\n\` +
      \`Nadie del taller conoce tu contrasena: la eliges tu.\\n\\n\` +
      \`Si no dejaste ninguna moto en el taller, ignora este mensaje.\`,
  };
}

function codigoRecuperacion({ nombre, codigo, minutos }) {
  return {
    asunto: 'Tu codigo para recuperar la contrasena - SIGTM',
    html: envoltura({
      titulo: 'Recuperar la contrasena',
      cuerpo:
        parrafo(\`Hola \${nombre},\`) +
        parrafo('Alguien pidio recuperar la contrasena de esta cuenta. Si fuiste tu, este es el codigo:') +
        recuadroCodigo(codigo) +
        nota(\`Caduca en \${minutos} minutos y solo admite cinco intentos.\`) +
        nota('Si no pediste esto, no tienes que hacer nada: tu contrasena actual sigue funcionando.') +
        nota('No le des este codigo a nadie, ni siquiera a alguien que diga ser del taller.'),
    }),
    texto:
      \`Hola \${nombre}.\\n\\n\` +
      \`Tu codigo para recuperar la contrasena es: \${codigo}\\n\\n\` +
      \`Caduca en \${minutos} minutos.\\n\` +
      \`Si no pediste esto, ignora el mensaje.\`,
  };
}

`;

  const marca = 'function cambioEstadoOrden(';
  if (!plantilla.includes(marca)) {
    console.error('ERROR: no encontre donde insertar en la plantilla.');
    process.exit(1);
  }
  plantilla = plantilla.replace(marca, bloqueCodigo + marca);

  plantilla = plantilla.replace(
    'module.exports = { recuperacionPassword, verificacionEmail, cambioEstadoOrden, ordenCancelada };',
    'module.exports = {\n' +
      '  recuperacionPassword,\n' +
      '  verificacionEmail,\n' +
      '  codigoActivacion,\n' +
      '  codigoRecuperacion,\n' +
      '  cambioEstadoOrden,\n' +
      '  ordenCancelada,\n' +
      '};'
  );

  fs.writeFileSync(P_PLANTILLA, plantilla, 'utf8');
  console.log('plantilla: codigoActivacion y codigoRecuperacion anadidas');
}

// -------------------------------------------------------------- repositorio
let repo = fs.readFileSync(P_REPO, 'utf8');

if (repo.includes('buscarActivo')) {
  console.log('repositorio: ya estaba, no se toca');
} else {
  const bloqueRepo = `
// Busca el codigo vivo de un usuario.
//
// Hace falta buscar por usuario y no por huella porque cuando el codigo esta
// MAL la huella no coincide con ninguna fila, y aun asi hay que encontrar el
// registro para sumarle el intento fallido. Sin esto, equivocarse no costaria
// nada y el contador de intentos no serviria para nada.
async function buscarActivo(usuarioId, tipo) {
  return prisma.tokenSeguridad.findFirst({
    where: { usuarioId, tipo, usadoEn: null },
    orderBy: { createdAt: 'desc' },
    include: { usuario: true },
  });
}

// Suma un intento fallido. Devuelve la fila actualizada para que el servicio
// sepa cuantos quedan sin tener que volver a consultar.
async function sumarIntento(id) {
  return prisma.tokenSeguridad.update({
    where: { id },
    data: { intentos: { increment: 1 } },
  });
}

`;

  repo = repo.replace('async function eliminarCaducados()', bloqueRepo + 'async function eliminarCaducados()');
  repo = repo.replace(
    '  marcarUsado,\n  invalidarAnteriores,',
    '  marcarUsado,\n  invalidarAnteriores,\n  buscarActivo,\n  sumarIntento,'
  );

  fs.writeFileSync(P_REPO, repo, 'utf8');
  console.log('repositorio: buscarActivo y sumarIntento anadidas');
}

// -------------------------------------------------------- comprobacion real
delete require.cache[require.resolve(P_PLANTILLA)];
delete require.cache[require.resolve(P_REPO)];

const plantillas = require(P_PLANTILLA);
const repositorio = require(P_REPO);

console.log('');
console.log('=== COMPROBACION ===');
const m = plantillas.codigoActivacion({ nombre: 'Marcela', codigo: '493021', minutos: 30 });
console.log(`  asunto        : ${m.asunto}`);
console.log(`  codigo en html: ${m.html.includes('493021') ? 'si' : 'NO'}`);
console.log(`  codigo en texto: ${m.texto.includes('493021') ? 'si' : 'NO'}`);
console.log(`  no dice "enlace": ${/enlace/i.test(m.html) ? 'MAL, aun lo dice' : 'correcto'}`);
console.log(`  repositorio.buscarActivo: ${typeof repositorio.buscarActivo}`);
console.log(`  repositorio.sumarIntento: ${typeof repositorio.sumarIntento}`);
