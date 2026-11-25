// Controlador de sesión: inicio y cierre de sesión.
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuarioModel');

// Mismo mensaje para correo inexistente, clave incorrecta y usuario inactivo,
// así nadie puede averiguar qué correos están registrados.
const ERROR_CREDENCIALES = 'Correo o contraseña incorrectos.';

const sesionController = {
  // GET /login
  formulario(req, res) {
    if (req.session.usuario) return res.redirect('/');
    res.render('login', { correo: '', error: null });
  },

  // POST /login
  async iniciar(req, res, next) {
    const correo = String(req.body.correo || '').trim().toLowerCase();
    const clave = String(req.body.clave || '');
    if (!correo || !clave) {
      return res.status(422).render('login', { correo, error: 'Ingrese su correo y su contraseña.' });
    }
    try {
      const usuario = await Usuario.buscarPorCorreo(correo);
      const valido = usuario && usuario.activo && await bcrypt.compare(clave, usuario.clave_hash);
      if (!valido) {
        return res.status(401).render('login', { correo, error: ERROR_CREDENCIALES });
      }
      // regenerate crea una sesión nueva al ingresar, para que un identificador de
      // sesión puesto de antemano por otra persona no sirva (fijación de sesión).
      req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.usuario = {
          id_usuario: usuario.id_usuario,
          nombre_completo: usuario.nombre_completo,
          rol: usuario.rol
        };
        res.redirect('/');
      });
    } catch (err) {
      next(err);
    }
  },

  // POST /logout
  cerrar(req, res, next) {
    req.session.destroy((err) => {
      if (err) return next(err);
      res.clearCookie('connect.sid');
      res.redirect('/login');
    });
  }
};

module.exports = sesionController;
