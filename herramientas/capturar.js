// Captura las pantallas reales de SIGTM para la presentacion.
//
// No dibuja nada ni imita nada: abre la aplicacion que esta corriendo en este
// mismo computador con el Chrome instalado y guarda lo que se ve.
//
// La sesion se inicia llamando a la API con el token de desarrollo que el
// propio proyecto trae para pruebas automatizadas (captcha.service.js), y el
// resultado se deja en localStorage igual que lo dejaria la pantalla de login.

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const API = 'http://localhost:3001/api';
const WEB = 'http://localhost:5173';
const SALIDA = path.join(__dirname, 'presentacion', 'capturas');
const PASS = 'Sigtm2026*';
const CAPTCHA = 'test-bypass-sigtm';

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function entrar(email) {
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: PASS, captchaToken: CAPTCHA }),
  });
  const j = await r.json();
  if (!j.exito) throw new Error(`login ${email}: ${j.mensaje}`);
  return { token: j.data.token, usuario: j.data.usuario };
}

async function idDeOrden(token, codigo) {
  const r = await fetch(`${API}/ordenes?limite=100`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const j = await r.json();
  const lista = j.data?.ordenes || j.data || [];
  const o = lista.find((x) => x.codigo === codigo);
  return o ? o.id : (lista[0] && lista[0].id);
}

async function tomar(browser, { nombre, url, sesion, ancho = 1440, alto = 900, movil = false, espera = 3500 }) {
  const page = await browser.newPage();
  await page.setViewport({ width: ancho, height: alto, deviceScaleFactor: 2, isMobile: movil });

  // Dejar la sesion puesta antes de que cargue la aplicacion.
  if (sesion) {
    await page.goto(`${WEB}/login`, { waitUntil: 'domcontentloaded' });
    await page.evaluate((s) => {
      localStorage.setItem('token', s.token);
      localStorage.setItem('usuario', JSON.stringify(s.usuario));
    }, sesion);
  }

  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});
  await esperar(espera);

  const destino = path.join(SALIDA, nombre);
  await page.screenshot({ path: destino, fullPage: false });
  const kb = Math.round(fs.statSync(destino).size / 1024);
  console.log(`  OK  ${nombre}  (${kb} KB)`);
  await page.close();
}

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });

  console.log('Iniciando sesiones...');
  const admin = await entrar('admin@sigtm.com');
  const recepcion = await entrar('recepcion@sigtm.com');
  const mecanico = await entrar('mecanico1@sigtm.com');
  console.log('  tres sesiones listas');

  const ordenId = await idDeOrden(recepcion.token, 'OT-2026-DEMO05');
  console.log(`  orden OT-2026-DEMO05 -> ${ordenId}`);

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--hide-scrollbars', '--force-device-scale-factor=1'],
  });

  console.log('Capturando...');
  const trabajos = [
    { nombre: 'captura-01-seguimiento.png', url: `${WEB}/seguimiento/OT-2026-DEMO05` },
    { nombre: 'captura-02-orden-detalle.png', url: `${WEB}/ordenes/${ordenId}`, sesion: recepcion, alto: 1000 },
    { nombre: 'captura-03-ordenes-lista.png', url: `${WEB}/ordenes`, sesion: recepcion },
    { nombre: 'captura-04-diagnostico.png', url: `${WEB}/ordenes/${ordenId}`, sesion: mecanico, alto: 1000 },
    { nombre: 'captura-05-seguimiento-sin-datos.png', url: `${WEB}/seguimiento/OT-2026-DEMO05`, alto: 1000 },
    { nombre: 'captura-06-inventario.png', url: `${WEB}/inventario`, sesion: recepcion },
    { nombre: 'captura-07-dashboard.png', url: `${WEB}/dashboard`, sesion: admin },
    { nombre: 'captura-08-celular.png', url: `${WEB}/seguimiento/OT-2026-DEMO05`, ancho: 420, alto: 880, movil: true },
  ];

  for (const t of trabajos) {
    try {
      await tomar(browser, t);
    } catch (e) {
      console.log(`  FALLA ${t.nombre}: ${e.message}`);
    }
  }

  await browser.close();
  console.log(`\nListo. Carpeta: ${SALIDA}`);
})().catch((e) => {
  console.error('ERROR GENERAL:', e.message);
  process.exit(1);
});
