// Recorrido con capturas de pantalla de la Actividad 6 (Playwright).
//
// Uso:
//   node pruebas/capturas-act6.cjs          recorrido local, sistema desplegado y diagrama de despliegue
//   node pruebas/capturas-act6.cjs github   solo las dos páginas de GitHub
//
// El recorrido local usa la aplicación en el puerto 3100 y entra por el formulario de
// login real, igual que una persona. Los datos de demostración llevan "Demostración" en
// el nombre y se borran al empezar para poder repetir el recorrido sin duplicados; los
// registros quedan en la base local como datos de ejemplo. Las pantallas del sistema
// desplegado son solo de lectura: se inicia sesión y se navega, sin enviar formularios.
// Las capturas son de la página del navegador; no se captura nada del resto del escritorio.
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'));
const { iniciarServidor, detenerServidor } = require('./servidor-local.cjs');

const RAIZ = path.resolve(__dirname, '..');
const CAPTURAS = path.join(RAIZ, 'evidencias', 'actividad-6', 'capturas');
const URL_PUBLICA = (process.env.URL_PUBLICA || 'https://pedidos-delta.onrender.com').replace(/\/$/, '');
const REPO = 'https://github.com/GustavoRodVe/sistema-pedidos-delta';
const CLAVE_DEMO = 'Delta2026';
const ESCRITORIO = { width: 1366, height: 800 };
const CELULAR = { width: 390, height: 844 };

fs.mkdirSync(CAPTURAS, { recursive: true });

async function foto(page, nombre, completa = false) {
  // Un momento para que terminen las transiciones de la interfaz antes de capturar.
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(CAPTURAS, `${nombre}.png`), fullPage: completa });
  console.log(`captura ${nombre}`);
}

// Inicia sesión con el formulario de la pantalla de login.
async function entrar(contexto, base, correo, clave = CLAVE_DEMO) {
  const page = await contexto.newPage();
  await page.goto(`${base}/login`, { waitUntil: 'networkidle', timeout: 180000 });
  await page.fill('#correo', correo);
  await page.fill('#clave', clave);
  await Promise.all([page.waitForURL(`${base}/`, { timeout: 180000 }), page.click('button[type=submit]')]);
  await page.waitForLoadState('networkidle');
  return page;
}

// Pulsa un botón que abre el cuadro de confirmación y lo confirma.
async function confirmar(page, textoBoton) {
  await page.click(`button:has-text("${textoBoton}")`);
  await page.waitForSelector('#modal-confirmar[open]');
  await Promise.all([page.waitForLoadState('load'), page.click('#modal-confirmar [data-accion=confirmar]')]);
  await page.waitForLoadState('networkidle');
}

async function recorridoLocal(browser) {
  const base = await iniciarServidor();
  const env = dotenv.parse(fs.readFileSync(path.join(RAIZ, '.env')));
  const bd = await mysql.createConnection({ host: env.DB_HOST || '127.0.0.1', port: Number(env.DB_PORT) || 3306, user: env.DB_USER, password: env.DB_PASSWORD, database: env.DB_NAME || 'delta_pedidos', decimalNumbers: true });
  const uno = async (consulta, params = []) => (await bd.query(consulta, params))[0][0];
  try {
    // Se borran los datos de demostración de una ejecución anterior.
    await bd.query("DELETE d FROM detalle_pedido d JOIN pedido p ON p.id_pedido = d.id_pedido JOIN farmacia f ON f.id_farmacia = p.id_farmacia WHERE f.nombre LIKE 'Farmacia Demostración%'");
    await bd.query("DELETE p FROM pedido p JOIN farmacia f ON f.id_farmacia = p.id_farmacia WHERE f.nombre LIKE 'Farmacia Demostración%'");
    await bd.query("DELETE FROM medicamento WHERE nombre LIKE '%Demostración%'");
    await bd.query("DELETE FROM farmacia WHERE nombre LIKE 'Farmacia Demostración%'");
    await bd.query("DELETE FROM categoria WHERE nombre LIKE '%Demostración%'");
    await bd.query("DELETE FROM usuario WHERE correo LIKE 'demostracion%'");

    const ctx = (viewport) => browser.newContext({ viewport, locale: 'es-BO' });

    // 01 y 02: pantalla de login y error de credenciales
    const anonimo = await (await ctx(ESCRITORIO)).newPage();
    await anonimo.goto(`${base}/login`, { waitUntil: 'networkidle' });
    await foto(anonimo, '01-login');
    await anonimo.fill('#correo', 'admin@delta.test');
    await anonimo.fill('#clave', 'claveIncorrecta99');
    await Promise.all([anonimo.waitForLoadState('load'), anonimo.click('button[type=submit]')]);
    await foto(anonimo, '02-login-error');

    // 03 a 05: panel de cada rol
    const admin = await entrar(await ctx(ESCRITORIO), base, 'admin@delta.test');
    await foto(admin, '03-panel-administrador');
    const ventas = await entrar(await ctx(ESCRITORIO), base, 'ventas@delta.test');
    await foto(ventas, '04-panel-ventas');
    const almacen = await entrar(await ctx(ESCRITORIO), base, 'almacen@delta.test');
    await foto(almacen, '05-panel-almacen');

    // 06: menú en el celular
    const celAdmin = await entrar(await ctx(CELULAR), base, 'admin@delta.test');
    await celAdmin.click('.boton-menu');
    await foto(celAdmin, '06-menu-celular', true);

    // Farmacias: 08 formulario lleno, 07 listado con el mensaje de registro
    const llenarFarmacia = async (page, d) => {
      await page.fill('#nombre', d.nombre);
      await page.fill('#nit', d.nit);
      await page.fill('#responsable', d.responsable);
      await page.fill('#telefono', d.telefono);
      await page.fill('#direccion', d.direccion);
      await page.selectOption('#zona', d.zona);
    };
    const f1 = { nombre: 'Farmacia Demostración Cercado', nit: '9100000011', responsable: 'Ana Pérez', telefono: '4 4251234', direccion: 'Av. Heroínas 100', zona: 'Centro' };
    const f2 = { nombre: 'Farmacia Demostración Quillacollo', nit: '9100000022', responsable: 'Luis Rojas', telefono: '4 4367890', direccion: 'Calle Bolívar 250', zona: 'Quillacollo' };
    await admin.goto(`${base}/farmacias/nueva`);
    await llenarFarmacia(admin, f1);
    await foto(admin, '08-farmacias-formulario');
    await Promise.all([admin.waitForURL('**/farmacias?ok=registrada'), admin.click('main button[type=submit]')]);
    await admin.goto(`${base}/farmacias/nueva`);
    await llenarFarmacia(admin, f2);
    await Promise.all([admin.waitForURL('**/farmacias?ok=registrada'), admin.click('main button[type=submit]')]);
    await admin.waitForLoadState('networkidle');
    await foto(admin, '07-farmacias-listado');

    // 09: error de validación del servidor. Se envía el formulario con submit() del
    // prototipo de HTMLFormElement, que se salta la validación del navegador.
    await admin.goto(`${base}/farmacias/nueva`);
    await llenarFarmacia(admin, { ...f1, nombre: 'Farmacia Demostración Prueba', nit: 'ABC12' });
    await Promise.all([
      admin.waitForLoadState('load'),
      admin.evaluate(() => HTMLFormElement.prototype.submit.call(document.querySelector('form[action="/farmacias"]')))
    ]);
    await foto(admin, '09-farmacias-validacion');

    // 10 detalle, 11 editada, 12 cuadro de desactivar
    const idF1 = (await uno('SELECT id_farmacia FROM farmacia WHERE nit = ?', [f1.nit])).id_farmacia;
    await admin.goto(`${base}/farmacias/${idF1}`);
    await foto(admin, '10-farmacias-detalle');
    await admin.goto(`${base}/farmacias/${idF1}/editar`);
    await admin.fill('#telefono', '4 4259999');
    await Promise.all([admin.waitForURL(`**/farmacias/${idF1}?ok=actualizada`), admin.click('main button[type=submit]')]);
    await foto(admin, '11-farmacias-editada');
    await admin.click('button:has-text("Desactivar")');
    await admin.waitForSelector('#modal-confirmar[open]');
    await foto(admin, '12-farmacias-desactivar');
    await admin.click('#modal-confirmar [data-accion=cancelar]');

    // Medicamentos: 14 formulario, 13 listado
    const meds = [
      { nombre: 'Amoxicilina Demostración 250 mg', presentacion: 'Caja de 20 cápsulas', categoria: 'Antibióticos', precio: '45.50', stock: '40' },
      { nombre: 'Ibuprofeno Demostración 400 mg', presentacion: 'Caja de 50 tabletas', categoria: 'Analgésicos', precio: '38.00', stock: '25' }
    ];
    for (const [i, m] of meds.entries()) {
      await admin.goto(`${base}/medicamentos/nuevo`);
      await admin.fill('#nombre', m.nombre);
      await admin.fill('#presentacion', m.presentacion);
      await admin.selectOption('#id_categoria', { label: m.categoria });
      await admin.fill('#precio_mayorista', m.precio);
      await admin.fill('#stock', m.stock);
      if (i === 0) await foto(admin, '14-medicamentos-formulario');
      await Promise.all([admin.waitForURL('**/medicamentos?ok=registrado'), admin.click('main button[type=submit]')]);
    }
    await admin.waitForLoadState('networkidle');
    await foto(admin, '13-medicamentos-listado');

    // 15: categorías
    await admin.goto(`${base}/categorias`);
    await admin.fill('#nombre', 'Dermatológicos Demostración');
    await admin.fill('#descripcion', 'Cremas y ungüentos de uso externo');
    await Promise.all([admin.waitForURL('**/categorias?ok=registrada'), admin.click('main button[type=submit]')]);
    await foto(admin, '15-categorias');

    // Usuarios: 17 formulario, 16 listado
    await admin.goto(`${base}/usuarios/nuevo`);
    await admin.fill('#nombre_completo', 'Usuario Demostración');
    await admin.fill('#correo', 'demostracion@delta.test');
    await admin.fill('#clave', 'Demo2026x');
    await admin.selectOption('#id_rol', { label: 'Ejecutivo de ventas' });
    await foto(admin, '17-usuarios-formulario');
    await Promise.all([admin.waitForURL('**/usuarios?ok=registrado'), admin.click('main button[type=submit]')]);
    await foto(admin, '16-usuarios-listado');

    // Pedidos. 18 formulario con dos líneas y total estimado, 19 pedido pendiente
    const idM1 = (await uno('SELECT id_medicamento FROM medicamento WHERE nombre = ?', [meds[0].nombre])).id_medicamento;
    const idM2 = (await uno('SELECT id_medicamento FROM medicamento WHERE nombre = ?', [meds[1].nombre])).id_medicamento;
    await ventas.goto(`${base}/pedidos/nuevo`);
    await ventas.selectOption('#id_farmacia', String(idF1));
    await ventas.fill('#observacion', 'Entrega en la mañana');
    await ventas.locator('select[name=id_medicamento]').nth(0).selectOption(String(idM1));
    await ventas.locator('input[name=cantidad]').nth(0).fill('3');
    await ventas.click('#agregar-linea');
    await ventas.locator('select[name=id_medicamento]').nth(1).selectOption(String(idM2));
    await ventas.locator('input[name=cantidad]').nth(1).fill('2');
    await foto(ventas, '18-pedido-formulario');
    await Promise.all([ventas.waitForURL('**/pedidos/*?ok=registrado'), ventas.click('button:has-text("Guardar pedido")')]);
    await foto(ventas, '19-pedido-pendiente');
    const idPedido = Number(/\/pedidos\/(\d+)/.exec(ventas.url())[1]);

    // 20 despachado y 21 entregado (rol almacén)
    await almacen.goto(`${base}/pedidos/${idPedido}`);
    await confirmar(almacen, 'Despachar');
    await foto(almacen, '20-pedido-despachado');
    await confirmar(almacen, 'Marcar como entregado');
    await foto(almacen, '21-pedido-entregado');

    // 22 sin stock y 23 anulado: pedido con una cantidad mayor que el stock
    await ventas.goto(`${base}/pedidos/nuevo`);
    await ventas.selectOption('#id_farmacia', String(idF1));
    await ventas.locator('select[name=id_medicamento]').nth(0).selectOption(String(idM1));
    await ventas.locator('input[name=cantidad]').nth(0).fill('500');
    await Promise.all([ventas.waitForURL('**/pedidos/*?ok=registrado'), ventas.click('button:has-text("Guardar pedido")')]);
    const idSinStock = Number(/\/pedidos\/(\d+)/.exec(ventas.url())[1]);
    await almacen.goto(`${base}/pedidos/${idSinStock}`);
    await confirmar(almacen, 'Despachar');
    await foto(almacen, '22-pedido-sin-stock');
    await ventas.goto(`${base}/pedidos/${idSinStock}`);
    await confirmar(ventas, 'Anular pedido');
    await foto(ventas, '23-pedido-anulado');

    // 24 filtro por estado, 25 reporte
    await admin.goto(`${base}/pedidos`);
    await admin.selectOption('#estado', 'entregado');
    await Promise.all([admin.waitForLoadState('load'), admin.click('button:has-text("Filtrar")')]);
    await foto(admin, '24-pedidos-filtro');
    await admin.goto(`${base}/reportes/pedidos`);
    await admin.selectOption('#farmacia', String(idF1));
    await Promise.all([admin.waitForLoadState('load'), admin.click('button:has-text("Generar reporte")')]);
    await foto(admin, '25-reporte');

    // 26 acceso denegado
    await almacen.goto(`${base}/farmacias`);
    await foto(almacen, '26-acceso-denegado');

    // 27 y 28 en el celular (ventas)
    const celVentas = await entrar(await ctx(CELULAR), base, 'ventas@delta.test');
    await celVentas.goto(`${base}/pedidos`);
    await foto(celVentas, '27-celular-pedidos', true);
    await celVentas.goto(`${base}/pedidos/nuevo`);
    await celVentas.selectOption('#id_farmacia', String(idF1));
    await celVentas.locator('select[name=id_medicamento]').nth(0).selectOption(String(idM2));
    await celVentas.locator('input[name=cantidad]').nth(0).fill('4');
    await foto(celVentas, '28-celular-pedido-formulario', true);

    // El usuario de demostración no se deja: solo era para mostrar el formulario y el listado.
    await bd.query("DELETE FROM usuario WHERE correo LIKE 'demostracion%'");
  } finally {
    await bd.end();
    detenerServidor();
  }
}

// Sistema desplegado: solo lectura
async function recorridoDesplegado(browser) {
  const ctxEsc = await browser.newContext({ viewport: ESCRITORIO, locale: 'es-BO' });
  const anonimo = await ctxEsc.newPage();
  await anonimo.goto(`${URL_PUBLICA}/login`, { waitUntil: 'networkidle', timeout: 180000 });
  await foto(anonimo, '29-desplegado-login');
  const admin = await entrar(ctxEsc, URL_PUBLICA, 'admin@delta.test');
  await foto(admin, '30-desplegado-panel');
  await admin.goto(`${URL_PUBLICA}/pedidos`, { waitUntil: 'networkidle' });
  await foto(admin, '31-desplegado-pedidos');
  const cel = await entrar(await browser.newContext({ viewport: CELULAR, locale: 'es-BO' }), URL_PUBLICA, 'admin@delta.test');
  await cel.goto(`${URL_PUBLICA}/farmacias`, { waitUntil: 'networkidle' });
  await foto(cel, '32-desplegado-celular', true);
}

// Páginas públicas de GitHub
async function recorridoGithub(browser) {
  const page = await (await browser.newContext({ viewport: { width: 1366, height: 900 }, locale: 'es-BO' })).newPage();
  await page.goto(REPO, { waitUntil: 'networkidle', timeout: 60000 });
  await foto(page, '34-github-repositorio');
  await page.goto(`${REPO}/commits/main`, { waitUntil: 'networkidle', timeout: 60000 });
  await foto(page, '35-github-commits');
}

// Diagrama de despliegue: el SVG hecho a mano se convierte en PNG con el doble de resolución.
async function diagrama(browser) {
  const svg = path.join(RAIZ, 'diagramas', 'c4-despliegue.svg');
  const page = await browser.newPage({ viewport: { width: 1720, height: 850 }, deviceScaleFactor: 2 });
  await page.goto('file:///' + svg.split(path.sep).join('/').replace(/ /g, '%20'));
  await page.screenshot({ path: path.join(RAIZ, 'diagramas', 'c4-despliegue.png') });
  await page.close();
  console.log('diagrama c4-despliegue.png');
}

(async () => {
  const modo = process.argv[2] || 'todo';
  const browser = await chromium.launch();
  try {
    if (modo === 'github') {
      await recorridoGithub(browser);
    } else {
      await recorridoLocal(browser);
      await recorridoDesplegado(browser);
      await diagrama(browser);
    }
  } finally {
    await browser.close();
  }
})().catch((e) => { detenerServidor(); console.error(e.message); process.exit(1); });
