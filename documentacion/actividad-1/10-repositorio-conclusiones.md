# Repositorio GitHub

El proyecto se encuentra en el siguiente repositorio público:

{{URL_REPOSITORIO}}

El repositorio tiene un archivo README con el nombre, el propósito, el alcance y las herramientas del proyecto, y está organizado en las carpetas documentacion/, diagramas/, prototipos/ y database/. En la carpeta de diagramas se guardan tanto los archivos editables .drawio como las imágenes exportadas, para que cualquier diagrama se pueda corregir más adelante. Los cambios se fueron registrando con commits que describen lo que se agregó en cada paso, como la estructura inicial, los requerimientos, los diagramas, el modelo de datos y el prototipo. En el repositorio no se guardan contraseñas ni datos reales: la configuración de la base se lee de un archivo .env que está excluido con .gitignore.

# Conclusiones

El análisis del proceso de pedidos nos mostró que el problema principal del laboratorio no es la falta de información, sino que esa información está repartida entre cuadernos, hojas de Excel y mensajes. Por eso el sistema se centra en un solo proceso y en tener un único lugar donde se registren las farmacias, los medicamentos y los pedidos con su estado.

Definir primero los actores y los requerimientos facilitó mucho el resto del diseño. Cada caso de uso, cada tabla y cada pantalla del prototipo se puede relacionar con un requerimiento concreto, y al revisar esa relación encontramos detalles que habrían sido difíciles de corregir después, como guardar el precio del medicamento en el detalle del pedido o desactivar farmacias en lugar de borrarlas para no perder su historial.

El modelo C4 nos ayudó a explicar la solución en distintos niveles: quién usa el sistema, cómo se divide en navegador, aplicación y base de datos, y cómo se organiza la aplicación por dentro en rutas, controladores, modelos y vistas. Esa organización es la misma que seguiremos al programar bajo el patrón MVC.

Con esta actividad queda un plano completo de la aplicación: el problema y sus objetivos, los requerimientos, la arquitectura, la base de datos con su script inicial, el prototipo de las pantallas y un plan de trabajo. Lo que sigue es implementar los módulos de farmacias y medicamentos en la Actividad 2, siempre que el docente apruebe el diseño y la tecnología propuesta.

# Anexos

Anexo A. Archivos editables de los diagramas (carpeta diagramas/ del repositorio): casos-de-uso.drawio, c4-contexto.drawio, c4-contenedores.drawio, c4-componentes.drawio, er-conceptual.drawio, modelo-logico.drawio y modelo-fisico.drawio.

Anexo B. Script SQL inicial de la base de datos (database/script_inicial.sql).

Anexo C. Prototipo navegable en HTML (carpeta prototipos/, se abre desde index.html).
