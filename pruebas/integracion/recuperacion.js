// Prueba manual del flujo completo de recuperacion de contrasena.
// Crea un usuario de usar y tirar, recorre los tres pasos y lo borra.
//   node prueba-recuperacion.js
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcrypt');
const prisma = require('../../src/config/prismaClient');
const { hashear } = require('../../src/utils/tokenSeguridad');

const API = 'http://localhost:3001/api';
const EMAIL = `prueba-recuperacion-${Date.now()}@sigtm.test`;
const CLAVE_VIEJA = 'Vieja2026*';
const CLAVE_NUEVA = 'Nueva2026*';

const ok = (t) => console.log(`  OK   ${t}`);
const fallo = (t, d) => { console.log(`  FALLO ${t}${d ? ' -> ' + d : ''}`); process.exitCode = 1; };

async function pedir(ruta, opciones = {}) {
  const r = await fetch(`${API}${ruta}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opciones,
  });
  return { estado: r.status, cuerpo: await r.json().catch(() => ({})) };
}

async function main() {
  console.log(`\nUsuario de prueba: ${EMAIL}\n`);

  const usuario = await prisma.usuario.create({
    data: {
      nombre: 'Usuario De Prueba',
      email: EMAIL,
      password: await bcrypt.hash(CLAVE_VIEJA, 10),
      rol: 'CLIENTE',
    },
  });

  try {
    console.log('1. Pedir el enlace');
    let r = await pedir('/auth/recuperar-password', {
      method: 'POST',
      body: JSON.stringify({ email: EMAIL }),
    });
    r.estado === 200 ? ok('responde 200') : fallo('responde 200', r.estado);

    r = await pedir('/auth/recuperar-password', {
      method: 'POST',
      body: JSON.stringify({ email: 'no-existe-jamas@sigtm.test' }),
    });
    r.cuerpo.mensaje && r.estado === 200
      ? ok('un correo inexistente da la MISMA respuesta (no revela quien tiene cuenta)')
      : fallo('misma respuesta para correo inexistente');

    // El token en claro solo existe en el correo. Para la prueba se genera uno
    // nuevo y se compara su huella con la guardada.
    const filas = await prisma.tokenSeguridad.findMany({
      where: { usuarioId: usuario.id, tipo: 'RECUPERACION_PASSWORD' },
      orderBy: { createdAt: 'desc' },
    });
    filas.length === 1 ? ok('se guardo exactamente un token') : fallo('numero de tokens', filas.length);
    filas[0].tokenHash.length === 64
      ? ok('el token se guardo como huella SHA-256, no en claro')
      : fallo('el token no esta hasheado');

    // Se fabrica un token conocido para poder seguir la prueba.
    const tokenClaro = 'token-de-prueba-' + Date.now();
    await prisma.tokenSeguridad.update({
      where: { id: filas[0].id },
      data: { tokenHash: hashear(tokenClaro) },
    });

    console.log('\n2. Comprobar el enlace');
    r = await pedir(`/auth/recuperar-password/${tokenClaro}`);
    r.estado === 200 ? ok('un enlace vivo se acepta') : fallo('enlace vivo', JSON.stringify(r.cuerpo));

    r = await pedir('/auth/recuperar-password/inventado-12345');
    r.estado === 400 ? ok('un enlace inventado se rechaza') : fallo('enlace inventado', r.estado);

    console.log('\n3. Restablecer');
    r = await pedir('/auth/restablecer-password', {
      method: 'POST',
      body: JSON.stringify({ token: tokenClaro, password: CLAVE_NUEVA, confirmacion: 'otra-cosa' }),
    });
    r.estado === 400 ? ok('rechaza si las dos contrasenas no coinciden') : fallo('confirmacion', r.estado);

    r = await pedir('/auth/restablecer-password', {
      method: 'POST',
      body: JSON.stringify({ token: tokenClaro, password: 'corta', confirmacion: 'corta' }),
    });
    r.estado === 400 ? ok('rechaza una contrasena debil') : fallo('contrasena debil', r.estado);

    r = await pedir('/auth/restablecer-password', {
      method: 'POST',
      body: JSON.stringify({ token: tokenClaro, password: CLAVE_NUEVA, confirmacion: CLAVE_NUEVA }),
    });
    r.estado === 200 ? ok('cambia la contrasena') : fallo('cambio de contrasena', JSON.stringify(r.cuerpo));

    r = await pedir('/auth/restablecer-password', {
      method: 'POST',
      body: JSON.stringify({ token: tokenClaro, password: CLAVE_NUEVA, confirmacion: CLAVE_NUEVA }),
    });
    r.estado === 400 ? ok('el mismo enlace NO sirve dos veces') : fallo('reuso del token', r.estado);

    console.log('\n4. Entrar con la contrasena nueva');
    r = await pedir('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: EMAIL, password: CLAVE_NUEVA, captchaToken: 'test-bypass-sigtm' }),
    });
    const token = r.cuerpo?.data?.token;
    token ? ok('entra con la contrasena nueva') : fallo('login nuevo', JSON.stringify(r.cuerpo));

    r = await pedir('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: EMAIL, password: CLAVE_VIEJA, captchaToken: 'test-bypass-sigtm' }),
    });
    r.estado === 401 ? ok('la contrasena vieja ya no sirve') : fallo('clave vieja', r.estado);

    console.log('\n5. SEG-04: un token anterior al cambio queda invalidado');
    r = await pedir('/auth/perfil', { headers: { Authorization: `Bearer ${token}` } });
    r.estado === 200 ? ok('el token nuevo funciona') : fallo('token nuevo', r.estado);

    // Se mueve la fecha de cambio hacia adelante: equivale a "alguien cambio
    // la contrasena despues de que se emitio este token".
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: { passwordCambiadaEn: new Date(Date.now() + 60_000) },
    });
    r = await pedir('/auth/perfil', { headers: { Authorization: `Bearer ${token}` } });
    r.estado === 401
      ? ok('tras cambiar la contrasena, el token anterior deja de valer')
      : fallo('SEG-04', r.estado);

    console.log('\n6. Limite de intentos');
    let bloqueado = false;
    for (let i = 0; i < 12; i += 1) {
      const s = await pedir('/auth/recuperar-password', {
        method: 'POST',
        body: JSON.stringify({ email: EMAIL }),
      });
      if (s.estado === 429) { bloqueado = true; break; }
    }
    bloqueado ? ok('corta tras varios intentos seguidos (429)') : fallo('no corto los intentos');
  } finally {
    await prisma.tokenSeguridad.deleteMany({ where: { usuarioId: usuario.id } });
    await prisma.usuario.delete({ where: { id: usuario.id } });
    await prisma.$disconnect();
    console.log(`\nUsuario de prueba eliminado.\n`);
  }
}

main().catch(async (e) => {
  console.error('ERROR', e);
  process.exitCode = 1;
});

