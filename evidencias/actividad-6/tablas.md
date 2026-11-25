Pruebas funcionales

| ID | Caso | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| PF-01 | Acceso sin sesión | Redirección 302 hacia /login | 302 hacia /login | Correcto |
| PF-02 | Inicio de sesión con clave incorrecta | 401 con el mensaje genérico y sin sesión abierta (GET / redirige a /login) | 401, mensaje genérico: sí; luego GET /: 302 hacia /login | Correcto |
| PF-03 | Inicio de sesión de los tres roles | Cada rol: 302 hacia / y el panel (200) muestra su rol | Administrador: 302 y 200; Ejecutivo de ventas: 302 y 200; Encargado de almacén: 302 y 200 | Correcto |
| PF-04 | Cerrar sesión | 302 hacia /login y la cookie anterior deja de servir | 302 hacia /login; con la cookie vieja GET /: 302 hacia /login | Correcto |
| PF-05 | Permisos por rol en el servidor | Las seis solicitudes fuera del rol responden 403 | almacén GET /farmacias: 403; ventas GET /usuarios: 403; ventas GET /categorias: 403; ventas GET /reportes/pedidos: 403; ventas GET /medicamentos/nuevo: 403; almacén POST /pedidos: 403 | Correcto |
| PF-06 | Registrar una farmacia con datos válidos (ventas) | 302 hacia /farmacias?ok=registrada | 302 hacia /farmacias?ok=registrada | Correcto |
| PF-07 | Farmacia con NIT con letras y con zona fuera de la lista | 422 con el mensaje de cada campo | NIT con letras: 422, mensaje sí; zona Marte: 422, mensaje sí | Correcto |
| PF-08 | NIT repetido de una farmacia activa | 409 con el mensaje de NIT ya registrado | 409, mensaje: sí | Correcto |
| PF-09 | Registrar de nuevo el NIT de una farmacia desactivada (regresión del ERR-01) | Desactivar deja activo = 0 y volver a registrar el NIT redirige con ok=reactivada y activo = 1 | desactivar: 302, activo = 0; registrar otra vez: 302 /farmacias?ok=reactivada, activo = 1 | Correcto |
| PF-10 | Registrar medicamentos (administrador): válido, precio 0 y stock negativo | Válido 302; precio 0 y stock negativo 422 con su mensaje | válido: 302; precio 0: 422; stock negativo: 422 | Correcto |
| PF-11 | Registrar categorías (administrador): nueva y repetida | Nueva 302 con ok=registrada; repetida 409 | nueva: 302 /categorias?ok=registrada; repetida: 409 | Correcto |
| PF-12 | Registrar usuarios (administrador): clave corta y correo repetido | Clave de 5 caracteres 422; correo repetido 409 | clave corta: 422, mensaje sí; correo repetido: 409 | Correcto |
| PF-13 | Un usuario desactivado ya no inicia sesión | Antes de desactivarlo 302; después 401 | alta: 302; ingreso: 302; desactivar: 302; ingreso después: 401 | Correcto |
| PF-14 | El administrador no puede desactivarse a sí mismo | Redirección con error=propio y activo sigue en 1 | 302 /usuarios?error=propio; activo = 1 | Correcto |
| PF-15 | Pedido inválido: sin líneas, cantidad 0 y medicamento repetido | Los tres responden 422 y no se crea ningún pedido | sin líneas: 422; cantidad 0: 422; repetido: 422; pedidos antes 0, después 0 | Correcto |
| PF-16 | Transiciones de estado no permitidas | Despachar dos veces: la segunda 409; anular un pedido entregado: 409 con mensaje legible | despachar: 302 y 409; entregar: 302; anular entregado: 409, mensaje legible: sí | Correcto |
| PF-17 | Reporte con fechas inválidas | 422 para una fecha inexistente y para un rango al revés | 2026-02-30: 422; desde posterior a hasta: 422 | Correcto |
| PF-18 | Salida escapada y rutas inválidas | El nombre con etiqueta script se muestra como texto; /no-existe y /pedidos/abc dan 404 | escapado: sí; /no-existe: 404; /pedidos/abc: 404 | Correcto |

Pruebas de integración

| ID | Caso | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| PI-01 | La contraseña se guarda como hash | Hash bcrypt (empieza con $2, 60 caracteres) distinto de la contraseña enviada | empieza con $2b$, 60 caracteres, distinto de la contraseña: sí | Correcto |
| PI-02 | Farmacia guardada y datos rechazados fuera de la base | La fila tiene los datos enviados y los NIT rechazados tienen 0 filas | fila con los datos enviados: sí; filas de los NIT rechazados: 0 | Correcto |
| PI-03 | Pedido de dos líneas con el total calculado en el servidor (se envió precio_unitario=0.01 y total=1) | Redirección al pedido; total = suma de cantidad x precio de la base; usuario de la sesión; estado pendiente; stock sin cambios | 302 hacia /pedidos/14; total 53.50 (suma SQL 53.50), usuario de la sesión: sí, estado pendiente, stock 49->49 y 20->20 | Correcto |
| PI-04 | Despacho con stock insuficiente | 409 que nombra el medicamento, estado pendiente y stock de las dos líneas sin cambios (rollback) | 409, nombra el medicamento: sí, estado pendiente, stock 49->49 y 20->20 | Correcto |
| PI-05 | Despacho correcto descuenta el stock | Estado despachado, fecha de despacho y stock menos 3 y menos 2 | 302, estado despachado, fecha de despacho registrada, stock 49->46 y 20->18 | Correcto |
| PI-06 | Entrega y anulación de pedidos | Entregado con fecha de entrega; un pendiente anulado queda anulado con el stock sin cambios | entregar: 302, estado entregado, fecha de entrega registrada; anular: 302, estado anulado, stock 18->18 | Correcto |
| PI-07 | El total del reporte coincide con la base | Total en pantalla igual a SUM(total) de MySQL sin contar los anulados | 200, total en pantalla Bs 12561.50, suma en MySQL Bs 12561.50, 3 pedidos, anulado excluido: sí | Correcto |
| PI-08 | El listado de medicamentos muestra cada uno con su categoría | El medicamento de prueba aparece con el nombre de su categoría | 200, medicamento y categoría visibles: sí | Correcto |
| PI-09 | El sistema desplegado responde por HTTPS desde Internet (sistema desplegado) | 200 en https://pedidos-delta.onrender.com/login | 200 por HTTPS; tiempo hasta la primera respuesta: 0 s | Correcto |
| PI-10 | Sesión en producción con cookie segura (sistema desplegado) | 302 al ingresar, cookie con Secure y HttpOnly, y GET / con 200 | 302; Secure: sí, HttpOnly: sí; GET /: 200 | Correcto |
| PI-11 | Permisos en la nube (sistema desplegado) | Sin sesión 302 hacia /login; almacén en /farmacias 403 | sin sesión: 302 hacia /login; almacén en /farmacias: 403 | Correcto |
| PI-12 | Un registro hecho desde Internet llega a la base de Aiven (sistema desplegado) | 302 y exactamente 1 fila en Aiven (consulta por TLS) | 302, filas en Aiven: 1 | Correcto |
| PI-13 | El reporte en la nube coincide con la base de Aiven (sistema desplegado) | Total en pantalla igual a SUM(total) de Aiven para el mes en curso, con el pedido de prueba incluido | pedido de prueba: 302; reporte: 200, total en pantalla Bs 35.00, suma en Aiven Bs 35.00, 1 pedido(s) en el rango | Correcto |
| PI-14 | Mínimo privilegio del usuario de la aplicación en la nube (sistema desplegado) | Solo SELECT, INSERT, UPDATE y DELETE sobre delta_pedidos | SELECT, INSERT, UPDATE, DELETE sobre delta_pedidos | Correcto |

Resumen por tipo

| Tipo | Casos | Correctos | Fallidos |
|---|---|---|---|
| Funcional | 18 | 18 | 0 |
| Integración | 14 | 14 | 0 |
| Total | 32 | 32 | 0 |

Resumen por entorno

| Entorno | Casos | Correctos | Fallidos |
|---|---|---|---|
| Local | 26 | 26 | 0 |
| Desplegado | 6 | 6 | 0 |
