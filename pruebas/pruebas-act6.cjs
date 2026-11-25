// Plan de pruebas de la Actividad 6.
// Ejecuta casos funcionales (PF) y de integración (PI) por HTTP contra la aplicación
// local (puerto 3100, MySQL local) y contra el sistema desplegado en Render con la
// base en Aiven, comprobando los resultados directamente en MySQL.
//
// Uso (con MySQL local encendido):  node pruebas/pruebas-act6.cjs
//
// Este script reemplaza a pruebas-act4.cjs, que se escribió antes de que existiera el
// inicio de sesión y por eso ya no sirve (todas sus solicitudes serían redirigidas al
// login). pruebas-act4.cjs se conserva en el repositorio solo como historial.
//
// Los datos de acceso a las bases no están en este archivo: la base local se lee de
// .env y la de Aiven de un JSON fuera del repositorio (variable DELTA_AIVEN_JSON o, por
// defecto, mysql/aiven-conexion.json dentro de la carpeta personal). Nunca se imprimen.
// Todo lo que las pruebas crean lleva un sufijo numérico propio de la ejecución y se
// borra al terminar, incluso si algún caso falla.
const fs = require('fs');
const os = require('os');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const { iniciarServidor, detenerServidor } = require('./servidor-local.cjs');

const RAIZ = path.resolve(__dirname, '..');
const SALIDA = path.join(RAIZ, 'evidencias', 'actividad-6');
const URL_PUBLICA = (process.env.URL_PUBLICA || 'https://pedidos-delta.onrender.com').replace(/\/$/, '');
const JSON_AIVEN = process.env.DELTA_AIVEN_JSON || path.join(os.homedir(), 'mysql', 'aiven-conexion.json');
const CLAVE_DEMO = 'Delta2026';
const BASE_NUBE = 'delta_pedidos';

// Sufijo único de esta ejecución para todos los registros ficticios.
const sufijo = String(Date.now()).slice(-7);
const COMODIN = `%${sufijo}%`;

// ---------------------------------------------------------------- resultados

const resultados = [];
const lineas = [];
function escribir(texto) {
  lineas.push(texto);
  console.log(texto);
}
function registrar(id, tipo, caso, esperado, obtenido, ok, entorno = 'Local') {
  resultados.push({ id, tipo, entorno, caso, esperado, obtenido, estado: ok ? 'Correcto' : 'Falla' });
  escribir(`${id} ${ok ? 'OK   ' : 'FALLA'} [${entorno}] ${caso} -> ${obtenido}`);
}

// ---------------------------------------------------------------- cliente HTTP

// Cada Cliente guarda sus propias cookies, igual que un navegador distinto.
function codificar(cuerpo) {
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(cuerpo)) {
    // Un campo repetido (varias líneas de pedido) se envía varias veces con el mismo nombre.
    if (Array.isArray(valor)) valor.forEach((v) => params.append(clave, String(v)));
    else params.append(clave, String(valor));
  }
  return params.toString();
}

class Cliente {
  constructor(base) {
    this.base = base;
    this.cookies = new Map();
  }

  async pedir(ruta, cuerpo) {
    const op = { redirect: 'manual', headers: {}, signal: AbortSignal.timeout(90000) };
    if (this.cookies.size) op.headers.Cookie = [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; ');
    if (cuerpo) {
      op.method = 'POST';
      op.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      op.body = codificar(cuerpo);
    }
    const r = await fetch(this.base + ruta, op);
    const nuevas = r.headers.getSetCookie();
    for (const c of nuevas) {
      const par = c.split(';')[0];
      const i = par.indexOf('=');
      const nombre = par.slice(0, i);
      if (/expires=Thu, 01 Jan 1970/i.test(c) || /max-age=0/i.test(c)) this.cookies.delete(nombre);
      else this.cookies.set(nombre, par.slice(i + 1));
    }
    return { status: r.status, location: r.headers.get('location') || '', html: await r.text(), setCookie: nuevas, headers: r.headers };
  }

  entrar(correo, clave = CLAVE_DEMO) {
    return this.pedir('/login', { correo, clave });
  }
}

const idEnRuta = (location) => {
  const m = /\/(\d+)(?:\?|$)/.exec(location);
  return m ? Number(m[1]) : null;
};

// ---------------------------------------------------------------- bases de datos

async function conectarLocal() {
  const env = dotenv.parse(fs.readFileSync(path.join(RAIZ, '.env')));
  return mysql.createConnection({
    host: env.DB_HOST || '127.0.0.1',
    port: Number(env.DB_PORT) || 3306,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME || 'delta_pedidos',
    decimalNumbers: true,
    dateStrings: true
  });
}

async function conectarNube() {
  const j = JSON.parse(fs.readFileSync(JSON_AIVEN, 'utf8'));
  // El certificado puede venir como texto PEM o como la ruta de un archivo.
  const ca = String(j.ca).startsWith('-----BEGIN') ? j.ca : fs.readFileSync(j.ca, 'utf8');
  // Se usa delta_app (solo SELECT, INSERT, UPDATE y DELETE) y se verifica el certificado.
  return mysql.createConnection({
    host: j.host,
    port: j.port,
    user: j.app_user,
    password: j.app_password,
    database: BASE_NUBE,
    ssl: { ca, rejectUnauthorized: true },
    decimalNumbers: true,
    dateStrings: true
  });
}

// Todas las consultas llevan parámetros (?), nunca texto pegado.
async function sql(conexion, consulta, parametros = []) {
  const [filas] = await conexion.query(consulta, parametros);
  return filas;
}
async function uno(conexion, consulta, parametros = []) {
  return (await sql(conexion, consulta, parametros))[0];
}

// ---------------------------------------------------------------- limpieza

// Borra en orden seguro para las llaves foráneas todo lo que lleva el sufijo.
async function limpiarLocal(bd) {
  await sql(bd, 'DELETE d FROM detalle_pedido d JOIN pedido p ON p.id_pedido = d.id_pedido JOIN farmacia f ON f.id_farmacia = p.id_farmacia WHERE f.nombre LIKE ?', [COMODIN]);
  await sql(bd, 'DELETE p FROM pedido p JOIN farmacia f ON f.id_farmacia = p.id_farmacia WHERE f.nombre LIKE ?', [COMODIN]);
  await sql(bd, 'DELETE FROM medicamento WHERE nombre LIKE ?', [COMODIN]);
  await sql(bd, 'DELETE FROM farmacia WHERE nombre LIKE ?', [COMODIN]);
  await sql(bd, 'DELETE FROM usuario WHERE correo LIKE ?', [COMODIN]);
  await sql(bd, 'DELETE FROM categoria WHERE nombre LIKE ?', [COMODIN]);
}
async function limpiarNube(bd) {
  await sql(bd, 'DELETE d FROM detalle_pedido d JOIN pedido p ON p.id_pedido = d.id_pedido JOIN farmacia f ON f.id_farmacia = p.id_farmacia WHERE f.nombre LIKE ?', [COMODIN]);
  await sql(bd, 'DELETE p FROM pedido p JOIN farmacia f ON f.id_farmacia = p.id_farmacia WHERE f.nombre LIKE ?', [COMODIN]);
  await sql(bd, 'DELETE FROM farmacia WHERE nombre LIKE ?', [COMODIN]);
}
async function restantes(bd, nube) {
  const consultas = [
    ['SELECT COUNT(*) AS n FROM farmacia WHERE nombre LIKE ?'],
    ...(nube ? [] : [
      ['SELECT COUNT(*) AS n FROM medicamento WHERE nombre LIKE ?'],
      ['SELECT COUNT(*) AS n FROM usuario WHERE correo LIKE ?'],
      ['SELECT COUNT(*) AS n FROM categoria WHERE nombre LIKE ?']
    ])
  ];
  let total = 0;
  for (const [c] of consultas) total += (await uno(bd, c, [COMODIN])).n;
  return total;
}

// ---------------------------------------------------------------- calentamiento de Render

// Render Free se duerme tras unos minutos sin uso y la primera respuesta puede tardar
// casi un minuto. Se reintenta hasta 3 minutos y se mide cuánto tardó.
function calentar() {
  const inicio = Date.now();
  return (async () => {
    while (Date.now() - inicio < 180000) {
      try {
        const r = await fetch(`${URL_PUBLICA}/login`, { redirect: 'manual', signal: AbortSignal.timeout(30000) });
        if (r.status === 200) return { ok: true, segundos: Math.round((Date.now() - inicio) / 1000) };
      } catch { /* se reintenta */ }
      await new Promise((r) => setTimeout(r, 5000));
    }
    return { ok: false, segundos: Math.round((Date.now() - inicio) / 1000) };
  })();
}

// ---------------------------------------------------------------- datos de prueba compartidos

const fx = { nit: `86${sufijo}` };

// ---------------------------------------------------------------- ejecución

async function ejecutar(ctx) {
  const { base, local, nube, calentamiento } = ctx;
  const ses = {};
  const stock = async (id) => (await uno(local, 'SELECT stock FROM medicamento WHERE id_medicamento = ?', [id])).stock;
  const idUsuario = async (correo) => (await uno(local, 'SELECT id_usuario FROM usuario WHERE correo = ?', [correo])).id_usuario;

  // Datos que usan varios casos. Se crean una sola vez a través de la propia aplicación.
  async function asegurarFarmacia() {
    if (fx.respFarmacia) return;
    fx.datosFarmacia = { nombre: `Farmacia Prueba ${sufijo}`, nit: fx.nit, responsable: 'Ana Pérez', telefono: '4 4251234', direccion: 'Av. Heroínas 100', zona: 'Centro' };
    fx.respFarmacia = await ses.ventas.pedir('/farmacias', fx.datosFarmacia);
    fx.idFarmacia = (await uno(local, 'SELECT id_farmacia FROM farmacia WHERE nit = ?', [fx.nit])).id_farmacia;
  }
  async function asegurarCategoria() {
    if (fx.respCategoria) return;
    fx.nombreCategoria = `Categoría Prueba ${sufijo}`;
    fx.respCategoria = await ses.admin.pedir('/categorias', { nombre: fx.nombreCategoria, descripcion: 'Categoría creada por las pruebas automáticas' });
    fx.idCategoria = (await uno(local, 'SELECT id_categoria FROM categoria WHERE nombre = ?', [fx.nombreCategoria])).id_categoria;
  }
  async function asegurarMedicamentos() {
    if (fx.respMedA) return;
    await asegurarCategoria();
    fx.datosMedA = { nombre: `Paracetamol Prueba ${sufijo}`, presentacion: 'Caja de 20 tabletas', id_categoria: fx.idCategoria, precio_mayorista: '12.50', stock: '50' };
    fx.datosMedB = { nombre: `Ibuprofeno Prueba ${sufijo}`, presentacion: 'Caja de 30 tabletas', id_categoria: fx.idCategoria, precio_mayorista: '8.00', stock: '20' };
    fx.respMedA = await ses.admin.pedir('/medicamentos', fx.datosMedA);
    fx.respMedB = await ses.admin.pedir('/medicamentos', fx.datosMedB);
    fx.idMedA = (await uno(local, 'SELECT id_medicamento FROM medicamento WHERE nombre = ?', [fx.datosMedA.nombre])).id_medicamento;
    fx.idMedB = (await uno(local, 'SELECT id_medicamento FROM medicamento WHERE nombre = ?', [fx.datosMedB.nombre])).id_medicamento;
  }
  async function iniciarSesiones() {
    if (ses.admin) return;
    ses.admin = new Cliente(base);
    ses.ventas = new Cliente(base);
    ses.almacen = new Cliente(base);
    await ses.admin.entrar('admin@delta.test');
    await ses.ventas.entrar('ventas@delta.test');
    await ses.almacen.entrar('almacen@delta.test');
  }
  // Registra un pedido como ventas y devuelve su id (o null si no se creó).
  async function crearPedido(lineasPedido, extra = {}) {
    const r = await ses.ventas.pedir('/pedidos', {
      id_farmacia: fx.idFarmacia,
      observacion: 'Pedido de prueba automática',
      id_medicamento: lineasPedido.map((l) => l[0]),
      cantidad: lineasPedido.map((l) => l[1]),
      ...extra
    });
    return { r, id: r.status === 302 ? idEnRuta(r.location) : null };
  }

  let r;

  // ===== PF-01
  r = await new Cliente(base).pedir('/');
  registrar('PF-01', 'Funcional', 'Acceso sin sesión', 'Redirección 302 hacia /login', `${r.status} hacia ${r.location}`, r.status === 302 && r.location === '/login');

  // ===== PF-03 (se hace antes que PF-02 solo para dejar las sesiones abiertas)
  {
    const usuarios = [['admin', 'admin@delta.test', 'Administrador'], ['ventas', 'ventas@delta.test', 'Ejecutivo de ventas'], ['almacen', 'almacen@delta.test', 'Encargado de almacén']];
    const partes = [];
    let todos = true;
    for (const [clave, correo, rol] of usuarios) {
      const c = new Cliente(base);
      const a = await c.entrar(correo);
      const b = await c.pedir('/');
      const bien = a.status === 302 && a.location === '/' && b.status === 200 && b.html.includes(rol);
      todos = todos && bien;
      partes.push(`${rol}: ${a.status} y ${b.status}`);
      ses[clave] = c;
    }
    registrar('PF-03', 'Funcional', 'Inicio de sesión de los tres roles', 'Cada rol: 302 hacia / y el panel (200) muestra su rol', partes.join('; '), todos);
  }

  // ===== PI-03
  {
    await asegurarFarmacia();
    await asegurarMedicamentos();
    const { r: resp, id } = await crearPedido([[fx.idMedA, 3], [fx.idMedB, 2]], { precio_unitario: '0.01', total: '1' });
    fx.pedido1 = id;
    let obtenido = `${resp.status} ${resp.location}`;
    let ok = false;
    if (id) {
      const p = await uno(local, 'SELECT total, id_usuario, estado FROM pedido WHERE id_pedido = ?', [id]);
      const suma = (await uno(local, 'SELECT SUM(d.cantidad * m.precio_mayorista) AS s FROM detalle_pedido d JOIN medicamento m ON m.id_medicamento = d.id_medicamento WHERE d.id_pedido = ?', [id])).s;
      const idVentas = await idUsuario('ventas@delta.test');
      const sA = await stock(fx.idMedA);
      const sB = await stock(fx.idMedB);
      ok = p.total === suma && p.id_usuario === idVentas && p.estado === 'pendiente' && sA === 50 && sB === 20 && p.total !== 1;
      obtenido = `302 hacia /pedidos/${id}; total ${p.total.toFixed(2)} (suma SQL ${Number(suma).toFixed(2)}), usuario de la sesión: ${p.id_usuario === idVentas ? 'sí' : 'no'}, estado ${p.estado}, stock ${sA} y ${sB}`;
    }
    registrar('PI-03', 'Integración', 'Pedido de dos líneas con el total calculado en el servidor (se envió precio_unitario=0.01 y total=1)', 'Redirección al pedido; total = suma de cantidad x precio de la base; usuario de la sesión; estado pendiente; stock sin cambios', obtenido, ok);
  }

  // ===== PI-09 y PI-14 (desplegado)
  const cal = await calentamiento;
  {
    let obtenido = 'sin respuesta';
    let ok = false;
    if (cal.ok) {
      const rr = await fetch(`${URL_PUBLICA}/login`, { redirect: 'manual', signal: AbortSignal.timeout(60000) });
      ok = rr.status === 200 && new URL(URL_PUBLICA).protocol === 'https:';
      obtenido = `${rr.status} por HTTPS; tiempo hasta la primera respuesta: ${cal.segundos} s`;
      // Se guardan las cabeceras sin ninguna relacionada con cookies.
      const cabeceras = [`Solicitud: GET ${URL_PUBLICA}/login`, `Respuesta: ${rr.status} ${rr.statusText || ''}`.trim(), ''];
      for (const [k, v] of rr.headers) if (!/cookie/i.test(k)) cabeceras.push(`${k}: ${v}`);
      fs.writeFileSync(path.join(SALIDA, 'encabezados-despliegue.txt'), cabeceras.join('\n') + '\n', 'utf8');
    }
    registrar('PI-09', 'Integración', 'El sistema desplegado responde por HTTPS desde Internet', '200 en https://pedidos-delta.onrender.com/login', obtenido, ok, 'Desplegado');
  }
  {
    const privilegios = (await sql(nube, 'SHOW GRANTS FOR CURRENT_USER()')).map((f) => Object.values(f)[0])
      .map((g) => /^GRANT (.+?) ON [`"]?([\w*]+)[`"]?\.\* TO /.exec(g))
      .filter((m) => m && m[2] === BASE_NUBE);
    const lista = privilegios.map((m) => m[1]).join(', ');
    const ok = privilegios.length === 1 && lista === 'SELECT, INSERT, UPDATE, DELETE';
    registrar('PI-14', 'Integración', 'Mínimo privilegio del usuario de la aplicación en la nube', 'Solo SELECT, INSERT, UPDATE y DELETE sobre delta_pedidos', `${lista || 'sin permisos'} sobre ${BASE_NUBE}`, ok, 'Desplegado');
  }
}

// ---------------------------------------------------------------- programa principal

async function main() {
  const inicio = Date.now();
  fs.mkdirSync(SALIDA, { recursive: true });
  escribir(`Plan de pruebas de la Actividad 6 - ${new Date().toISOString()}`);
  escribir(`Node ${process.version}, sufijo de la ejecución ${sufijo}`);
  let local = null;
  let nube = null;
  let limpieza = { local: null, nube: null };
  let base = null;
  let error = null;
  try {
    local = await conectarLocal();
    nube = await conectarNube();
    const calentamiento = calentar();
    base = await iniciarServidor();
    escribir(`Servidor local: ${base}`);
    escribir(`Sistema desplegado: ${URL_PUBLICA}`);
    escribir('');
    await ejecutar({ base, local, nube, calentamiento });
  } catch (e) {
    error = e;
    escribir(`ERROR en la ejecución: ${e.code || e.message}`);
  } finally {
    // La limpieza se hace siempre, haya fallado o no algún caso.
    try { if (local) { await limpiarLocal(local); limpieza.local = await restantes(local, false); } } catch (e) { escribir(`ERROR al limpiar la base local: ${e.code || e.message}`); }
    try { if (nube) { await limpiarNube(nube); limpieza.nube = await restantes(nube, true); } } catch (e) { escribir(`ERROR al limpiar la base de la nube: ${e.code || e.message}`); }
    detenerServidor();
    try { if (local) await local.end(); } catch { /* ya cerrada */ }
    try { if (nube) await nube.end(); } catch { /* ya cerrada */ }
  }

  const correctos = resultados.filter((x) => x.estado === 'Correcto').length;
  escribir('');
  escribir(`Limpieza: registros de prueba que quedan en la base local: ${limpieza.local}, en la base de la nube: ${limpieza.nube}`);
  escribir(`${correctos}/${resultados.length} casos correctos (${Math.round((Date.now() - inicio) / 1000)} s)`);

  fs.writeFileSync(path.join(SALIDA, 'terminal.txt'), lineas.join('\n') + '\n', 'utf8');
  fs.writeFileSync(path.join(SALIDA, 'resultados.json'), JSON.stringify({
    fecha: new Date().toISOString(),
    node: process.version,
    local: 'http://localhost:3100',
    publica: URL_PUBLICA,
    limpieza,
    resultados
  }, null, 2), 'utf8');
  fs.writeFileSync(path.join(SALIDA, 'tablas.md'), armarTablas(), 'utf8');

  const sinLimpiar = (limpieza.local || 0) + (limpieza.nube || 0);
  process.exit(error || correctos !== resultados.length || sinLimpiar ? 1 : 0);
}

// ---------------------------------------------------------------- tablas en Markdown

function celda(t) {
  return String(t).replace(/\s*\n\s*/g, ' ').replace(/\|/g, '\\|').replace(/</g, '&lt;');
}
function tabla(filas) {
  const salida = ['| ID | Caso | Resultado esperado | Resultado obtenido | Estado |', '|---|---|---|---|---|'];
  for (const f of filas) {
    const caso = f.entorno === 'Desplegado' ? `${f.caso} (sistema desplegado)` : f.caso;
    salida.push(`| ${f.id} | ${celda(caso)} | ${celda(f.esperado)} | ${celda(f.obtenido)} | ${f.estado} |`);
  }
  return salida.join('\n');
}
function armarTablas() {
  const grupos = ['Funcional', 'Integración'];
  const resumen = ['| Tipo | Casos | Correctos | Fallidos |', '|---|---|---|---|'];
  let casos = 0;
  let bien = 0;
  for (const g of grupos) {
    const f = resultados.filter((x) => x.tipo === g);
    const ok = f.filter((x) => x.estado === 'Correcto').length;
    casos += f.length; bien += ok;
    resumen.push(`| ${g} | ${f.length} | ${ok} | ${f.length - ok} |`);
  }
  resumen.push(`| Total | ${casos} | ${bien} | ${casos - bien} |`);
  const porEntorno = ['| Entorno | Casos | Correctos | Fallidos |', '|---|---|---|---|'];
  for (const e of ['Local', 'Desplegado']) {
    const f = resultados.filter((x) => x.entorno === e);
    const ok = f.filter((x) => x.estado === 'Correcto').length;
    porEntorno.push(`| ${e} | ${f.length} | ${ok} | ${f.length - ok} |`);
  }
  return [
    'Pruebas funcionales', '', tabla(resultados.filter((x) => x.tipo === 'Funcional')), '',
    'Pruebas de integración', '', tabla(resultados.filter((x) => x.tipo === 'Integración')), '',
    'Resumen por tipo', '', resumen.join('\n'), '',
    'Resumen por entorno', '', porEntorno.join('\n'), ''
  ].join('\n');
}

main();
