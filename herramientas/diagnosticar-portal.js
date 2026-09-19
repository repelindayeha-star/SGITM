// Abre el portal como Marcela y registra TODO lo que hace el navegador:
// consola, peticiones y respuestas. Para saber por que queda en "Cargando".
const puppeteer = require('puppeteer-core');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const API = 'http://localhost:3001/api';
const WEB = 'http://localhost:5173';
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
  console.log('Sesion:', j.data.usuario.nombre);
  console.log('Forma del usuario guardado:', JSON.stringify(j.data.usuario));

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  page.on('console', (m) => console.log(`  [consola:${m.type()}] ${m.text()}`));
  page.on('pageerror', (e) => console.log(`  [error de pagina] ${e.message}`));
  page.on('requestfailed', (req) =>
    console.log(`  [peticion fallida] ${req.url()} :: ${req.failure()?.errorText}`)
  );
  page.on('response', async (res) => {
    const u = res.url();
    if (!u.includes(':3001')) return;
    let cuerpo = '';
    if (res.status() >= 400) {
      cuerpo = ' :: ' + (await res.text().catch(() => '')).slice(0, 200);
    }
    console.log(`  [respuesta ${res.status()}] ${u.replace('http://localhost:3001', '')}${cuerpo}`);
  });

  await page.goto(`${WEB}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((s) => {
    localStorage.setItem('token', s.token);
    localStorage.setItem('usuario', JSON.stringify(s.usuario));
  }, j.data);

  console.log('\n--- abriendo /mis-ordenes ---');
  await page.goto(`${WEB}/mis-ordenes`, { waitUntil: 'networkidle2', timeout: 60000 });
  await esperar(10000);

  console.log('\n--- lo que quedo en pantalla ---');
  const t = await page.evaluate(() => document.body.innerText.slice(0, 400));
  console.log(t);

  await browser.close();
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
