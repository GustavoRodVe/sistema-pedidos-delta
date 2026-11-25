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
  const ADMIN = 'admin@delta.test';
  const CLAVE_NUEVA = 'Clave2026x';

  // ===== PF-01
  r = await new Cliente(base).pedir('/');
  registrar('PF-01', 'Funcional', 'Acceso sin sesión', 'Redirección 302 hacia /login', `${r.status} hacia ${r.location}`, r.status === 302 && r.location === '/login');

  // ===== PF-02
  {
    const c = new Cliente(base);
    r = await c.entrar(ADMIN, 'claveIncorrecta99');
    const r2 = await c.pedir('/');
    const mensaje = r.html.includes('Correo o contraseña incorrectos.');
    registrar('PF-02', 'Funcional', 'Inicio de sesión con clave incorrecta', '401 con el mensaje genérico y sin sesión abierta (GET / redirige a /login)', `${r.status}, mensaje genérico: ${mensaje ? 'sí' : 'no'}; luego GET /: ${r2.status} hacia ${r2.location}`, r.status === 401 && mensaje && r2.status === 302 && r2.location === '/login');
  }

  // ===== PF-03
  {
    const usuarios = [['admin', ADMIN, 'Administrador'], ['ventas', 'ventas@delta.test', 'Ejecutivo de ventas'], ['almacen', 'almacen@delta.test', 'Encargado de almacén']];
    const partes = [];
    let todos = true;
    for (const [clave, correo, rol] of usuarios) {
      const c = new Cliente(base);
      const a = await c.entrar(correo);
      const b = await c.pedir('/');
      todos = todos && a.status === 302 && a.location === '/' && b.status === 200 && b.html.includes(rol);
      partes.push(`${rol}: ${a.status} y ${b.status}`);
      ses[clave] = c;
    }
    registrar('PF-03', 'Funcional', 'Inicio de sesión de los tres roles', 'Cada rol: 302 hacia / y el panel (200) muestra su rol', partes.join('; '), todos);
  }

  // ===== PF-04
  {
    const c = new Cliente(base);
    await c.entrar(ADMIN);
    const vieja = new Map(c.cookies);
    r = await c.pedir('/logout', {});
    c.cookies = vieja; // se vuelve a usar la cookie anterior: el servidor ya debe haber destruido esa sesión
    const r2 = await c.pedir('/');
    registrar('PF-04', 'Funcional', 'Cerrar sesión', '302 hacia /login y la cookie anterior deja de servir', `${r.status} hacia ${r.location}; con la cookie vieja GET /: ${r2.status} hacia ${r2.location}`, r.status === 302 && r.location === '/login' && r2.status === 302 && r2.location === '/login');
  }

  // ===== PF-05
  {
    const intentos = [
      ['almacén GET /farmacias', ses.almacen.pedir('/farmacias')],
      ['ventas GET /usuarios', ses.ventas.pedir('/usuarios')],
      ['ventas GET /categorias', ses.ventas.pedir('/categorias')],
      ['ventas GET /reportes/pedidos', ses.ventas.pedir('/reportes/pedidos')],
      ['ventas GET /medicamentos/nuevo', ses.ventas.pedir('/medicamentos/nuevo')],
      ['almacén POST /pedidos', ses.almacen.pedir('/pedidos', { id_farmacia: '1' })]
    ];
    const respuestas = await Promise.all(intentos.map((i) => i[1]));
    const codigos = respuestas.map((x, i) => `${intentos[i][0]}: ${x.status}`);
    registrar('PF-05', 'Funcional', 'Permisos por rol en el servidor', 'Las seis solicitudes fuera del rol responden 403', codigos.join('; '), respuestas.every((x) => x.status === 403));
  }

  // ===== PF-06
  await asegurarFarmacia();
  registrar('PF-06', 'Funcional', 'Registrar una farmacia con datos válidos (ventas)', '302 hacia /farmacias?ok=registrada', `${fx.respFarmacia.status} hacia ${fx.respFarmacia.location}`, fx.respFarmacia.status === 302 && fx.respFarmacia.location.includes('ok=registrada'));

  // ===== PF-07
  {
    fx.nitConLetras = '12AB';
    fx.nitZonaMala = `87${sufijo}`;
    const a = await ses.ventas.pedir('/farmacias', { ...fx.datosFarmacia, nit: fx.nitConLetras });
    const b = await ses.ventas.pedir('/farmacias', { ...fx.datosFarmacia, nit: fx.nitZonaMala, zona: 'Marte' });
    const okA = a.status === 422 && a.html.includes('solo números');
    const okB = b.status === 422 && b.html.includes('La zona seleccionada no es válida');
    registrar('PF-07', 'Funcional', 'Farmacia con NIT con letras y con zona fuera de la lista', '422 con el mensaje de cada campo', `NIT con letras: ${a.status}, mensaje ${okA ? 'sí' : 'no'}; zona Marte: ${b.status}, mensaje ${okB ? 'sí' : 'no'}`, okA && okB);
  }

  // ===== PF-08
  {
    r = await ses.ventas.pedir('/farmacias', { ...fx.datosFarmacia, nombre: `Otra farmacia ${sufijo}` });
    registrar('PF-08', 'Funcional', 'NIT repetido de una farmacia activa', '409 con el mensaje de NIT ya registrado', `${r.status}, mensaje: ${r.html.includes('Ya existe una farmacia registrada con este NIT') ? 'sí' : 'no'}`, r.status === 409 && r.html.includes('Ya existe una farmacia registrada con este NIT'));
  }

  // ===== PF-09 (regresión del ERR-01 de la Actividad 4)
  {
    const a = await ses.ventas.pedir(`/farmacias/${fx.idFarmacia}/desactivar`, {});
    const activoA = (await uno(local, 'SELECT activo FROM farmacia WHERE id_farmacia = ?', [fx.idFarmacia])).activo;
    const b = await ses.ventas.pedir('/farmacias', fx.datosFarmacia);
    const activoB = (await uno(local, 'SELECT activo FROM farmacia WHERE id_farmacia = ?', [fx.idFarmacia])).activo;
    registrar('PF-09', 'Funcional', 'Registrar de nuevo el NIT de una farmacia desactivada (regresión del ERR-01)', 'Desactivar deja activo = 0 y volver a registrar el NIT redirige con ok=reactivada y activo = 1', `desactivar: ${a.status}, activo = ${activoA}; registrar otra vez: ${b.status} ${b.location}, activo = ${activoB}`, a.status === 302 && activoA === 0 && b.status === 302 && b.location.includes('ok=reactivada') && activoB === 1);
  }

  // ===== PF-10
  {
    await asegurarMedicamentos();
    const a = await ses.admin.pedir('/medicamentos', { ...fx.datosMedA, nombre: `Precio cero ${sufijo}`, precio_mayorista: '0' });
    const b = await ses.admin.pedir('/medicamentos', { ...fx.datosMedA, nombre: `Stock negativo ${sufijo}`, stock: '-5' });
    const okV = fx.respMedA.status === 302 && fx.respMedA.location.includes('ok=registrado');
    const okA = a.status === 422 && a.html.includes('mayor que cero');
    const okB = b.status === 422 && b.html.includes('no puede ser negativo');
    registrar('PF-10', 'Funcional', 'Registrar medicamentos (administrador): válido, precio 0 y stock negativo', 'Válido 302; precio 0 y stock negativo 422 con su mensaje', `válido: ${fx.respMedA.status}; precio 0: ${a.status}; stock negativo: ${b.status}`, okV && okA && okB);
  }

  // ===== PF-11
  {
    await asegurarCategoria();
    const rep = await ses.admin.pedir('/categorias', { nombre: fx.nombreCategoria });
    registrar('PF-11', 'Funcional', 'Registrar categorías (administrador): nueva y repetida', 'Nueva 302 con ok=registrada; repetida 409', `nueva: ${fx.respCategoria.status} ${fx.respCategoria.location}; repetida: ${rep.status}`, fx.respCategoria.status === 302 && fx.respCategoria.location.includes('ok=registrada') && rep.status === 409);
  }

  // ===== PF-12
  {
    const idRol = (await uno(local, "SELECT id_rol FROM rol WHERE nombre = 'Ejecutivo de ventas'")).id_rol;
    const a = await ses.admin.pedir('/usuarios', { nombre_completo: `Usuario Corto ${sufijo}`, correo: `corta${sufijo}@delta.test`, clave: '12345', id_rol: idRol });
    const b = await ses.admin.pedir('/usuarios', { nombre_completo: `Usuario Repetido ${sufijo}`, correo: ADMIN, clave: CLAVE_NUEVA, id_rol: idRol });
    fx.idRolVentas = idRol;
    registrar('PF-12', 'Funcional', 'Registrar usuarios (administrador): clave corta y correo repetido', 'Clave de 5 caracteres 422; correo repetido 409', `clave corta: ${a.status}, mensaje ${a.html.includes('al menos 8 caracteres') ? 'sí' : 'no'}; correo repetido: ${b.status}`, a.status === 422 && a.html.includes('al menos 8 caracteres') && b.status === 409);
  }

  // ===== PF-13
  {
    fx.correoUsuario = `prueba${sufijo}@delta.test`;
    const alta = await ses.admin.pedir('/usuarios', { nombre_completo: `Usuario de Prueba ${sufijo}`, correo: fx.correoUsuario, clave: CLAVE_NUEVA, id_rol: fx.idRolVentas });
    const a = await new Cliente(base).entrar(fx.correoUsuario, CLAVE_NUEVA);
    fx.idUsuarioPrueba = (await uno(local, 'SELECT id_usuario FROM usuario WHERE correo = ?', [fx.correoUsuario])).id_usuario;
    const baja = await ses.admin.pedir(`/usuarios/${fx.idUsuarioPrueba}/desactivar`, {});
    const b = await new Cliente(base).entrar(fx.correoUsuario, CLAVE_NUEVA);
    registrar('PF-13', 'Funcional', 'Un usuario desactivado ya no inicia sesión', 'Antes de desactivarlo 302; después 401', `alta: ${alta.status}; ingreso: ${a.status}; desactivar: ${baja.status}; ingreso después: ${b.status}`, alta.status === 302 && a.status === 302 && baja.status === 302 && b.status === 401);
  }

  // ===== PF-14
  {
    const idAdmin = (await uno(local, 'SELECT id_usuario FROM usuario WHERE correo = ?', [ADMIN])).id_usuario;
    r = await ses.admin.pedir(`/usuarios/${idAdmin}/desactivar`, {});
    const activo = (await uno(local, 'SELECT activo FROM usuario WHERE id_usuario = ?', [idAdmin])).activo;
    registrar('PF-14', 'Funcional', 'El administrador no puede desactivarse a sí mismo', 'Redirección con error=propio y activo sigue en 1', `${r.status} ${r.location}; activo = ${activo}`, r.status === 302 && r.location.includes('error=propio') && activo === 1);
  }

  // ===== PF-15
  {
    const contar = async () => (await uno(local, 'SELECT COUNT(*) AS n FROM pedido WHERE id_farmacia = ?', [fx.idFarmacia])).n;
    const antes = await contar();
    const a = await ses.ventas.pedir('/pedidos', { id_farmacia: fx.idFarmacia, observacion: '' });
    const b = await ses.ventas.pedir('/pedidos', { id_farmacia: fx.idFarmacia, id_medicamento: [fx.idMedA], cantidad: ['0'] });
    const c = await ses.ventas.pedir('/pedidos', { id_farmacia: fx.idFarmacia, id_medicamento: [fx.idMedA, fx.idMedA], cantidad: ['1', '2'] });
    const despues = await contar();
    registrar('PF-15', 'Funcional', 'Pedido inválido: sin líneas, cantidad 0 y medicamento repetido', 'Los tres responden 422 y no se crea ningún pedido', `sin líneas: ${a.status}; cantidad 0: ${b.status}; repetido: ${c.status}; pedidos antes ${antes}, después ${despues}`, a.status === 422 && b.status === 422 && c.status === 422 && antes === despues);
  }

  // ===== PF-16
  {
    const { id } = await crearPedido([[fx.idMedA, 1]]);
    fx.pedido3 = id;
    const d1 = await ses.almacen.pedir(`/pedidos/${id}/despachar`, {});
    const d2 = await ses.almacen.pedir(`/pedidos/${id}/despachar`, {});
    const e = await ses.almacen.pedir(`/pedidos/${id}/entregar`, {});
    const an = await ses.ventas.pedir(`/pedidos/${id}/anular`, {});
    const legible = an.html.includes('Solo un pedido pendiente se puede anular');
    registrar('PF-16', 'Funcional', 'Transiciones de estado no permitidas', 'Despachar dos veces: la segunda 409; anular un pedido entregado: 409 con mensaje legible', `despachar: ${d1.status} y ${d2.status}; entregar: ${e.status}; anular entregado: ${an.status}, mensaje legible: ${legible ? 'sí' : 'no'}`, d1.status === 302 && d2.status === 409 && e.status === 302 && an.status === 409 && legible);
  }

  // ===== PF-17
  {
    const a = await ses.admin.pedir('/reportes/pedidos?desde=2026-02-30&hasta=2026-03-01');
    const b = await ses.admin.pedir('/reportes/pedidos?desde=2026-03-10&hasta=2026-03-01');
    registrar('PF-17', 'Funcional', 'Reporte con fechas inválidas', '422 para una fecha inexistente y para un rango al revés', `2026-02-30: ${a.status}; desde posterior a hasta: ${b.status}`, a.status === 422 && b.status === 422);
  }

  // ===== PF-18
  {
    const nitX = `88${sufijo}`;
    await ses.ventas.pedir('/farmacias', { ...fx.datosFarmacia, nit: nitX, nombre: `<script>alert(1)</script> ${sufijo}` });
    const idX = (await uno(local, 'SELECT id_farmacia FROM farmacia WHERE nit = ?', [nitX])).id_farmacia;
    const d = await ses.ventas.pedir(`/farmacias/${idX}`);
    const escapado = d.html.includes('&lt;script&gt;') && !d.html.includes('<script>alert');
    const a = await ses.admin.pedir('/no-existe');
    const b = await ses.admin.pedir('/pedidos/abc');
    registrar('PF-18', 'Funcional', 'Salida escapada y rutas inválidas', 'El nombre con etiqueta script se muestra como texto; /no-existe y /pedidos/abc dan 404', `escapado: ${escapado ? 'sí' : 'no'}; /no-existe: ${a.status}; /pedidos/abc: ${b.status}`, escapado && a.status === 404 && b.status === 404);
  }

  // ===== PI-01
  {
    const h = (await uno(local, 'SELECT clave_hash FROM usuario WHERE id_usuario = ?', [fx.idUsuarioPrueba])).clave_hash;
    registrar('PI-01', 'Integración', 'La contraseña se guarda como hash', 'Hash bcrypt (empieza con $2, 60 caracteres) distinto de la contraseña enviada', `empieza con ${h.slice(0, 4)}, ${h.length} caracteres, distinto de la contraseña: ${h !== CLAVE_NUEVA ? 'sí' : 'no'}`, h.startsWith('$2') && h.length === 60 && h !== CLAVE_NUEVA);
  }

  // ===== PI-02
  {
    const f = await uno(local, 'SELECT nombre, nit, responsable, telefono, direccion, zona, activo FROM farmacia WHERE nit = ?', [fx.nit]);
    const d = fx.datosFarmacia;
    const igual = f && f.nombre === d.nombre && f.responsable === d.responsable && f.telefono === d.telefono && f.direccion === d.direccion && f.zona === d.zona && f.activo === 1;
    const rechazadas = (await uno(local, 'SELECT COUNT(*) AS n FROM farmacia WHERE nit IN (?, ?)', [fx.nitConLetras, fx.nitZonaMala])).n;
    registrar('PI-02', 'Integración', 'Farmacia guardada y datos rechazados fuera de la base', 'La fila tiene los datos enviados y los NIT rechazados tienen 0 filas', `fila con los datos enviados: ${igual ? 'sí' : 'no'}; filas de los NIT rechazados: ${rechazadas}`, Boolean(igual) && rechazadas === 0);
  }

  // ===== PI-03
  {
    const a0 = await stock(fx.idMedA);
    const b0 = await stock(fx.idMedB);
    const { r: resp, id } = await crearPedido([[fx.idMedA, 3], [fx.idMedB, 2]], { precio_unitario: '0.01', total: '1' });
    fx.pedido1 = id;
    let obtenido = `${resp.status} ${resp.location}`;
    let ok = false;
    if (id) {
      const p = await uno(local, 'SELECT total, id_usuario, estado FROM pedido WHERE id_pedido = ?', [id]);
      const suma = (await uno(local, 'SELECT SUM(d.cantidad * m.precio_mayorista) AS s FROM detalle_pedido d JOIN medicamento m ON m.id_medicamento = d.id_medicamento WHERE d.id_pedido = ?', [id])).s;
      const idVentas = (await uno(local, 'SELECT id_usuario FROM usuario WHERE correo = ?', ['ventas@delta.test'])).id_usuario;
      const a1 = await stock(fx.idMedA);
      const b1 = await stock(fx.idMedB);
      ok = p.total === Number(suma) && p.total !== 1 && p.id_usuario === idVentas && p.estado === 'pendiente' && a0 === a1 && b0 === b1;
      obtenido = `302 hacia /pedidos/${id}; total ${p.total.toFixed(2)} (suma SQL ${Number(suma).toFixed(2)}), usuario de la sesión: ${p.id_usuario === idVentas ? 'sí' : 'no'}, estado ${p.estado}, stock ${a0}->${a1} y ${b0}->${b1}`;
    }
    registrar('PI-03', 'Integración', 'Pedido de dos líneas con el total calculado en el servidor (se envió precio_unitario=0.01 y total=1)', 'Redirección al pedido; total = suma de cantidad x precio de la base; usuario de la sesión; estado pendiente; stock sin cambios', obtenido, ok);
  }

  // ===== PI-04
  {
    const a0 = await stock(fx.idMedA);
    const b0 = await stock(fx.idMedB);
    const { id } = await crearPedido([[fx.idMedA, 999], [fx.idMedB, 1]]);
    fx.pedido2 = id;
    r = await ses.almacen.pedir(`/pedidos/${id}/despachar`, {});
    const estado = (await uno(local, 'SELECT estado FROM pedido WHERE id_pedido = ?', [id])).estado;
    const a1 = await stock(fx.idMedA);
    const b1 = await stock(fx.idMedB);
    const nombra = r.html.includes(fx.datosMedA.nombre);
    registrar('PI-04', 'Integración', 'Despacho con stock insuficiente', '409 que nombra el medicamento, estado pendiente y stock de las dos líneas sin cambios (rollback)', `${r.status}, nombra el medicamento: ${nombra ? 'sí' : 'no'}, estado ${estado}, stock ${a0}->${a1} y ${b0}->${b1}`, r.status === 409 && nombra && estado === 'pendiente' && a0 === a1 && b0 === b1);
  }

  // ===== PI-05
  {
    const a0 = await stock(fx.idMedA);
    const b0 = await stock(fx.idMedB);
    r = await ses.almacen.pedir(`/pedidos/${fx.pedido1}/despachar`, {});
    const p = await uno(local, 'SELECT estado, fecha_despacho FROM pedido WHERE id_pedido = ?', [fx.pedido1]);
    const a1 = await stock(fx.idMedA);
    const b1 = await stock(fx.idMedB);
    registrar('PI-05', 'Integración', 'Despacho correcto descuenta el stock', 'Estado despachado, fecha de despacho y stock menos 3 y menos 2', `${r.status}, estado ${p.estado}, fecha de despacho ${p.fecha_despacho ? 'registrada' : 'vacía'}, stock ${a0}->${a1} y ${b0}->${b1}`, r.status === 302 && p.estado === 'despachado' && Boolean(p.fecha_despacho) && a0 - a1 === 3 && b0 - b1 === 2);
  }

  // ===== PI-06
  {
    const e = await ses.almacen.pedir(`/pedidos/${fx.pedido1}/entregar`, {});
    const p = await uno(local, 'SELECT estado, fecha_entrega FROM pedido WHERE id_pedido = ?', [fx.pedido1]);
    const { id } = await crearPedido([[fx.idMedB, 1]]);
    fx.pedidoAnulado = id;
    const b0 = await stock(fx.idMedB);
    const an = await ses.ventas.pedir(`/pedidos/${id}/anular`, {});
    const q = await uno(local, 'SELECT estado FROM pedido WHERE id_pedido = ?', [id]);
    const b1 = await stock(fx.idMedB);
    registrar('PI-06', 'Integración', 'Entrega y anulación de pedidos', 'Entregado con fecha de entrega; un pendiente anulado queda anulado con el stock sin cambios', `entregar: ${e.status}, estado ${p.estado}, fecha de entrega ${p.fecha_entrega ? 'registrada' : 'vacía'}; anular: ${an.status}, estado ${q.estado}, stock ${b0}->${b1}`, e.status === 302 && p.estado === 'entregado' && Boolean(p.fecha_entrega) && an.status === 302 && q.estado === 'anulado' && b0 === b1);
  }

  // ===== PI-07
  {
    const rango = await uno(local, "SELECT DATE_FORMAT(MIN(fecha_pedido), '%Y-%m-%d') AS d, DATE_FORMAT(MAX(fecha_pedido), '%Y-%m-%d') AS h FROM pedido WHERE id_farmacia = ?", [fx.idFarmacia]);
    const suma = await uno(local, "SELECT COALESCE(SUM(total), 0) AS t, COUNT(*) AS n FROM pedido WHERE id_farmacia = ? AND estado <> 'anulado' AND fecha_pedido >= ? AND fecha_pedido < DATE_ADD(?, INTERVAL 1 DAY)", [fx.idFarmacia, rango.d, rango.h]);
    r = await ses.admin.pedir(`/reportes/pedidos?farmacia=${fx.idFarmacia}&desde=${rango.d}&hasta=${rango.h}`);
    const m = /Total: Bs ([\d.]+)/.exec(r.html);
    const pantalla = m ? Number(m[1]) : null;
    const sinAnulado = !r.html.includes(`/pedidos/${fx.pedidoAnulado}"`);
    const cuenta = r.html.includes(`${suma.n} pedido(s) en el rango`);
    registrar('PI-07', 'Integración', 'El total del reporte coincide con la base', 'Total en pantalla igual a SUM(total) de MySQL sin contar los anulados', `${r.status}, total en pantalla Bs ${pantalla === null ? 'sin total' : pantalla.toFixed(2)}, suma en MySQL Bs ${Number(suma.t).toFixed(2)}, ${suma.n} pedidos, anulado excluido: ${sinAnulado ? 'sí' : 'no'}`, r.status === 200 && pantalla === Number(suma.t) && sinAnulado && cuenta);
  }

  // ===== PI-08
  {
    r = await ses.almacen.pedir(`/medicamentos?categoria=${fx.idCategoria}`);
    const ok = r.status === 200 && r.html.includes(fx.datosMedA.nombre) && r.html.includes(fx.nombreCategoria);
    registrar('PI-08', 'Integración', 'El listado de medicamentos muestra cada uno con su categoría', 'El medicamento de prueba aparece con el nombre de su categoría', `${r.status}, medicamento y categoría visibles: ${ok ? 'sí' : 'no'}`, ok);
  }

  // ===== PI-09 (sistema desplegado)
  const cal = await calentamiento;
  {
    let obtenido = 'sin respuesta en 3 minutos';
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

  // ===== PI-10
  const nubeSes = {};
  {
    nubeSes.admin = new Cliente(URL_PUBLICA);
    nubeSes.ventas = new Cliente(URL_PUBLICA);
    nubeSes.almacen = new Cliente(URL_PUBLICA);
    const a = await nubeSes.admin.entrar(ADMIN);
    await nubeSes.ventas.entrar('ventas@delta.test');
    await nubeSes.almacen.entrar('almacen@delta.test');
    const cookie = a.setCookie.join(' ');
    const seguro = /;\s*secure/i.test(cookie);
    const soloHttp = /;\s*httponly/i.test(cookie);
    const b = await nubeSes.admin.pedir('/');
    registrar('PI-10', 'Integración', 'Sesión en producción con cookie segura', '302 al ingresar, cookie con Secure y HttpOnly, y GET / con 200', `${a.status}; Secure: ${seguro ? 'sí' : 'no'}, HttpOnly: ${soloHttp ? 'sí' : 'no'}; GET /: ${b.status}`, a.status === 302 && seguro && soloHttp && b.status === 200, 'Desplegado');
  }

  // ===== PI-11
  {
    const a = await new Cliente(URL_PUBLICA).pedir('/');
    const b = await nubeSes.almacen.pedir('/farmacias');
    registrar('PI-11', 'Integración', 'Permisos en la nube', 'Sin sesión 302 hacia /login; almacén en /farmacias 403', `sin sesión: ${a.status} hacia ${a.location}; almacén en /farmacias: ${b.status}`, a.status === 302 && a.location === '/login' && b.status === 403, 'Desplegado');
  }

  // ===== PI-12
  {
    fx.nitNube = `84${sufijo}`;
    r = await nubeSes.ventas.pedir('/farmacias', { nombre: `Farmacia Prueba Nube ${sufijo}`, nit: fx.nitNube, responsable: 'Ana Pérez', telefono: '4 4251234', direccion: 'Av. Heroínas 100', zona: 'Centro' });
    const filas = (await uno(nube, 'SELECT COUNT(*) AS n FROM farmacia WHERE nit = ?', [fx.nitNube])).n;
    registrar('PI-12', 'Integración', 'Un registro hecho desde Internet llega a la base de Aiven', '302 y exactamente 1 fila en Aiven (consulta por TLS)', `${r.status}, filas en Aiven: ${filas}`, r.status === 302 && filas === 1, 'Desplegado');
  }

  // ===== PI-13
  {
    // Para que el reporte tenga algo que sumar (la base de la nube no tiene pedidos), se
    // registra un pedido de prueba de una unidad en la farmacia ficticia. No toca el stock.
    const idFarmaciaNube = (await uno(nube, 'SELECT id_farmacia FROM farmacia WHERE nit = ?', [fx.nitNube])).id_farmacia;
    const med = await uno(nube, 'SELECT id_medicamento FROM medicamento WHERE activo = 1 AND stock > 0 ORDER BY id_medicamento LIMIT 1');
    const alta = await nubeSes.ventas.pedir('/pedidos', { id_farmacia: idFarmaciaNube, observacion: 'Pedido de prueba automática', id_medicamento: [med.id_medicamento], cantidad: [1] });
    r = await nubeSes.admin.pedir('/reportes/pedidos');
    const desde = (/name="desde" value="([^"]+)"/.exec(r.html) || [])[1];
    const hasta = (/name="hasta" value="([^"]+)"/.exec(r.html) || [])[1];
    const suma = await uno(nube, "SELECT COALESCE(SUM(total), 0) AS t, COUNT(*) AS n FROM pedido WHERE estado <> 'anulado' AND fecha_pedido >= ? AND fecha_pedido < DATE_ADD(?, INTERVAL 1 DAY)", [desde, hasta]);
    const m = /Total: Bs ([\d.]+)/.exec(r.html);
    const pantalla = m ? Number(m[1]) : null;
    registrar('PI-13', 'Integración', 'El reporte en la nube coincide con la base de Aiven', 'Total en pantalla igual a SUM(total) de Aiven para el mes en curso, con el pedido de prueba incluido', `pedido de prueba: ${alta.status}; reporte: ${r.status}, total en pantalla Bs ${pantalla === null ? 'sin total' : pantalla.toFixed(2)}, suma en Aiven Bs ${Number(suma.t).toFixed(2)}, ${suma.n} pedido(s) en el rango`, alta.status === 302 && r.status === 200 && pantalla !== null && pantalla === Number(suma.t) && suma.n >= 1, 'Desplegado');
  }

  // ===== PI-14
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

  resultados.sort((x, y) => x.id.localeCompare(y.id));
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
