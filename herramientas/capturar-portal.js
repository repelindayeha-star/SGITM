// Comprueba de verdad que el portal del cliente se ve con datos: entra como
// Marcela y guarda lo que sale en pantalla.
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const API = 'http://localhost:3001/api';
const WEB = 'http://localhost:5173';
const SALIDA = path.join(__dirname, 'presentacion', 'capturas');
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const r = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'marcela.ospina@ejemplo.com',
      password: 'Sigtm2026*',
      captchaToken: 'test-bypass-sigtm',
    }),
  });
  const j = await r.json();
  if (!j.exito) throw new Error(j.mensaje);
  console.log(`Sesion de ${j.data.usuario.nombre} (${j.data.usuario.rol})`);

  fs.mkdirSync(SALIDA, { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--hide-scrollbars'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950, deviceScaleFactor: 2 });

  await page.goto(`${WEB}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((s) => {
    sessionStorage.setItem('token', s.token);
    sessionStorage.setItem('usuario', JSON.stringify(s.usuario));
  }, j.data);

  await page.goto(`${WEB}/mis-ordenes`, { waitUntil: 'networkidle2', timeout: 60000 });
  await esperar(4000);

  const texto = await page.evaluate(() => document.body.innerText.slice(0, 700));
  console.log('\n--- lo que se ve en la pantalla ---\n' + texto);

  const destino = path.join(SALIDA, 'captura-09-portal-cliente.png');
  await page.screenshot({ path: destino });
  console.log(`\nGuardada: ${destino}`);

  await browser.close();
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
