// Modelo Pedido: consultas y cambios de las tablas pedido y detalle_pedido.
// Las operaciones que tocan varias tablas (crear y despachar) usan una transacción:
// o se guardan todos los cambios o no se guarda ninguno.
const { pool } = require('../config/db');

const Pedido = {
  // Registra el pedido con sus líneas. El precio sale de la base de datos (precio vigente),
  // nunca del formulario, y el stock NO se toca aquí: se descuenta recién al despachar.
  // Devuelve el id del pedido, o null si algún medicamento ya no está activo.
  async crear({ idFarmacia, idUsuario, observacion, lineas }) {
    const conexion = await pool.getConnection();
    try {
      await conexion.beginTransaction();
      const ids = lineas.map((l) => l.id_medicamento);
      // Con query (no execute) para que mysql2 expanda el arreglo en el IN (?).
      const [medicamentos] = await conexion.query(
        'SELECT id_medicamento, precio_mayorista FROM medicamento WHERE id_medicamento IN (?) AND activo = 1 FOR UPDATE',
        [ids]
      );
      if (medicamentos.length !== lineas.length) {
        await conexion.rollback();
        return null;
      }
      const precios = new Map(medicamentos.map((m) => [m.id_medicamento, m.precio_mayorista]));

      // Los cálculos se hacen en centavos (enteros) para evitar errores de decimales.
      let totalCentavos = 0;
      const detalle = lineas.map((l) => {
        const unitario = Math.round(precios.get(l.id_medicamento) * 100);
        const subtotal = unitario * l.cantidad;
        totalCentavos += subtotal;
        return { ...l, unitario, subtotal };
      });

      const [resultado] = await conexion.query(
        'INSERT INTO pedido (id_farmacia, id_usuario, total, observacion) VALUES (?, ?, ?, ?)',
        [idFarmacia, idUsuario, totalCentavos / 100, observacion || null]
      );
      const idPedido = resultado.insertId;
      for (const d of detalle) {
        await conexion.query(
          `INSERT INTO detalle_pedido (id_pedido, id_medicamento, cantidad, precio_unitario, subtotal)
           VALUES (?, ?, ?, ?, ?)`,
          [idPedido, d.id_medicamento, d.cantidad, d.unitario / 100, d.subtotal / 100]
        );
      }
      await conexion.commit();
      return idPedido;
    } catch (err) {
      await conexion.rollback();
      throw err;
    } finally {
      conexion.release();
    }
  },

  // Lista de pedidos con filtros opcionales por estado y por farmacia.
  async listar({ estado, idFarmacia }) {
    let sql = `SELECT p.id_pedido, p.fecha_pedido, p.estado, p.total, f.nombre AS farmacia
               FROM pedido p
               INNER JOIN farmacia f ON f.id_farmacia = p.id_farmacia
               WHERE 1 = 1`;
    const params = [];
    if (estado) {
      sql += ' AND p.estado = ?';
      params.push(estado);
    }
    if (idFarmacia) {
      sql += ' AND p.id_farmacia = ?';
      params.push(idFarmacia);
    }
    sql += ' ORDER BY p.id_pedido DESC';
    const [filas] = await pool.query(sql, params);
    return filas;
  },

  async buscarPorId(id) {
    const [filas] = await pool.query(
      `SELECT p.id_pedido, p.id_farmacia, p.fecha_pedido, p.estado, p.total, p.observacion,
              p.fecha_despacho, p.fecha_entrega,
              f.nombre AS farmacia, f.nit, u.nombre_completo AS registrado_por
       FROM pedido p
       INNER JOIN farmacia f ON f.id_farmacia = p.id_farmacia
       INNER JOIN usuario u ON u.id_usuario = p.id_usuario
       WHERE p.id_pedido = ?`,
      [id]
    );
    return filas[0] || null;
  },

  // Líneas del pedido con el stock actual de cada medicamento (útil para el almacén).
  async listarDetalle(id) {
    const [filas] = await pool.query(
      `SELECT d.id_medicamento, d.cantidad, d.precio_unitario, d.subtotal,
              m.nombre, m.presentacion, m.stock
       FROM detalle_pedido d
       INNER JOIN medicamento m ON m.id_medicamento = d.id_medicamento
       WHERE d.id_pedido = ?
       ORDER BY d.id_detalle`,
      [id]
    );
    return filas;
  },

  // Despacha un pedido pendiente y descuenta el stock de cada línea.
  // Devuelve { existe: false } si no hay pedido, { existe: true, ok: false, estado }
  // si no estaba pendiente, { existe: true, ok: false, faltantes } si el stock no alcanza,
  // o { existe: true, ok: true } si se despachó.
  async despachar(id) {
    const conexion = await pool.getConnection();
    try {
      await conexion.beginTransaction();
      // FOR UPDATE bloquea las filas hasta el commit: si dos personas despachan a la vez,
      // la segunda espera y ya no puede dejar el stock en negativo.
      const [pedidos] = await conexion.query('SELECT estado FROM pedido WHERE id_pedido = ? FOR UPDATE', [id]);
      if (pedidos.length === 0) {
        await conexion.rollback();
        return { existe: false };
      }
      if (pedidos[0].estado !== 'pendiente') {
        await conexion.rollback();
        return { existe: true, ok: false, estado: pedidos[0].estado };
      }
      const [lineas] = await conexion.query(
        `SELECT d.id_medicamento, d.cantidad, m.nombre, m.presentacion, m.stock
         FROM detalle_pedido d
         INNER JOIN medicamento m ON m.id_medicamento = d.id_medicamento
         WHERE d.id_pedido = ? FOR UPDATE`,
        [id]
      );
      const faltantes = lineas.filter((l) => l.stock < l.cantidad);
      if (faltantes.length > 0) {
        await conexion.rollback();
        return { existe: true, ok: false, faltantes };
      }
      for (const l of lineas) {
        await conexion.query('UPDATE medicamento SET stock = stock - ? WHERE id_medicamento = ?', [l.cantidad, l.id_medicamento]);
      }
      await conexion.query("UPDATE pedido SET estado = 'despachado', fecha_despacho = NOW() WHERE id_pedido = ?", [id]);
      await conexion.commit();
      return { existe: true, ok: true };
    } catch (err) {
      await conexion.rollback();
      throw err;
    } finally {
      conexion.release();
    }
  },

  // El WHERE sobre el estado es lo que impide las transiciones inválidas: si el
  // pedido no está en el estado esperado, no se modifica ninguna fila (devuelve 0).
  async entregar(id) {
    const [resultado] = await pool.query(
      "UPDATE pedido SET estado = 'entregado', fecha_entrega = NOW() WHERE id_pedido = ? AND estado = 'despachado'",
      [id]
    );
    return resultado.affectedRows;
  },

  async anular(id) {
    const [resultado] = await pool.query(
      "UPDATE pedido SET estado = 'anulado' WHERE id_pedido = ? AND estado = 'pendiente'",
      [id]
    );
    return resultado.affectedRows;
  }
};

module.exports = Pedido;
