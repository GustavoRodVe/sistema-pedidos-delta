# Tecnologías seleccionadas

La selección la hicimos pensando en el alcance del proyecto, en lo que ya conocemos y en que cada herramienta permita organizar el sistema bajo el patrón MVC. Esta propuesta queda sujeta a la aprobación docente; si el docente define una tecnología común para el curso, ajustaremos la matriz antes de seguir con la implementación.

## Matriz tecnológica

| Parte | Tecnología propuesta | ¿Para qué se utilizará? | Justificación |
| --- | --- | --- | --- |
| Backend | Node.js con Express 4 | Recibir las solicitudes, aplicar las reglas del negocio y coordinar el acceso a los datos. | Express es liviano y deja organizar el código en rutas, controladores y modelos, que es justamente la separación que pide MVC. Ya trabajamos con JavaScript en otras materias y su documentación es amplia. |
| Frontend | Vistas EJS con HTML y CSS | Construir las pantallas que usan las personas, generadas desde el servidor. | Con EJS las vistas se arman en el mismo proyecto y reciben los datos del controlador, sin necesidad de una aplicación aparte. Reutiliza los estilos del prototipo. |
| Base de datos | MySQL 8 (motor InnoDB) | Guardar farmacias, medicamentos, pedidos y usuarios. | Es relacional, soporta claves foráneas, restricciones CHECK y transacciones, que necesitamos para registrar un pedido con su detalle y descontar stock. Lo usamos en Administración de Base de Datos. |
| Acceso a datos | Librería mysql2 | Ejecutar las consultas desde los modelos. | Permite consultas con parámetros, lo que evita la inyección SQL, y maneja un grupo de conexiones reutilizables. |
| Gestor de base de datos | MySQL Workbench | Crear la base, ejecutar el script y revisar las tablas. | Es la herramienta oficial de MySQL y muestra la estructura de forma visual. |
| Editor | Visual Studio Code | Escribir el código y la documentación. | Es gratuito, tiene terminal integrada y extensiones para JavaScript, EJS y Git. |
| Diagramación | draw.io (diagrams.net) | Elaborar los diagramas UML, C4 y de base de datos. | Guarda archivos editables .drawio y exporta imágenes PNG para el documento. |
| Prototipado | HTML y CSS | Diseñar y revisar las pantallas antes de programar. | El prototipo se abre en cualquier navegador y sus estilos se reutilizan en la aplicación. |
| Control de versiones | Git y GitHub | Registrar los cambios y respaldar el código y la documentación. | Mantiene el historial del trabajo y permite que el docente revise el avance. |
| Pruebas de rutas | Navegador web y Postman | Comprobar cada operación y sus respuestas. | Las rutas se pueden probar desde los formularios y también enviando solicitudes directas. |
| Despliegue | Servicio en la nube con soporte para Node.js y MySQL (por ejemplo Railway o Render) | Publicar la aplicación para la Actividad 4. | Tienen planes gratuitos o de bajo costo y se conectan con el repositorio de GitHub. La elección final se hará en la Actividad 4. |

## Rutas previstas para la Actividad 2

Como la aplicación genera sus vistas desde el servidor, las operaciones se exponen como rutas MVC que reciben formularios. Los formularios HTML solo envían GET y POST, por eso la edición y la desactivación usan POST con una ruta propia en lugar de PUT y DELETE. En esta etapa dejamos identificadas las rutas de los dos módulos que se implementarán primero.

| Recurso | Operación | Método y ruta |
| --- | --- | --- |
| Farmacias | Listar farmacias activas (con búsqueda opcional) | GET /farmacias |
| Farmacias | Mostrar el formulario de registro | GET /farmacias/nueva |
| Farmacias | Registrar una farmacia | POST /farmacias |
| Farmacias | Ver el detalle | GET /farmacias/:id |
| Farmacias | Mostrar el formulario de edición | GET /farmacias/:id/editar |
| Farmacias | Guardar los cambios | POST /farmacias/:id/editar |
| Farmacias | Desactivar | POST /farmacias/:id/desactivar |
| Medicamentos | Listar medicamentos activos (filtro por categoría) | GET /medicamentos |
| Medicamentos | Mostrar el formulario de registro | GET /medicamentos/nuevo |
| Medicamentos | Registrar un medicamento | POST /medicamentos |
| Medicamentos | Ver el detalle | GET /medicamentos/:id |
| Medicamentos | Mostrar el formulario de edición | GET /medicamentos/:id/editar |
| Medicamentos | Guardar los cambios | POST /medicamentos/:id/editar |
| Medicamentos | Desactivar | POST /medicamentos/:id/desactivar |

Las rutas de pedidos, usuarios y autenticación (por ejemplo /pedidos, /pedidos/:id/despachar y /login) se definirán en la Actividad 3 siguiendo la misma convención.

## Estructura inicial del desarrollo

El repositorio se organiza en una sola aplicación con las carpetas de documentación del proyecto y las carpetas propias de MVC dentro de src/.

| Carpeta o archivo | Contenido |
| --- | --- |
| documentacion/ | Textos de cada actividad en Markdown y los documentos entregados. |
| diagramas/ | Diagramas UML, C4 y de base de datos en .drawio y .png. |
| prototipos/ | Prototipo navegable en HTML y sus capturas. |
| database/ | Script SQL inicial de la base de datos. |
| src/config/ | Configuración de la conexión a MySQL. |
| src/models/ | Modelos: consultas y operaciones sobre cada tabla. |
| src/controllers/ | Controladores de cada módulo. |
| src/routes/ | Rutas que relacionan cada dirección con una acción del controlador. |
| src/validators/ | Validaciones de los datos que llegan de los formularios. |
| src/views/ | Vistas EJS organizadas por módulo. |
| public/ | Archivos estáticos, como la hoja de estilos. |
| .env.example | Ejemplo de variables de entorno, sin contraseñas reales. |
