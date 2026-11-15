# Sistema de Pedidos Mayoristas - Laboratorio Químico Delta

Este repositorio es el proyecto del semestre de la materia Desarrollo de Sistemas II (Ingeniería de Sistemas, UPDS, sede Cochabamba). Se trata de una aplicación web para registrar y hacer seguimiento a los pedidos al por mayor que las farmacias le hacen al laboratorio.

Laboratorio Químico Delta es una empresa ficticia creada solo para este trabajo académico. Todos los datos que aparecen en el repositorio son datos de prueba.

Estudiante: Gustavo Rodríguez Vélez

## Alcance

El sistema cubre un solo proceso: la recepción y el seguimiento de los pedidos mayoristas. Incluye farmacias, el catálogo de medicamentos por categorías, pedidos con su detalle y estado, usuarios con roles y el descuento de stock al despachar. No incluye contabilidad, facturación, producción, lotes ni pagos en línea.

## Herramientas

Node.js, Express, EJS, MySQL 8, Git y GitHub, draw.io y un prototipo en HTML y CSS. La tecnología está sujeta a la aprobación docente.

## Estructura del repositorio

- documentacion/: los textos de cada actividad en Markdown y los PDF entregados.
- diagramas/: los diagramas en formato .drawio (editables) junto con su exportación en .png.
- prototipos/: el prototipo navegable de las pantallas (abrir index.html).
- database/: el script SQL de la base de datos.
- src/: la aplicación bajo MVC (config, models, controllers, routes, validators, views).
- src/views/partials/: partes comunes de las pantallas (encabezado con menú, pie con el cuadro de confirmación, mensaje de éxito y el componente de campo de formulario).
- public/css/estilos.css: estilos globales con los colores del prototipo guardados como variables.
- public/js/app.js: comportamiento de la interfaz (menú en celular, validación en el navegador, estados de carga y confirmación).
- public/img/: logotipo del sistema.
- evidencias/: capturas y resultados de las pruebas de la Actividad 2 y del recorrido de la Actividad 3 (evidencias/actividad-3).

## Arquitectura del frontend

La aplicación usa MVC con vistas generadas por el servidor. No hay un frontend separado ni una API: el navegador pide una ruta, Express ejecuta el controlador, el modelo consulta MySQL y la vista EJS devuelve la página ya armada. Los formularios envían los datos con POST a las rutas del mismo servidor. El JavaScript de public/js/app.js solo mejora la experiencia (valida antes de enviar, muestra "Guardando..." y pide confirmación), pero la validación del servidor sigue siendo la que decide.

Pantallas implementadas:

| Pantalla | Ruta |
|---|---|
| Panel principal | / |
| Listado y búsqueda de farmacias | /farmacias, /farmacias?buscar=texto |
| Registrar farmacia | /farmacias/nueva |
| Detalle de farmacia | /farmacias/:id |
| Editar farmacia | /farmacias/:id/editar |
| Catálogo y filtro de medicamentos | /medicamentos, /medicamentos?categoria=id |
| Registrar medicamento | /medicamentos/nuevo |
| Detalle de medicamento | /medicamentos/:id |
| Editar medicamento | /medicamentos/:id/editar |
| Página no encontrada | cualquier otra ruta |

## Cómo ejecutar

1. Instalar Node.js y MySQL 8.
2. Crear la base ejecutando database/script_inicial.sql en MySQL.
3. Copiar .env.example como .env y completar los datos del usuario de la base.
4. Instalar dependencias con npm install.
5. Iniciar con npm start y abrir http://localhost:3000.

La dirección del servidor y los datos de conexión se configuran solo en el archivo .env (PORT y DB_*), que no se sube al repositorio. En la consola se registra cada solicitud con su código de respuesta, lo que ayuda a comprobar que las acciones de la interfaz llegan al servidor.

## Estado

- Actividad 1 (análisis y modelado): entregada.
- Actividad 2 (CRUD de farmacias y medicamentos bajo MVC): entregada.
- Actividad 3 (frontend de farmacias y medicamentos): entregada. Las pantallas de pedidos, inicio de sesión, usuarios, categorías y reportes quedan para las siguientes entregas.
