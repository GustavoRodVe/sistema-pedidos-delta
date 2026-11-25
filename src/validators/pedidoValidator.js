// Validación de los datos del formulario de pedido. Devuelve los datos limpios y
// un objeto con los errores por campo (las líneas tienen un solo mensaje, "lineas").
const ESTADOS = ['pendiente', 'despachado', 'entregado', 'anulado'];
const MAX_LINEAS = 50;

function validarPedido(body) {
  const errores = {};
  const datos = {
    id_farmacia: Number.parseInt(body.id_farmacia, 10) || null,
    observacion: String(body.observacion || '').trim(),
    lineas: []
  };

  if (!/^\d+$/.test(String(body.id_farmacia || '').trim()) || datos.id_farmacia < 1) {
    errores.id_farmacia = 'Seleccione una farmacia.';
  }
  if (datos.observacion.length > 255) {
    errores.observacion = 'La observación no puede tener más de 255 caracteres.';
  }

  // Con urlencoded extended:false, un nombre repetido llega como arreglo y un nombre
  // único llega como texto. concat los deja siempre como arreglo.
  const medicamentos = [].concat(body.id_medicamento ?? []);
  const cantidades = [].concat(body.cantidad ?? []);
  const filas = Math.max(medicamentos.length, cantidades.length);

  for (let i = 0; i < filas; i++) {
    const idMedicamento = String(medicamentos[i] ?? '').trim();
    const cantidad = String(cantidades[i] ?? '').trim();
    // Una fila totalmente vacía se ignora (por ejemplo, la línea en blanco del formulario).
    if (idMedicamento === '' && cantidad === '') continue;
    datos.lineas.push({ id_medicamento: idMedicamento, cantidad });
  }

  if (datos.lineas.length === 0) {
    errores.lineas = 'Agregue al menos un medicamento al pedido.';
  } else if (datos.lineas.length > MAX_LINEAS) {
    errores.lineas = `El pedido no puede tener más de ${MAX_LINEAS} medicamentos.`;
  } else {
    // Se informa el primer problema encontrado, indicando el número de línea.
    datos.lineas.forEach((l, i) => {
      if (errores.lineas) return;
      if (!/^\d+$/.test(l.id_medicamento) || Number(l.id_medicamento) < 1) {
        errores.lineas = `Línea ${i + 1}: seleccione un medicamento.`;
      } else if (!/^\d+$/.test(l.cantidad) || Number(l.cantidad) < 1 || Number(l.cantidad) > 99999) {
        errores.lineas = `Línea ${i + 1}: la cantidad debe ser un número entero entre 1 y 99999.`;
      }
    });
    if (!errores.lineas) {
      // Se compara como número para que "7" y "07" cuenten como el mismo medicamento.
      const ids = datos.lineas.map((l) => Number(l.id_medicamento));
      if (new Set(ids).size !== ids.length) {
        errores.lineas = 'Hay un medicamento repetido en el pedido. Use una sola línea por medicamento y sume las cantidades.';
      }
    }
  }

  return { datos, errores };
}

module.exports = { ESTADOS, validarPedido };
