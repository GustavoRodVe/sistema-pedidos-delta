// Middlewares de sesión y permisos por rol.

// Nombres de los roles tal como están en la tabla rol. Se usan en rutas y vistas
// para no escribir el texto a mano en cada lugar.
const ROLES = {
  ADMIN: 'Administrador',
  VENTAS: 'Ejecutivo de ventas',
  ALMACEN: 'Encargado de almacén'
};

// Deja el usuario de la sesión y una función tieneRol() disponibles en todas las
// vistas, para que el menú y los botones muestren solo lo que ese rol puede usar.
function cargarUsuario(req, res, next) {
  res.locals.usuario = req.session.usuario || null;
  res.locals.ROLES = ROLES;
  res.locals.tieneRol = (...roles) => Boolean(res.locals.usuario) && roles.includes(res.locals.usuario.rol);
  next();
}

// Si no hay sesión iniciada se manda al login. Va antes de todos los módulos
// para que ninguna pantalla se abra sin haber ingresado.
function requiereSesion(req, res, next) {
  if (req.session.usuario) return next();
  res.redirect('/login');
}

// Deja pasar solo a los roles indicados. Ocultar un botón no alcanza (se puede
// escribir la dirección a mano), por eso el servidor también lo comprueba y responde 403.
function permitirRoles(...roles) {
  return (req, res, next) => {
    if (req.session.usuario && roles.includes(req.session.usuario.rol)) return next();
    res.status(403).render('errores/403');
  };
}

module.exports = { ROLES, cargarUsuario, requiereSesion, permitirRoles };
