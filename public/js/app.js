// Comportamiento de la interfaz del Sistema de Pedidos Mayoristas.
// Las vistas las genera el servidor (EJS); este archivo solo agrega:
// menú para celular, validación en el navegador, estados de carga,
// cuadro de confirmación y cierre de mensajes.
// La validación del servidor se mantiene: esta es solo una ayuda para el usuario.

// Reglas de validación. Son las mismas de src/validators en el servidor,
// con los mismos mensajes, para que el usuario vea el mismo texto en ambos casos.
const soloTexto = (v) => v.trim();
const REGLAS = {
  farmacia: {
    nombre: (v) => !soloTexto(v) ? 'El nombre es obligatorio.'
      : v.trim().length > 100 ? 'El nombre no puede tener más de 100 caracteres.' : '',
    nit: (v) => !soloTexto(v) ? 'El NIT es obligatorio.'
      : !/^\d{7,20}$/.test(v.trim()) ? 'El NIT debe tener solo números (entre 7 y 20 dígitos).' : '',
    responsable: (v) => v.trim().length > 100 ? 'El nombre del responsable no puede tener más de 100 caracteres.' : '',
    telefono: (v) => !soloTexto(v) ? 'El teléfono es obligatorio.'
      : !/^[0-9 +-]{7,20}$/.test(v.trim()) ? 'El teléfono solo puede tener números, espacios, + o - (de 7 a 20 caracteres).' : '',
    direccion: (v) => !soloTexto(v) ? 'La dirección es obligatoria.'
      : v.trim().length > 150 ? 'La dirección no puede tener más de 150 caracteres.' : '',
    zona: (v) => !v ? 'Seleccione una zona.' : ''
  },
  medicamento: {
    nombre: (v) => !soloTexto(v) ? 'El nombre es obligatorio.'
      : v.trim().length > 100 ? 'El nombre no puede tener más de 100 caracteres.' : '',
    presentacion: (v) => !soloTexto(v) ? 'La presentación es obligatoria.'
      : v.trim().length > 80 ? 'La presentación no puede tener más de 80 caracteres.' : '',
    id_categoria: (v) => !v ? 'Seleccione una categoría.' : '',
    precio_mayorista: (v) => {
      const p = v.trim().replace(',', '.');
      if (!p) return 'El precio mayorista es obligatorio.';
      if (!/^-?\d+(\.\d{1,2})?$/.test(p)) return 'El precio debe ser un número con hasta dos decimales.';
      if (Number(p) <= 0) return 'El precio debe ser mayor que cero.';
      if (Number(p) > 99999999.99) return 'El precio es demasiado alto.';
      return '';
    },
    stock: (v) => {
      const s = v.trim();
      if (s === '') return 'El stock es obligatorio.';
      if (!/^-?\d+$/.test(s)) return 'El stock debe ser un número entero.';
      if (Number(s) < 0) return 'El stock no puede ser negativo.';
      return '';
    }
  }
};

// Muestra u oculta el error de un campo junto al control.
function marcarCampo(control, mensaje) {
  const campo = control.closest('.campo');
  const caja = document.getElementById('error-' + control.id);
  campo.classList.toggle('error', Boolean(mensaje));
  if (mensaje) control.setAttribute('aria-invalid', 'true');
  else control.removeAttribute('aria-invalid');
  if (caja) caja.textContent = mensaje;
}

function validarFormulario(form) {
  const reglas = REGLAS[form.dataset.validar];
  let primerError = null;
  for (const [nombre, regla] of Object.entries(reglas)) {
    const control = form.elements[nombre];
    if (!control) continue;
    const mensaje = regla(control.value);
    marcarCampo(control, mensaje);
    if (mensaje && !primerError) primerError = control;
  }
  const resumen = document.querySelector('.resumen-errores');
  if (resumen) resumen.hidden = !primerError;
  if (primerError) primerError.focus();
  return !primerError;
}

// Indicador "Cargando..." mientras el servidor responde.
function mostrarCargando(texto) {
  const caja = document.querySelector('.cargando');
  if (!caja) return;
  caja.querySelector('.texto-cargando').textContent = texto || 'Cargando...';
  caja.hidden = false;
}

function bloquearEnvio(form) {
  const boton = form.querySelector('button[type=submit]');
  if (!boton) return;
  boton.disabled = true;
  boton.dataset.textoOriginal = boton.textContent;
  boton.textContent = form.dataset.cargando || 'Procesando...';
}

// Cuadro de confirmación antes de desactivar un registro.
function prepararConfirmacion() {
  const modal = document.getElementById('modal-confirmar');
  if (!modal || typeof modal.showModal !== 'function') return;
  let formPendiente = null;

  document.querySelectorAll('form[data-confirmar]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      if (form.dataset.confirmado === 'si') return;
      e.preventDefault();
      formPendiente = form;
      document.getElementById('modal-texto').textContent = form.dataset.confirmar;
      modal.showModal();
      modal.querySelector('[data-accion=cancelar]').focus();
    });
  });

  modal.querySelector('[data-accion=cancelar]').addEventListener('click', () => {
    formPendiente = null;
    modal.close();
  });
  modal.querySelector('[data-accion=confirmar]').addEventListener('click', (e) => {
    if (!formPendiente) return;
    e.currentTarget.disabled = true; // evita confirmar dos veces
    formPendiente.dataset.confirmado = 'si';
    bloquearEnvio(formPendiente);
    mostrarCargando('Desactivando...');
    modal.close();
    formPendiente.submit();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Menú desplegable en pantallas pequeñas
  const botonMenu = document.querySelector('.boton-menu');
  const menu = document.getElementById('menu-principal');
  if (botonMenu && menu) {
    botonMenu.addEventListener('click', () => {
      const abierto = botonMenu.getAttribute('aria-expanded') === 'true';
      botonMenu.setAttribute('aria-expanded', String(!abierto));
      menu.classList.toggle('abierto', !abierto);
    });
  }

  // Cerrar mensajes de confirmación
  document.querySelectorAll('.alerta .cerrar').forEach((b) => {
    b.addEventListener('click', () => b.closest('.alerta').remove());
  });

  // Formularios con validación y estado de envío
  document.querySelectorAll('form[data-validar]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      if (!validarFormulario(form)) {
        e.preventDefault();
        return;
      }
      bloquearEnvio(form);
      mostrarCargando('Guardando los datos...');
    });
    // Cuando el usuario corrige un campo marcado, el error se actualiza al momento
    const reglas = REGLAS[form.dataset.validar];
    Object.keys(reglas).forEach((nombre) => {
      const control = form.elements[nombre];
      if (!control) return;
      const revisar = () => {
        if (control.closest('.campo').classList.contains('error')) marcarCampo(control, reglas[nombre](control.value));
      };
      control.addEventListener('input', revisar);
      control.addEventListener('change', revisar);
    });
  });

  // Búsqueda y filtros: indicador mientras llega el resultado
  document.querySelectorAll('form[method=get][data-cargando]').forEach((form) => {
    form.addEventListener('submit', () => mostrarCargando(form.dataset.cargando));
  });

  // Enlaces internos: si la respuesta tarda, se muestra "Cargando..."
  document.querySelectorAll('a[href^="/"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (e.ctrlKey || e.metaKey || e.shiftKey) return;
      setTimeout(() => mostrarCargando('Cargando...'), 150);
    });
  });

  prepararConfirmacion();
});

// Al volver con el botón "Atrás" el navegador puede mostrar la página guardada:
// se quitan el indicador y los botones bloqueados.
window.addEventListener('pageshow', () => {
  const caja = document.querySelector('.cargando');
  if (caja) caja.hidden = true;
  document.querySelectorAll('button[data-texto-original]').forEach((b) => {
    b.disabled = false;
    b.textContent = b.dataset.textoOriginal;
  });
});
