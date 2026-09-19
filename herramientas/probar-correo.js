// Prueba de verdad que los correos salen y llegan.
//
// No simula nada: usa el mismo servicio que usa la aplicacion, con la
// configuracion real del .env. Si esto llega a la bandeja, la recuperacion de
// contrasena y el codigo de verificacion tambien van a llegar.

require('dotenv').config();

const env = require('../src/config/env');
const correo = require('../src/services/correo.service');
const plantillas = require('../src/plantillas/correo');

const DESTINO = process.argv[2] || 'repelindayeha@gmail.com';

(async () => {
  console.log('=== CONFIGURACION QUE VE EL SERVIDOR ===');
  console.log(`  proveedor configurado : ${env.smtp.configurado ? 'SI' : 'NO (bandeja de prueba)'}`);
  console.log(`  servidor              : ${env.smtp.host || '(vacio)'}`);
  console.log(`  puerto                : ${env.smtp.puerto}`);
  console.log(`  usuario               : ${env.smtp.usuario || '(vacio)'}`);
  console.log(`  clave                 : ${env.smtp.password ? `definida (${env.smtp.password.length} caracteres)` : 'VACIA'}`);
  console.log(`  remitente             : ${env.smtp.remitente}`);
  console.log('');

  console.log('=== 1. ¿RESPONDE EL PROVEEDOR? ===');
  const conexion = await correo.verificarConexion();
  if (!conexion.ok) {
    console.log(`  NO. Motivo: ${conexion.error}`);
    console.log('');
    console.log('  Causas habituales:');
    console.log('   - la clave SMTP esta mal copiada o tiene espacios');
    console.log('   - el telefono de la cuenta de Brevo no esta verificado');
    console.log('   - la direccion IP de este computador no esta autorizada en Brevo');
    process.exit(1);
  }
  console.log(`  SI${conexion.esPrueba ? ' (pero es la bandeja de prueba, no llega a nadie)' : ''}`);
  console.log('');

  console.log(`=== 2. ENVIANDO UNO DE VERDAD A ${DESTINO} ===`);
  const mensaje = plantillas.recuperacionPassword({
    nombre: 'Dayana',
    enlace: `${env.urlFrontend}/restablecer-password?token=PRUEBA-NO-FUNCIONAL`,
    minutos: 30,
  });

  const resultado = await correo.enviar({
    para: DESTINO,
    asunto: `[PRUEBA] ${mensaje.asunto}`,
    html: mensaje.html,
    texto: mensaje.texto,
  });

  console.log('');
  if (resultado.enviado) {
    console.log('  ENVIADO. Revisa la bandeja (y la carpeta de correo no deseado).');
    if (!env.smtp.configurado) {
      console.log('  OJO: salio por la bandeja de prueba, asi que NO llega al destinatario real.');
    }
  } else {
    console.log(`  FALLO: ${resultado.error}`);
  }

  process.exit(resultado.enviado ? 0 : 1);
})().catch((e) => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
