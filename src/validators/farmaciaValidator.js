// Validación de los datos de una farmacia en el servidor.
// Devuelve los datos limpios y un objeto con los errores por campo.
const ZONAS = ['Centro', 'Norte', 'Sud', 'Este', 'Oeste', 'Quillacollo', 'Sacaba', 'Tiquipaya'];

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function validarFarmacia(body) {
  const datos = {
    nombre: texto(body.nombre),
    nit: texto(body.nit),
    responsable: texto(body.responsable) || null,
    telefono: texto(body.telefono),
    direccion: texto(body.direccion),
    zona: texto(body.zona)
  };
  const errores = {};

  if (!datos.nombre) errores.nombre = 'El nombre es obligatorio.';
  else if (datos.nombre.length > 100) errores.nombre = 'El nombre no puede tener más de 100 caracteres.';

  if (!datos.nit) errores.nit = 'El NIT es obligatorio.';
  else if (!/^\d{7,20}$/.test(datos.nit)) errores.nit = 'El NIT debe tener solo números (entre 7 y 20 dígitos).';

  if (datos.responsable && datos.responsable.length > 100) {
    errores.responsable = 'El nombre del responsable no puede tener más de 100 caracteres.';
  }

  if (!datos.telefono) errores.telefono = 'El teléfono es obligatorio.';
  else if (!/^[0-9 +-]{7,20}$/.test(datos.telefono)) errores.telefono = 'El teléfono solo puede tener números, espacios, + o - (de 7 a 20 caracteres).';

  if (!datos.direccion) errores.direccion = 'La dirección es obligatoria.';
  else if (datos.direccion.length > 150) errores.direccion = 'La dirección no puede tener más de 150 caracteres.';

  if (!datos.zona) errores.zona = 'Seleccione una zona.';
  else if (!ZONAS.includes(datos.zona)) errores.zona = 'La zona seleccionada no es válida.';

  return { datos, errores };
}

module.exports = { validarFarmacia, ZONAS };
