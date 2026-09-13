// Detecta y repara doble codificacion (mojibake).
//
// Origen del problema: leer un archivo UTF-8 con una herramienta que asume
// la pagina de codigos de Windows convierte "á" en "Ã¡". Si despues se
// guarda como UTF-8, la corrupcion queda grabada.
//
// La reparacion es el camino inverso exacto: tomar el texto, escribir cada
// caracter como un byte latin-1 y volver a leer esos bytes como UTF-8. Solo
// se aplica si el resultado es valido y distinto del original.
//
//   node revisar-encoding.js           -> solo informa
//   node revisar-encoding.js --reparar -> corrige los archivos
const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const EXCLUIR = /node_modules|[\\/]\.git[\\/]|[\\/]dist[\\/]|revisar-encoding\.js/;
const EXT = /\.(js|jsx|json|css|prisma|sql|yml|yaml|md|html|txt)$/;
const REPARAR = process.argv.includes('--reparar');

function recorrer(dir, salida = []) {
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    const completo = path.join(dir, entrada.name);
    if (EXCLUIR.test(completo)) continue;
    if (entrada.isDirectory()) recorrer(completo, salida);
    else if (EXT.test(entrada.name)) salida.push(completo);
  }
  return salida;
}

// Intenta deshacer la doble codificacion. Devuelve null si no aplica.
function desdoblar(texto) {
  // Si algun caracter no cabe en un byte, el texto no puede venir de una
  // lectura latin-1 y no hay nada que deshacer.
  for (const ch of texto) {
    if (ch.codePointAt(0) > 0xff) return null;
  }
  const bytes = Buffer.from(texto, 'latin1');
  const candidato = bytes.toString('utf8');
  // El caracter de reemplazo significa que los bytes no eran UTF-8 valido.
  if (candidato.includes('�')) return null;
  return candidato === texto ? null : candidato;
}

// Palabras que delatan la corrupcion sin falsos positivos: una A con
// acento circunflejo o una A con tilde seguidas de otro caracter no ASCII
// casi nunca aparecen en español de verdad.
const SOSPECHOSA = /[ÂÃ][-¿]/;

let archivosTocados = 0;
let lineasTocadas = 0;

for (const archivo of recorrer(RAIZ)) {
  const original = fs.readFileSync(archivo, 'utf8');
  if (!SOSPECHOSA.test(original)) continue;

  const lineas = original.split('\n');
  let cambio = false;

  const reparadas = lineas.map((linea, i) => {
    if (!SOSPECHOSA.test(linea)) return linea;
    const arreglada = desdoblar(linea);
    if (!arreglada || arreglada === linea) return linea;
    cambio = true;
    lineasTocadas += 1;
    console.log(`${path.relative(RAIZ, archivo)}:${i + 1}`);
    console.log(`   antes:   ${linea.trim().slice(0, 100)}`);
    console.log(`   despues: ${arreglada.trim().slice(0, 100)}`);
    return arreglada;
  });

  if (cambio) {
    archivosTocados += 1;
    if (REPARAR) fs.writeFileSync(archivo, reparadas.join('\n'), 'utf8');
  }
}

console.log(
  `\n${REPARAR ? 'REPARADOS' : 'DETECTADOS'}: ${lineasTocadas} lineas en ${archivosTocados} archivos.`
);
if (!REPARAR && lineasTocadas > 0) {
  console.log('Para corregir:  node revisar-encoding.js --reparar');
}
process.exitCode = !REPARAR && lineasTocadas > 0 ? 1 : 0;
