// Validación de los datos para registrar un usuario.
function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function validarUsuario(body) {
  // La clave no se devuelve dentro de "datos": así nunca se vuelve a mostrar en el formulario.
  const datos = {
    nombre_completo: texto(body.nombre_completo),
    correo: texto(body.correo).toLowerCase(),
    id_rol: Number.parseInt(body.id_rol, 10) || null
  };
  const clave = typeof body.clave === 'string' ? body.clave : '';
  const errores = {};

  if (!datos.nombre_completo) errores.nombre_completo = 'El nombre completo es obligatorio.';
  else if (datos.nombre_completo.length > 100) errores.nombre_completo = 'El nombre no puede tener más de 100 caracteres.';

  if (!datos.correo) errores.correo = 'El correo es obligatorio.';
  else if (datos.correo.length > 100) errores.correo = 'El correo no puede tener más de 100 caracteres.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) errores.correo = 'Ingrese un correo válido.';

  // bcrypt solo usa los primeros 72 bytes de la clave, por eso ese es el máximo.
  if (!clave) errores.clave = 'La contraseña es obligatoria.';
  else if (clave.length < 8) errores.clave = 'La contraseña debe tener al menos 8 caracteres.';
  else if (clave.length > 72) errores.clave = 'La contraseña no puede tener más de 72 caracteres.';

  if (!datos.id_rol) errores.id_rol = 'Seleccione un rol.';

  return { datos, clave, errores };
}

module.exports = { validarUsuario };
