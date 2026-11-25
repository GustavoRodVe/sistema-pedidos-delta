// Validación de los datos para registrar una categoría.
function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function validarCategoria(body) {
  const datos = {
    nombre: texto(body.nombre),
    descripcion: texto(body.descripcion) || null
  };
  const errores = {};

  if (!datos.nombre) errores.nombre = 'El nombre es obligatorio.';
  else if (datos.nombre.length > 60) errores.nombre = 'El nombre no puede tener más de 60 caracteres.';

  if (datos.descripcion && datos.descripcion.length > 150) {
    errores.descripcion = 'La descripción no puede tener más de 150 caracteres.';
  }

  return { datos, errores };
}

module.exports = { validarCategoria };
