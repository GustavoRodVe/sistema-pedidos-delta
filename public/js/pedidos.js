// Ayuda para el formulario de pedido: agregar y quitar líneas y mostrar el total estimado.
// Es solo una comodidad para quien registra. Quien valida y calcula el total real
// es el servidor, con el precio que tiene la base de datos.
document.addEventListener('DOMContentLoaded', () => {
  const cuerpo = document.querySelector('.lineas-pedido tbody');
  const botonAgregar = document.getElementById('agregar-linea');
  const totalEstimado = document.getElementById('total-estimado');
  if (!cuerpo || !botonAgregar) return;

  // Suma precio x cantidad de cada fila y actualiza los subtotales y el total.
  function recalcular() {
    let total = 0;
    cuerpo.querySelectorAll('tr.linea').forEach((fila) => {
      const opcion = fila.querySelector('select').selectedOptions[0];
      const precio = Number(opcion ? opcion.dataset.precio : 0) || 0;
      const cantidad = Number(fila.querySelector('input').value) || 0;
      const subtotal = precio * cantidad;
      fila.querySelector('.subtotal').textContent = subtotal.toFixed(2);
      total += subtotal;
    });
    totalEstimado.textContent = total.toFixed(2);
  }

  // Copia la primera fila y la deja vacía.
  function agregarLinea() {
    const nueva = cuerpo.querySelector('tr.linea').cloneNode(true);
    nueva.querySelector('select').selectedIndex = 0;
    nueva.querySelector('input').value = '';
    cuerpo.appendChild(nueva);
    recalcular();
    nueva.querySelector('select').focus();
  }

  // Siempre debe quedar al menos una línea.
  function quitarLinea(boton) {
    if (cuerpo.querySelectorAll('tr.linea').length > 1) {
      boton.closest('tr.linea').remove();
      recalcular();
    }
  }

  botonAgregar.addEventListener('click', agregarLinea);
  cuerpo.addEventListener('input', recalcular);
  cuerpo.addEventListener('change', recalcular);
  cuerpo.addEventListener('click', (e) => {
    if (e.target.classList.contains('quitar')) quitarLinea(e.target);
  });
  recalcular();
});
