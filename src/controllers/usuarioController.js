// Controlador de Usuarios (solo el administrador): listar, registrar y desactivar.
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuarioModel');
const Rol = require('../models/rolModel');
const { validarUsuario } = require('../validators/usuarioValidator');

const MENSAJES = {
  registrado: 'El usuario se registró correctamente.',
  desactivado: 'El usuario fue desactivado y ya no puede ingresar al sistema.'
};
const ERRORES = {
  propio: 'No puede desactivar su propio usuario.'
};

async function mostrarFormulario(res, { usuario, errores = {}, status = 200 }) {
  const roles = await Rol.listar();
  return res.status(status).render('usuarios/form', { datosUsuario: usuario, errores, roles });
}

const usuarioController = {
  // GET /usuarios
  async listar(req, res, next) {
    try {
      const usuarios = await Usuario.listar();
      res.render('usuarios/index', {
        usuarios,
        mensaje: MENSAJES[req.query.ok] || null,
        error: ERRORES[req.query.error] || null
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /usuarios/nuevo
  async formularioNuevo(req, res, next) {
    try {
      await mostrarFormulario(res, { usuario: {} });
    } catch (err) {
      next(err);
    }
  },

  // POST /usuarios
  async crear(req, res, next) {
    try {
      const { datos, clave, errores } = validarUsuario(req.body);
      if (!errores.id_rol && !(await Rol.existe(datos.id_rol))) {
        errores.id_rol = 'El rol seleccionado no existe.';
      }
      if (Object.keys(errores).length > 0) {
        return await mostrarFormulario(res, { usuario: datos, errores, status: 422 });
      }
      // La contraseña se guarda solo como hash; el 10 es el costo del cálculo de bcrypt.
      const claveHash = await bcrypt.hash(clave, 10);
      await Usuario.crear(datos, claveHash);
      res.redirect('/usuarios?ok=registrado');
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        const { datos } = validarUsuario(req.body);
        return mostrarFormulario(res, {
          usuario: datos,
          errores: { correo: 'Ya existe un usuario registrado con este correo.' },
          status: 409
        }).catch(next);
      }
      next(err);
    }
  },

  // POST /usuarios/:id/desactivar
  async desactivar(req, res, next) {
    try {
      const id = Number(req.params.id);
      // Un administrador no puede quitarse a sí mismo el acceso (se quedaría sin sesión).
      if (id === req.session.usuario.id_usuario) return res.redirect('/usuarios?error=propio');
      const cambiadas = Number.isInteger(id) && id > 0 ? await Usuario.desactivar(id) : 0;
      if (cambiadas === 0) {
        return res.status(404).render('errores/404', {
          titulo: 'Usuario no encontrado',
          mensaje: 'El usuario que busca no existe o ya estaba desactivado.',
          volver: '/usuarios'
        });
      }
      res.redirect('/usuarios?ok=desactivado');
    } catch (err) {
      next(err);
    }
  }
};

module.exports = usuarioController;
