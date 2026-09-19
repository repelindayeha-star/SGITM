// Captura las pantallas nuevas del modulo de activacion.
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const API = 'http://localhost:3001/api';
const WEB = 'http://localhost:5173';
const SALIDA = path.join(__dirname, '..', 'presentacion', 'capturas');
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  fs.mkdirSync(SALIDA, { recursive: true });

  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'recepcion@sigtm.com',
      password: 'Sigtm2026*',
      captchaToken: 'test-bypass-sigtm',
    }),
  });
  const sesion = (await r.json()).data;

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars'],
  });

  async function tomar(nombre, url, { conSesion = false, alto = 900, antes } = {}) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: alto, deviceScaleFactor: 2 });
    if (conSesion) {
      await page.goto(`${WEB}/login`, { waitUntil: 'domcontentloaded' });
      await page.evaluate((s) => {
        localStorage.setItem('token', s.token);
        localStorage.setItem('usuario', JSON.stringify(s.usuario));
      }, sesion);
    }
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});
    await esperar(5000);
    if (antes) await antes(page);
    const destino = path.join(SALIDA, nombre);
    await page.screenshot({ path: destino });
    console.log(`  ${nombre}  (${Math.round(fs.statSync(destino).size / 1024)} KB)`);
    await page.close();
  }

  console.log('Capturando:');
  await tomar('captura-10-nuevo-cliente.png', `${WEB}/clientes/nuevo`, { conSesion: true });
  await tomar('captura-11-activar-paso1.png', `${WEB}/activar`);
  await tomar('captura-12-activar-paso2.png', `${WEB}/activar`, {
    antes: async (page) => {
      // Pasar al segundo paso con "Ya tengo un codigo", para que se vea el
      // formulario del codigo y la contrasena.
      const botones = await page.$$('button');
      for (const b of botones) {
        const txt = await page.evaluate((el) => el.textContent, b);
        if (txt && txt.includes('Ya tengo un codigo')) {
          await b.click();
          break;
        }
      }
      await esperar(1200);
    },
  });

  await browser.close();
  console.log('\nListo.');
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
