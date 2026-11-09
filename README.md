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
- public/: hoja de estilos.
- evidencias/: capturas y resultados de las pruebas de la Actividad 2.

## Cómo ejecutar

1. Instalar Node.js y MySQL 8.
2. Crear la base ejecutando database/script_inicial.sql en MySQL.
3. Copiar .env.example como .env y completar los datos del usuario de la base.
4. Instalar dependencias con npm install.
5. Iniciar con npm start y abrir http://localhost:3000.

## Estado

- Actividad 1 (análisis y modelado): entregada.
- Actividad 2 (CRUD de farmacias y medicamentos bajo MVC): entregada.
- Actividad 3 (pedidos, inicio de sesión y frontend): pendiente.
