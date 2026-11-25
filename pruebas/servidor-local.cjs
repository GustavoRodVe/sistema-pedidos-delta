// Arranca y detiene la aplicación para las pruebas y las capturas.
// Levanta "node src/app.js" en el puerto 3100 (así no choca con el servidor de
// desarrollo que suele estar en el 3000) y espera a que la página de login responda.
// Si se define la variable BASE_URL no se arranca nada y se usa ese servidor.
const path = require('path');
const { spawn } = require('child_process');

const RAIZ_APP = path.resolve(__dirname, '..');
const PUERTO = 3100;
let hijo = null;

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function responde(url) {
  try {
    const r = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(2000) });
    return r.status;
  } catch {
    return 0;
  }
}

// Devuelve la dirección base del servidor listo para recibir solicitudes.
async function iniciarServidor() {
  if (process.env.BASE_URL) return process.env.BASE_URL;
  const base = `http://localhost:${PUERTO}`;
  if (await responde(`${base}/login`)) {
    throw new Error(`El puerto ${PUERTO} ya está ocupado. Cierre lo que lo usa y vuelva a ejecutar.`);
  }
  let salio = null;
  hijo = spawn(process.execPath, ['src/app.js'], {
    cwd: RAIZ_APP,
    env: { ...process.env, PORT: String(PUERTO), NODE_ENV: 'development' },
    stdio: 'ignore'
  });
  hijo.on('exit', (codigo) => { salio = codigo; });
  for (let i = 0; i < 40; i++) {
    if (salio !== null) throw new Error(`La aplicación se cerró al arrancar (código ${salio}). Revise el archivo .env y que MySQL esté encendido.`);
    if ((await responde(`${base}/login`)) === 200) return base;
    await esperar(500);
  }
  detenerServidor();
  throw new Error('La aplicación no respondió en 20 segundos.');
}

function detenerServidor() {
  if (hijo) {
    hijo.kill();
    hijo = null;
  }
}

module.exports = { iniciarServidor, detenerServidor, PUERTO };
