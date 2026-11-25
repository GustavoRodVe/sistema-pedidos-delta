# Sistema de Pedidos Mayoristas - Laboratorio Químico Delta

Este repositorio es el proyecto del semestre de la materia Desarrollo de Sistemas II (Ingeniería de Sistemas, UPDS, sede Cochabamba). Se trata de una aplicación web para registrar y hacer seguimiento a los pedidos al por mayor que las farmacias le hacen al laboratorio.

Laboratorio Químico Delta es una empresa ficticia creada solo para este trabajo académico. Todos los datos que aparecen en el repositorio son datos de prueba.

Estudiante: Gustavo Rodríguez Vélez

Sistema desplegado: https://pedidos-delta.onrender.com. Está en el plan gratuito de Render, que se duerme cuando no se usa, así que la primera visita puede tardar cerca de un minuto en responder. Se puede ingresar con los usuarios de prueba que aparecen más abajo (admin@delta.test, ventas@delta.test y almacen@delta.test).

## Alcance

El sistema cubre un solo proceso: la recepción y el seguimiento de los pedidos mayoristas. Incluye farmacias, el catálogo de medicamentos por categorías, pedidos con su detalle y estado, usuarios con roles y el descuento de stock al despachar. No incluye contabilidad, facturación, producción, lotes ni pagos en línea.

## Herramientas

Node.js, Express, EJS, MySQL 8.4, Git y GitHub, draw.io y un prototipo en HTML y CSS. Para el inicio de sesión se usan express-session (guarda la sesión del usuario) y bcryptjs (calcula y compara el hash de las contraseñas).

## Estructura del repositorio

- documentacion/: los textos de cada actividad en Markdown y los PDF entregados.
- diagramas/: los diagramas en formato .drawio (editables) junto con su exportación en .png.
- prototipos/: el prototipo navegable de las pantallas (abrir index.html).
- database/: el script SQL de la base de datos (script_inicial.sql) y actividad6.sql, que agrega los usuarios de prueba a una base ya creada.
- src/: la aplicación bajo MVC (config, models, controllers, routes, validators, views).
- src/middlewares/: la sesión y los permisos por rol (requiereSesion y permitirRoles).
- src/views/partials/: partes comunes de las pantallas (encabezado con menú, pie con el cuadro de confirmación, mensaje de éxito y el componente de campo de formulario).
- public/css/estilos.css: estilos globales con los colores del prototipo guardados como variables.
- public/js/app.js: comportamiento de la interfaz (menú en celular, validación en el navegador, estados de carga y confirmación).
- public/js/pedidos.js: agregar y quitar líneas en el formulario de pedido y mostrar el total estimado.
- public/img/: logotipo del sistema.
- pruebas/: pruebas-act6.cjs es el plan de pruebas actual (casos funcionales y de integración, en local y contra el sistema desplegado), capturas-act6.cjs hace el recorrido con capturas y servidor-local.cjs arranca la aplicación para ambos. pruebas-act4.cjs se conserva como historial: se hizo antes del inicio de sesión y ya no se puede usar tal cual.
- evidencias/: capturas y resultados de las pruebas de la Actividad 2, del recorrido de la Actividad 3 (evidencias/actividad-3) y de la Actividad 6 (evidencias/actividad-6, con las capturas, los resultados en JSON y Markdown y la salida de la terminal).
- documentacion/actividad-6/: el documento final de la Actividad 6 en Markdown y el PDF entregado.

## Arquitectura del frontend

La aplicación usa MVC con vistas generadas por el servidor. No hay un frontend separado ni una API: el navegador pide una ruta, Express ejecuta el controlador, el modelo consulta MySQL y la vista EJS devuelve la página ya armada. Los formularios envían los datos con POST a las rutas del mismo servidor. El JavaScript de public/js/app.js solo mejora la experiencia (valida antes de enviar, muestra "Guardando..." y pide confirmación), pero la validación del servidor sigue siendo la que decide.

Pantallas implementadas:

| Pantalla | Ruta |
|---|---|
| Inicio de sesión | /login |
| Panel principal (con pedidos por estado) | / |
| Listado y búsqueda de farmacias | /farmacias, /farmacias?buscar=texto |
| Registrar farmacia | /farmacias/nueva |
| Detalle de farmacia | /farmacias/:id |
| Editar farmacia | /farmacias/:id/editar |
| Catálogo y filtro de medicamentos | /medicamentos, /medicamentos?categoria=id |
| Registrar medicamento | /medicamentos/nuevo |
| Detalle de medicamento | /medicamentos/:id |
| Editar medicamento | /medicamentos/:id/editar |
| Listado y filtros de pedidos | /pedidos, /pedidos?estado=pendiente&farmacia=id |
| Registrar pedido | /pedidos/nuevo |
| Detalle de pedido (despachar, entregar, anular) | /pedidos/:id |
| Usuarios (solo administrador) | /usuarios, /usuarios/nuevo |
| Categorías (solo administrador) | /categorias |
| Reporte de pedidos por farmacia (solo administrador) | /reportes/pedidos |
| Acceso no permitido | cuando el rol no tiene permiso (403) |
| Página no encontrada | cualquier otra ruta |

## Usuarios de prueba y permisos

El sistema pide iniciar sesión con correo y contraseña antes de mostrar cualquier pantalla. Hay un usuario de prueba por cada rol:

| Rol | Correo |
|---|---|
| Administrador | admin@delta.test |
| Ejecutivo de ventas | ventas@delta.test |
| Encargado de almacén | almacen@delta.test |

Los tres usan la misma contraseña ficticia de prueba, Delta2026. En la base solo se guarda su hash bcrypt, nunca la contraseña en texto. Esta contraseña hay que cambiarla antes de usar el sistema con datos reales.

Cada rol ve en el menú solo lo que puede usar, y además el servidor responde con la página 403 si alguien escribe a mano una dirección que no le corresponde.

| Rol | Qué puede hacer |
|---|---|
| Administrador | Todo: usuarios, categorías, medicamentos, farmacias, pedidos y el reporte |
| Ejecutivo de ventas | Gestionar farmacias, ver medicamentos, registrar y anular pedidos y ver el listado de pedidos |
| Encargado de almacén | Ver medicamentos y pedidos, despachar pedidos (descuenta el stock) y marcarlos como entregados |

Un usuario desactivado ya no puede ingresar, aunque su fila se conserva porque puede figurar como quien registró pedidos. Un administrador no puede desactivarse a sí mismo.

## Flujo de un pedido

Un pedido nuevo queda pendiente y todavía no toca el stock. Al despacharlo, el sistema descuenta de golpe el stock de todos sus medicamentos; si alguno no alcanza, no se descuenta nada y se avisa cuáles faltan. Después se marca como entregado. Un pedido solo se puede anular mientras está pendiente. El precio de cada medicamento se toma de la base de datos al registrar el pedido, no del formulario.

## Cómo ejecutar

1. Instalar Node.js y MySQL 8.
2. Crear la base ejecutando database/script_inicial.sql en MySQL. Con una instalación nueva ya trae los tres usuarios de prueba.
3. Si la base ya estaba creada de antes, ejecutar database/actividad6.sql para agregar los usuarios de prueba, por ejemplo con mysql -u delta_app -p delta_pedidos < database/actividad6.sql. Se puede correr más de una vez sin duplicar nada.
4. Copiar .env.example como .env y completar los datos del usuario de la base.
5. Instalar dependencias con npm install.
6. Iniciar con npm start, abrir http://localhost:3000 e ingresar con alguno de los usuarios de prueba.

Para repetir las pruebas hace falta MySQL encendido con la base creada: node pruebas/pruebas-act6.cjs arranca la aplicación en el puerto 3100, ejecuta los 32 casos y escribe los resultados en evidencias/actividad-6. Los casos contra el sistema desplegado necesitan además un archivo JSON con los datos de la base en la nube (variable DELTA_AIVEN_JSON), que no está en el repositorio. Las capturas se vuelven a generar con node pruebas/capturas-act6.cjs, que usa Playwright instalado de forma global.

La dirección del servidor y los datos de conexión se configuran solo en el archivo .env (PORT y DB_*), que no se sube al repositorio. En la consola se registra cada solicitud con su código de respuesta, lo que ayuda a comprobar que las acciones de la interfaz llegan al servidor.

## Variables para el despliegue

La aplicación está publicada en Render (servicio web con el plan gratuito, instalación con npm ci --omit=dev e inicio con npm start) y usa una base MySQL 8.4 en Aiven. En el servicio se configuran las variables NODE_ENV, SESSION_SECRET, DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL y DB_CA; sus valores no se guardan en el repositorio. La aplicación se conecta con un usuario que solo tiene SELECT, INSERT, UPDATE y DELETE sobre la base. NODE_ENV=production activa la cookie de sesión segura y la confianza en el proxy, y obliga a definir SESSION_SECRET, un texto largo y aleatorio con el que se firma la cookie; sin él la aplicación no arranca. Para la conexión cifrada a MySQL, DB_SSL=true verifica el certificado con el contenido de ca.pem en DB_CA (puede pegarse en una sola línea con \n entre líneas), y DB_SSL=sin-verificar cifra sin comprobar el certificado, algo menos seguro que solo sirve como plan B. Las sesiones viven en la memoria del servidor, así que se pierden al reiniciarlo; para este proyecto académico es aceptable.

## Estado

- Actividad 1 (análisis y modelado): entregada.
- Actividad 2 (CRUD de farmacias y medicamentos bajo MVC): entregada.
- Actividad 3 (frontend de farmacias y medicamentos): entregada.
- Actividad 4 (pruebas y despliegue): entregada.
- Actividad 5 (examen práctico): realizada.
- Actividad 6 (proyecto terminado): terminada. Inicio de sesión con roles, usuarios, categorías, pedidos con despacho y control de stock, reporte de pedidos por farmacia, plan de pruebas de 32 casos y despliegue en Render con la base en Aiven.
