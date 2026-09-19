// Prepara la migracion que anade el contador de intentos a los tokens.
//
// Se escribe a mano en vez de usar "prisma migrate dev" porque la base es
// compartida por las tres personas del equipo: migrate dev puede decidir
// reiniciarla, y eso borraria el trabajo de los demas. Con el archivo escrito
// a mano se aplica con "migrate deploy", que solo anade.
//
// Los dos archivos se escriben en UTF-8 SIN marca de orden de bytes: PowerShell
// la pone por defecto y PostgreSQL rechaza el archivo con error P3018.

const fs = require('fs');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const ESQUEMA = path.join(RAIZ, 'prisma', 'schema.prisma');

// ---------- 1. El esquema ----------
let esquema = fs.readFileSync(ESQUEMA, 'utf8');

if (esquema.includes('intentos')) {
  console.log('El esquema ya tiene el campo intentos. No se toca.');
} else {
  const antes = '  usadoEn   DateTime?\n';
  if (!esquema.includes(antes)) {
    console.error('ERROR: no encontre la linea usadoEn en TokenSeguridad.');
    process.exit(1);
  }
  esquema = esquema.replace(
    antes,
    antes +
      '  // Cuantas veces se ha fallado este codigo. Seis digitos son un millon\n' +
      '  // de combinaciones: sin este contador se recorren todas.\n' +
      '  intentos  Int                @default(0)\n'
  );
  fs.writeFileSync(ESQUEMA, esquema, { encoding: 'utf8' });
  console.log('Esquema actualizado: TokenSeguridad.intentos');
}

// ---------- 2. La migracion ----------
const sello = new Date()
  .toISOString()
  .replace(/[-:T]/g, '')
  .slice(0, 14);
const carpeta = path.join(RAIZ, 'prisma', 'migrations', `${sello}_intentos_de_codigo`);

const yaExiste = fs
  .readdirSync(path.join(RAIZ, 'prisma', 'migrations'))
  .some((d) => d.endsWith('_intentos_de_codigo'));

if (yaExiste) {
  console.log('La migracion ya existe. No se crea otra.');
} else {
  fs.mkdirSync(carpeta, { recursive: true });
  const sql =
    '-- Contador de intentos fallidos por codigo de seguridad.\n' +
    '--\n' +
    '-- Un codigo de seis digitos se puede adivinar probando. Este contador es\n' +
    '-- lo que hace que no se pueda: al quinto fallo el codigo queda inservible\n' +
    '-- y hay que pedir uno nuevo.\n' +
    '--\n' +
    '-- Solo anade una columna con valor por defecto, asi que las filas que ya\n' +
    '-- existen quedan en 0 y nada se pierde.\n' +
    'ALTER TABLE "tokens_seguridad" ADD COLUMN "intentos" INTEGER NOT NULL DEFAULT 0;\n';

  // Sin BOM, a proposito.
  fs.writeFileSync(path.join(carpeta, 'migration.sql'), sql, { encoding: 'utf8' });

  const bytes = fs.readFileSync(path.join(carpeta, 'migration.sql'));
  const conBom = bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf;
  console.log(`Migracion creada: ${path.basename(carpeta)}`);
  console.log(`  BOM: ${conBom ? 'SI (mal)' : 'no (correcto)'}`);
}
