# Usuarios y requerimientos

## Actores del sistema

Identificamos tres actores, cada uno asociado a un rol dentro del proceso de pedidos.

| Actor | Responsabilidad | Ejemplos de acciones |
| --- | --- | --- |
| Administrador | Configura y supervisa la información del sistema. | Registrar usuarios y asignarles un rol, registrar medicamentos y categorías, actualizar precios, consultar pedidos y el reporte de pedidos. |
| Ejecutivo de ventas | Atiende a las farmacias y registra sus pedidos. | Registrar y actualizar farmacias, registrar pedidos, consultar el estado de un pedido, anular un pedido pendiente. |
| Encargado de almacén | Controla el stock y la salida de los pedidos. | Consultar el stock, marcar pedidos como despachados y como entregados. |

No incluimos sistemas externos porque el alcance no tiene integración con correo, pagos ni facturación, y por eso el sistema no intercambia información con ningún otro. Tampoco agregamos más roles de los que el proceso necesita: con estos tres se cubre todo lo que ocurre desde que se registra una farmacia hasta que se entrega un pedido.

## Requerimientos funcionales

La columna Actividad prevista indica qué requerimientos se construyen en la Actividad 2 (CRUD de farmacias y medicamentos) y cuáles quedan para actividades posteriores. Las categorías iniciales se cargan con el script SQL, por eso RF-13 se puede construir antes que RF-12.

| Código | Requerimiento funcional | Actor | Prioridad | Actividad prevista |
| --- | --- | --- | --- | --- |
| RF-01 | El sistema deberá permitir iniciar sesión con correo y contraseña. | Administrador, Ejecutivo de ventas, Encargado de almacén | Alta | Act. 3 |
| RF-02 | El sistema deberá permitir cerrar la sesión. | Administrador, Ejecutivo de ventas, Encargado de almacén | Media | Act. 3 |
| RF-03 | El sistema deberá mostrar un panel principal con accesos a los módulos permitidos para el rol del usuario. | Administrador, Ejecutivo de ventas, Encargado de almacén | Media | Act. 3 |
| RF-04 | El sistema deberá permitir registrar un usuario con nombre completo, correo, contraseña y rol. | Administrador | Media | Act. 3 |
| RF-05 | El sistema deberá permitir desactivar un usuario para impedir su acceso. | Administrador | Media | Act. 3 |
| RF-06 | El sistema deberá permitir registrar una farmacia con nombre, NIT, responsable, teléfono, dirección y zona. | Ejecutivo de ventas | Alta | Act. 2 |
| RF-07 | El sistema deberá mostrar el listado de farmacias activas. | Ejecutivo de ventas | Alta | Act. 2 |
| RF-08 | El sistema deberá mostrar el detalle de una farmacia. | Ejecutivo de ventas | Alta | Act. 2 |
| RF-09 | El sistema deberá permitir modificar los datos de una farmacia. | Ejecutivo de ventas | Alta | Act. 2 |
| RF-10 | El sistema deberá permitir desactivar una farmacia conservando su historial de pedidos. | Ejecutivo de ventas | Alta | Act. 2 |
| RF-11 | El sistema deberá permitir buscar farmacias por nombre o NIT. | Ejecutivo de ventas | Media | Act. 3 |
| RF-12 | El sistema deberá permitir registrar una categoría de medicamentos con nombre y descripción. | Administrador | Media | Act. 3 |
| RF-13 | El sistema deberá permitir registrar un medicamento con nombre, presentación, categoría, precio mayorista y stock. | Administrador | Alta | Act. 2 |
| RF-14 | El sistema deberá mostrar el listado de medicamentos activos con su categoría, precio mayorista y stock. | Administrador, Ejecutivo de ventas, Encargado de almacén | Alta | Act. 2 |
| RF-15 | El sistema deberá mostrar el detalle de un medicamento. | Administrador, Ejecutivo de ventas, Encargado de almacén | Alta | Act. 2 |
| RF-16 | El sistema deberá permitir modificar los datos de un medicamento. | Administrador | Alta | Act. 2 |
| RF-17 | El sistema deberá permitir desactivar un medicamento. | Administrador | Alta | Act. 2 |
| RF-18 | El sistema deberá permitir registrar un pedido para una farmacia activa con uno o más medicamentos y sus cantidades. | Ejecutivo de ventas | Alta | Act. 3 |
| RF-19 | El sistema deberá calcular automáticamente el subtotal de cada medicamento y el total del pedido. | Ejecutivo de ventas | Alta | Act. 3 |
| RF-20 | El sistema deberá mostrar el listado de pedidos filtrado por estado o por farmacia. | Administrador, Ejecutivo de ventas, Encargado de almacén | Alta | Act. 3 |
| RF-21 | El sistema deberá mostrar el detalle de un pedido con sus medicamentos, cantidades, precios y total. | Administrador, Ejecutivo de ventas, Encargado de almacén | Alta | Act. 3 |
| RF-22 | El sistema deberá permitir marcar un pedido pendiente como despachado. | Encargado de almacén | Alta | Act. 3 |
| RF-23 | El sistema deberá descontar del stock las cantidades de un pedido cuando se marca como despachado. | Encargado de almacén | Alta | Act. 3 |
| RF-24 | El sistema deberá impedir el despacho de un pedido si el stock de algún medicamento no alcanza, indicando cuál. | Encargado de almacén | Alta | Act. 3 |
| RF-25 | El sistema deberá permitir marcar un pedido despachado como entregado. | Encargado de almacén | Alta | Act. 3 |
| RF-26 | El sistema deberá permitir anular un pedido que todavía está pendiente. | Ejecutivo de ventas | Media | Act. 3 |
| RF-27 | El sistema deberá generar un reporte de pedidos por farmacia en un rango de fechas. | Administrador | Media | Act. 3 |

## Requerimientos no funcionales

Los requerimientos no funcionales están escritos como condiciones que se pueden comprobar durante las pruebas.

| Código | Tipo | Requerimiento no funcional | Justificación |
| --- | --- | --- | --- |
| RNF-01 | Seguridad | La aplicación deberá pedir inicio de sesión antes de mostrar cualquier módulo y mostrar a cada usuario solo las opciones de su rol. | Los pedidos, los precios y los datos de las farmacias son información interna del laboratorio. |
| RNF-02 | Seguridad | La aplicación deberá guardar las contraseñas como hash (bcrypt), de modo que en la tabla usuario no se vea la contraseña original. | Si alguien accede a la base de datos no obtiene las contraseñas de los usuarios. |
| RNF-03 | Seguridad | La aplicación deberá ejecutar las consultas a la base de datos con parámetros, sin concatenar lo que escribe el usuario. | Evita la inyección SQL. |
| RNF-04 | Compatibilidad | La aplicación deberá funcionar en las versiones actuales de Chrome, Edge y Firefox. | Son los navegadores que usa el personal del laboratorio. |
| RNF-05 | Usabilidad | La aplicación deberá mostrar mensajes de validación y de error en español, que indiquen qué campo corregir y sin detalles técnicos como errores de SQL. | El usuario corrige el dato sin ayuda y no se expone información interna. |
| RNF-06 | Usabilidad | La aplicación deberá poder usarse en computadora y en tablet, desde 768 píxeles de ancho, sin desplazamiento horizontal. | El personal del almacén puede trabajar con una tablet. |
| RNF-07 | Rendimiento | La aplicación deberá responder en menos de 3 segundos en los listados y formularios, con los datos de prueba del proyecto y en el equipo de desarrollo. | Es una condición que se puede medir durante las pruebas. |
| RNF-08 | Mantenibilidad | La aplicación deberá tener el código organizado con el patrón MVC, con modelos, vistas, controladores y rutas en carpetas separadas. | Facilita hacer cambios en las siguientes actividades. |
| RNF-09 | Respaldo y versionado | El código y la documentación deberán estar versionados en GitHub, con commits descriptivos. | Evita la pérdida de trabajo y deja un historial de cambios. |
| RNF-10 | Integridad | La aplicación deberá desactivar farmacias, medicamentos y usuarios mediante el campo activo, en lugar de eliminarlos. | Conserva el historial de pedidos. |
