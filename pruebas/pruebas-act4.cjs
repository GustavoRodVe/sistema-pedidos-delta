// Pruebas de la Actividad 4: funcionales e de integración por HTTP contra el
// servidor local y contra la URL pública del despliegue, con comprobación en MySQL.
// Uso: node pruebas-act4.cjs <url pública>
const path = require('path');
const fs = require('fs');
const { execFileSync } = require('child_process');
const { chromium } = require(path.join(require('child_process').execSync('npm root -g').toString().trim(), 'playwright'));

const LOCAL = 'http://localhost:3000';
const PUBLICA = process.argv[2];
const OUT = 'C:/Universidad/Desarrolo de Sistemas II/sistema-pedidos-delta/evidencias/actividad-4';
const BIN = 'C:/Program Files/MySQL/MySQL Server 8.4/bin';
const cred = fs.readFileSync('C:/Users/S16/mysql/credenciales.txt', 'utf8');
const APP_PASS = /delta_app: (\S+)/.exec(cred)[1];
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'capturas'), { recursive: true });

function sql(q) {
  return execFileSync(path.join(BIN, 'mysql.exe'), ['-udelta_app', `-p${APP_PASS}`, '-h127.0.0.1', '--default-character-set=utf8mb4', '-N', '-B', 'delta_pedidos', '-e', q], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
}
async function pedir(base, ruta, cuerpo) {
  const op = { redirect: 'manual' };
  if (cuerpo) { op.method = 'POST'; op.headers = { 'Content-Type': 'application/x-www-form-urlencoded' }; op.body = new URLSearchParams(cuerpo).toString(); }
  const r = await fetch(base + ruta, op);
  return { status: r.status, location: r.headers.get('location') || '', html: await r.text() };
}

const resultados = [];
function registrar(id, tipo, caso, esperado, obtenido, ok) {
  resultados.push({ id, tipo, caso, esperado, obtenido, estado: ok ? 'Correcto' : 'Falla' });
  console.log(`${id} ${ok ? 'OK   ' : 'FALLA'} ${caso} -> ${obtenido}`);
}
const sufijo = String(Date.now()).slice(-7);
const nit = '88' + sufijo;
const farmacia = { nombre: `Farmacia Prueba ${sufijo}`, nit, responsable: 'Ana Pérez', telefono: '4 4251234', direccion: 'Av. Heroínas 100', zona: 'Centro' };

(async () => {
  let r;
  // Pruebas funcionales
  r = await pedir(LOCAL, '/');
  registrar('PF-01', 'Funcional', 'Abrir el panel principal', '200 y panel visible', `${r.status}`, r.status === 200 && /Panel/i.test(r.html));
  r = await pedir(LOCAL, '/farmacias');
  registrar('PF-02', 'Funcional', 'Listar farmacias', '200 con tabla de farmacias', `${r.status}`, r.status === 200 && /<table/i.test(r.html));
  r = await pedir(LOCAL, '/farmacias', farmacia);
  registrar('PF-03', 'Funcional', 'Registrar farmacia con datos válidos', 'Redirección a /farmacias?ok=registrada', `${r.status} ${r.location}`, r.status === 302 && r.location.includes('ok=registrada'));
  r = await pedir(LOCAL, '/farmacias', { ...farmacia, nit: '12AB' });
  registrar('PF-04', 'Funcional', 'Registrar farmacia con NIT no numérico', 'Formulario con error del NIT, sin guardar', `${r.status}, mensaje: ${/solo números/.test(r.html) ? 'sí' : 'no'}`, r.status >= 400 && /solo números/.test(r.html));
  r = await pedir(LOCAL, '/farmacias', { ...farmacia, nombre: 'Otra farmacia' });
  registrar('PF-05', 'Funcional', 'Registrar farmacia con NIT repetido', 'Mensaje de NIT ya registrado', `${r.status}`, r.status >= 400 && /NIT/i.test(r.html));
  r = await pedir(LOCAL, '/farmacias', { ...farmacia, nit: '99' + sufijo, zona: 'Marte' });
  registrar('PF-06', 'Funcional', 'Registrar farmacia con zona fuera de la lista', 'Error de zona no válida', `${r.status}`, r.status >= 400 && /zona seleccionada no es válida/.test(r.html));
  const idF = sql(`SELECT id_farmacia FROM farmacia WHERE nit='${nit}'`);
  r = await pedir(LOCAL, `/farmacias/${idF}/editar`, { ...farmacia, telefono: '4 4259999' });
  registrar('PF-07', 'Funcional', 'Editar teléfono de la farmacia', 'Redirección con ok=actualizada', `${r.status} ${r.location}`, r.status === 302 && r.location.includes('ok=actualizada'));
  const idCat = sql('SELECT id_categoria FROM categoria ORDER BY id_categoria LIMIT 1');
  const med = { nombre: `Paracetamol Prueba ${sufijo}`, presentacion: 'Caja x 20 tabletas 500 mg', id_categoria: idCat, precio_mayorista: '12.50', stock: '300' };
  r = await pedir(LOCAL, '/medicamentos', med);
  registrar('PF-08', 'Funcional', 'Registrar medicamento válido', 'Redirección con ok', `${r.status} ${r.location}`, r.status === 302);
  r = await pedir(LOCAL, '/medicamentos', { ...med, nombre: med.nombre + ' B', stock: '-5' });
  registrar('PF-09', 'Funcional', 'Registrar medicamento con stock negativo', 'Error de stock', `${r.status}`, r.status >= 400 && /stock no puede ser negativo/.test(r.html));
  r = await pedir(LOCAL, '/medicamentos', { ...med, nombre: med.nombre + ' C', precio_mayorista: '0' });
  registrar('PF-10', 'Funcional', 'Registrar medicamento con precio cero', 'Error de precio', `${r.status}`, r.status >= 400 && /mayor que cero/.test(r.html));
  r = await pedir(LOCAL, '/no-existe');
  registrar('PF-11', 'Funcional', 'Abrir una ruta inexistente', 'Página 404', `${r.status}`, r.status === 404);
  r = await pedir(LOCAL, '/farmacias/abc');
  registrar('PF-12', 'Funcional', 'Abrir farmacia con id no numérico', 'Página 404, sin error 500', `${r.status}`, r.status === 404);
  r = await pedir(LOCAL, '/farmacias', { ...farmacia, nit: '77' + sufijo, nombre: '<script>alert(1)</script>' });
  const idX = sql(`SELECT id_farmacia FROM farmacia WHERE nit='77${sufijo}'`);
  r = await pedir(LOCAL, `/farmacias/${idX}`);
  registrar('PF-13', 'Funcional', 'Nombre con etiqueta <script> (inyección HTML)', 'Se muestra como texto escapado', /&lt;script&gt;/.test(r.html) ? 'escapado' : 'sin escapar', /&lt;script&gt;/.test(r.html) && !/<script>alert/.test(r.html));

  // Pruebas de integración
  const fila = sql(`SELECT nombre, telefono, zona, activo FROM farmacia WHERE nit='${nit}'`);
  registrar('PI-01', 'Integración', 'Formulario, controlador, modelo y MySQL guardan la farmacia', `Fila con ${farmacia.nombre}, 4 4259999, Centro, 1`, fila.replace(/\t/g, ', '), fila === `${farmacia.nombre}\t4 4259999\tCentro\t1`);
  const cuenta = sql(`SELECT COUNT(*) FROM farmacia WHERE nit IN ('12AB','99${sufijo}')`);
  registrar('PI-02', 'Integración', 'Los datos rechazados no llegan a la base', '0 filas', `${cuenta} filas`, cuenta === '0');
  r = await pedir(LOCAL, `/farmacias/${idF}/desactivar`, {});
  const activo = sql(`SELECT activo FROM farmacia WHERE id_farmacia=${idF}`);
  r = await pedir(LOCAL, '/farmacias');
  registrar('PI-03', 'Integración', 'Desactivar farmacia (borrado lógico) y que salga del listado', 'activo = 0 y no aparece', `activo = ${activo}, en listado: ${r.html.includes(farmacia.nombre) ? 'sí' : 'no'}`, activo === '0' && !r.html.includes(farmacia.nombre));
  r = await pedir(LOCAL, '/farmacias', { ...farmacia, nombre: `Farmacia Reabierta ${sufijo}` });
  const reab = sql(`SELECT CONCAT(nombre, ', activo=', activo) FROM farmacia WHERE nit='${nit}'`);
  registrar('PF-14', 'Funcional', 'Registrar de nuevo el NIT de una farmacia desactivada (regresión ERR-01)', 'Se reactiva con los datos nuevos (ok=reactivada)', `${r.status} ${r.location}; ${reab}`, r.status === 302 && r.location.includes('ok=reactivada') && reab.endsWith('activo=1'));
  sql(`UPDATE farmacia SET activo=0 WHERE nit='${nit}'`);
  r = await pedir(LOCAL, '/medicamentos');
  const nomCat = sql(`SELECT nombre FROM categoria WHERE id_categoria=${idCat}`);
  registrar('PI-04', 'Integración', 'Listado de medicamentos une medicamento y categoría', `Muestra ${med.nombre} con ${nomCat}`, r.html.includes(med.nombre) && r.html.includes(nomCat) ? 'sí' : 'no', r.html.includes(med.nombre) && r.html.includes(nomCat));
  r = await pedir(PUBLICA, '/');
  registrar('PI-05', 'Integración', 'Sistema desplegado responde por HTTPS desde Internet', '200', `${r.status}`, r.status === 200);
  const nitP = '66' + sufijo;
  r = await pedir(PUBLICA, '/farmacias', { ...farmacia, nit: nitP, nombre: `Farmacia Remota ${sufijo}` });
  const remota = sql(`SELECT COUNT(*) FROM farmacia WHERE nit='${nitP}'`);
  registrar('PI-06', 'Integración', 'Registro hecho en la URL pública llega a MySQL', '302 y 1 fila en la base', `${r.status}, ${remota} fila`, r.status === 302 && remota === '1');

  // Capturas del sistema desplegado
  const nav = await chromium.launch();
  const capturas = [];
  for (const [nombre, ruta, ancho] of [['desplegado-panel', '/', 1366], ['desplegado-farmacias', '/farmacias', 1366], ['desplegado-medicamentos', '/medicamentos', 1366], ['desplegado-celular', '/farmacias', 390], ['desplegado-404', '/no-existe', 1366]]) {
    const page = await nav.newPage({ viewport: { width: ancho, height: 800 } });
    await page.goto(PUBLICA + ruta, { waitUntil: 'networkidle' });
    const archivo = `${String(capturas.length + 1).padStart(2, '0')}-${nombre}.png`;
    await page.screenshot({ path: path.join(OUT, 'capturas', archivo), fullPage: ancho < 500 });
    capturas.push(archivo);
    await page.close();
  }
  const page = await nav.newPage({ viewport: { width: 1366, height: 800 } });
  await page.goto(`${PUBLICA}/farmacias/${idX}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(OUT, 'capturas', '06-escapado-script.png') });
  capturas.push('06-escapado-script.png');
  await nav.close();

  // Limpieza de los datos de prueba
  sql(`UPDATE farmacia SET activo=0 WHERE nit IN ('77${sufijo}','${nitP}')`);
  const fallas = resultados.filter((x) => x.estado !== 'Correcto').length;
  fs.writeFileSync(path.join(OUT, 'resultados.json'), JSON.stringify({ fecha: new Date().toISOString(), publica: PUBLICA, resultados, capturas }, null, 2));
  console.log(`\n${resultados.length - fallas}/${resultados.length} correctas`);
})().catch((e) => { console.error(e); process.exit(1); });
