// Validación de los datos de un medicamento en el servidor.
function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function validarMedicamento(body) {
  const precioTexto = texto(body.precio_mayorista).replace(',', '.');
  const stockTexto = texto(body.stock);
  const datos = {
    nombre: texto(body.nombre),
    presentacion: texto(body.presentacion),
    id_categoria: Number.parseInt(body.id_categoria, 10),
    precio_mayorista: precioTexto,
    stock: stockTexto
  };
  const errores = {};

  if (!datos.nombre) errores.nombre = 'El nombre es obligatorio.';
  else if (datos.nombre.length > 100) errores.nombre = 'El nombre no puede tener más de 100 caracteres.';

  if (!datos.presentacion) errores.presentacion = 'La presentación es obligatoria.';
  else if (datos.presentacion.length > 80) errores.presentacion = 'La presentación no puede tener más de 80 caracteres.';

  if (!Number.isInteger(datos.id_categoria) || datos.id_categoria < 1) {
    errores.id_categoria = 'Seleccione una categoría.';
  }

  if (!precioTexto) {
    errores.precio_mayorista = 'El precio mayorista es obligatorio.';
  } else if (!/^-?\d+(\.\d{1,2})?$/.test(precioTexto)) {
    errores.precio_mayorista = 'El precio debe ser un número con hasta dos decimales.';
  } else if (Number(precioTexto) <= 0) {
    errores.precio_mayorista = 'El precio debe ser mayor que cero.';
  } else if (Number(precioTexto) > 99999999.99) {
    errores.precio_mayorista = 'El precio es demasiado alto.';
  }

  if (stockTexto === '') {
    errores.stock = 'El stock es obligatorio.';
  } else if (!/^-?\d+$/.test(stockTexto)) {
    errores.stock = 'El stock debe ser un número entero.';
  } else if (Number(stockTexto) < 0) {
    errores.stock = 'El stock no puede ser negativo.';
  }

  if (!errores.precio_mayorista) datos.precio_mayorista = Number(precioTexto);
  if (!errores.stock) datos.stock = Number(stockTexto);

  return { datos, errores };
}

module.exports = { validarMedicamento };
