# Planificación del desarrollo

## Cronograma inicial

Dividimos el proyecto siguiendo las seis actividades de la materia. Las fechas son estimadas y las iremos ajustando según las fechas que se publiquen en la plataforma. El orden respeta las dependencias: primero el análisis y el modelo de datos, luego las tablas y el CRUD, después las interfaces y por último las pruebas y el despliegue.

| Nro. | Tarea | Fecha estimada | Resultado esperado |
| --- | --- | --- | --- |
| 1 | Análisis del proceso, actores y requerimientos | Semana del 2 al 8 de noviembre | Problema, objetivos y tablas de RF y RNF. |
| 2 | Casos de uso, historias de usuario y modelo C4 | Semana del 2 al 8 de noviembre | Diagramas en .drawio y .png. |
| 3 | Modelo de datos y script SQL inicial | Semana del 2 al 8 de noviembre | Modelos conceptual, lógico y físico, diccionario y script. |
| 4 | Prototipo de interfaces y repositorio | Semana del 2 al 8 de noviembre | Prototipo navegable y repositorio con README. |
| 5 | Estructura MVC y conexión a MySQL | Semana del 2 al 8 de noviembre | Aplicación que inicia y se conecta a la base. |
| 6 | CRUD de farmacias y medicamentos con validaciones | Semana del 2 al 8 de noviembre | Módulos funcionando y probados (Actividad 2). |
| 7 | Inicio de sesión, usuarios y roles | Semana del 9 al 15 de noviembre | Acceso restringido según el rol. |
| 8 | Registro de pedidos, cambio de estado y descuento de stock | Semana del 16 al 22 de noviembre | Ciclo completo de un pedido (Actividad 3). |
| 9 | Reporte de pedidos por farmacia | Semana del 16 al 22 de noviembre | Reporte por rango de fechas. |
| 10 | Plan de pruebas y corrección de errores | Semana del 23 al 29 de noviembre | Casos de prueba ejecutados y documentados. |
| 11 | Despliegue en la nube | Semana del 23 al 29 de noviembre | Aplicación publicada y accesible (Actividad 4). |
| 12 | Preparación del examen práctico integrador | Primera semana de diciembre | Sistema estable para la Actividad 5. |
| 13 | Ajustes finales y documentación completa | Segunda semana de diciembre | Proyecto terminado (Actividad 6). |

## Forma de organizar el trabajo

Como el proyecto es individual, usaremos un tablero Kanban personal en GitHub Projects, vinculado al mismo repositorio, con tres columnas: Pendiente, En proceso y Terminado. Cada tarea del cronograma se divide en tarjetas pequeñas que se puedan terminar en una o dos sesiones de trabajo, por ejemplo "formulario de registro de farmacia" o "validar NIT repetido". Al empezar una sesión se pasa una tarjeta a En proceso, y solo se mueve a Terminado cuando la función está probada y guardada con un commit.

Al final de cada semana revisaremos el tablero contra el cronograma. Si una tarea se atrasa, primero se reduce su alcance a lo esencial y lo demás se anota como pendiente para la siguiente actividad. Elegimos Kanban en lugar de Scrum porque no tenemos un equipo con quien hacer reuniones ni sprints fijos; nos basta con ver qué está pendiente y limitar el trabajo en curso a una o dos tareas.

## Riesgos y acciones preventivas

| Riesgo | Probabilidad / impacto | Acción preventiva |
| --- | --- | --- |
| Pérdida de archivos o del código | Media / Alta | Hacer commits frecuentes y subir los cambios a GitHub al terminar cada sesión. |
| Alcance demasiado grande para el tiempo disponible | Alta / Alta | Mantener un solo proceso (pedidos) y dejar fuera lo que no aporte a ese proceso, como lotes o facturación. |
| Que el docente no apruebe la tecnología propuesta | Media / Alta | Presentar la matriz tecnológica en esta actividad y ajustar el proyecto apenas se reciba la observación. |
| Problemas de instalación o configuración de MySQL | Media / Media | Documentar los pasos de instalación y guardar el script SQL para recrear la base en cualquier equipo. |
| Exposición de contraseñas en el repositorio | Baja / Alta | Guardar las credenciales en un archivo .env excluido con .gitignore y subir solo un .env.example. |
| Dificultad para desplegar la aplicación | Media / Media | Probar el servicio de despliegue con una versión pequeña antes de la Actividad 4. |
| Retraso en las tareas por otras materias | Media / Alta | Dividir el trabajo en tarjetas pequeñas y revisar el tablero cada semana. |
