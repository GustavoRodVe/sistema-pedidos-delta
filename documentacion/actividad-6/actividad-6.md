# 1. Introducción y descripción general del proyecto

Este documento presenta el proyecto terminado de la materia Desarrollo de Sistemas II: una aplicación web para el Laboratorio Químico Delta, una empresa ficticia de Cochabamba que fabrica medicamentos y los vende al por mayor a las farmacias de la ciudad. El sistema se ocupa de un solo proceso, el registro y el seguimiento de los pedidos mayoristas, y reúne en un mismo lugar las farmacias clientes, el catálogo de medicamentos con su categoría, precio y stock, los pedidos con sus líneas y su estado, y los usuarios que trabajan con el sistema según su rol.

La aplicación se construyó a lo largo de seis actividades. En la primera hicimos el análisis, los requerimientos y los modelos; en la segunda, el CRUD de farmacias y medicamentos; en la tercera, el frontend; en la cuarta, el plan de pruebas y un primer despliegue temporal; la quinta fue el examen práctico y en esta sexta cerramos el producto con el inicio de sesión por roles, los pedidos, los usuarios, las categorías y el reporte, además de un plan de pruebas completo y el despliegue permanente.

Está hecha con Node.js y Express, con vistas generadas en el servidor con EJS y el patrón MVC, y guarda sus datos en MySQL 8.4. Hoy funciona en Internet: la aplicación corre en Render y la base de datos está en Aiven, y se puede abrir en https://pedidos-delta.onrender.com. El código está en https://github.com/GustavoRodVe/sistema-pedidos-delta.

El documento sigue el orden que pide la actividad. Primero explica el problema, los objetivos, el alcance y los requerimientos; después el diseño (modelado C4, base de datos y arquitectura MVC); luego los módulos con las capturas de cada pantalla y operación; después el plan de pruebas con sus resultados, las correcciones, el despliegue, el repositorio y los dos manuales, y al final las conclusiones, el glosario y los anexos.

# 2. Planteamiento del problema y justificación

Hoy el laboratorio recibe los pedidos de las farmacias por teléfono o por mensajes. El ejecutivo de ventas los anota en un cuaderno, llama al almacén para saber si hay stock, los copia a una hoja de Excel y el almacén prepara lo que le avisan. La información queda repartida entre el cuaderno, las hojas, los chats y la memoria de las personas, y ninguno de esos lugares tiene el cuadro completo de lo que se pidió, lo que se despachó y lo que sigue pendiente.

De ahí salen problemas que se notan sin medir nada: pedidos que se pierden o se anotan dos veces, promesas a la farmacia sin conocer el stock real, dificultad para saber en qué estado está un pedido sin llamar a alguien, un almacén que se entera tarde y la falta de un historial ordenado por farmacia. Hasta un reporte sencillo, como los pedidos de una farmacia en un periodo, obliga a revisar varias fuentes.

El sistema se justifica porque deja cada pedido registrado con su farmacia, sus medicamentos, sus cantidades y un total que calcula el servidor, y porque el ejecutivo de ventas y el encargado de almacén ven el mismo estado del pedido sin tener que preguntarse. El stock baja cuando el pedido se despacha y el sistema avisa cuando no alcanza. Además cada farmacia conserva su historial y el administrador puede sacar un reporte por farmacia y rango de fechas.

# 3. Objetivo general y objetivos específicos

## 3.1 Objetivo general

Desarrollar y poner en funcionamiento una aplicación web para el registro y seguimiento de los pedidos mayoristas de las farmacias del Laboratorio Químico Delta, que centralice la información de farmacias, medicamentos y pedidos y que pueda usarse desde Internet.

## 3.2 Objetivos específicos

Los objetivos de la primera actividad se cumplieron y se ampliaron con lo que pide el producto final:

1. Analizar el proceso actual de atención de pedidos y definir actores y requerimientos funcionales y no funcionales. Esto se hizo en la Actividad 1 y se revisa en la sección 5.
2. Diseñar la arquitectura y el modelo de datos con casos de uso, diagramas C4 y los modelos conceptual, lógico y físico. Las secciones 6 y 7 los presentan, junto con el diagrama de despliegue que se agregó ahora.
3. Implementar los módulos de farmacias, medicamentos, categorías, usuarios y pedidos bajo el patrón MVC, con inicio de sesión y permisos por rol, y con el descuento de stock al despachar.
4. Validar el sistema con un plan de pruebas automatizado de 32 casos, ejecutado en el equipo de desarrollo y sobre el sistema desplegado, y dejar evidencia de cada resultado.
5. Publicar la aplicación en un servicio de Internet con la base de datos en la nube, y documentar su instalación, su despliegue y su uso en un manual técnico y un manual de usuario.

# 4. Alcance del sistema

## 4.1 Funcionalidades incluidas

El sistema cubre el ciclo de vida de un pedido, desde que la farmacia lo solicita hasta que lo recibe. Incluye el registro, consulta, edición y desactivación de farmacias, con búsqueda por nombre o NIT; el catálogo de medicamentos organizado por categorías, con precio mayorista y stock; los pedidos con su detalle de medicamentos y cantidades y con cuatro estados (pendiente, despachado, entregado y anulado); el descuento del stock al despachar, que se rechaza si algún medicamento no alcanza; los usuarios con tres roles (administrador, ejecutivo de ventas y encargado de almacén) y el reporte de pedidos por farmacia y rango de fechas.

## 4.2 Fuera del alcance

No se incluyen contabilidad ni facturación, planillas, control de producción y fabricación, lotes y fechas de vencimiento, varias sucursales, un portal para que las farmacias hagan sus pedidos por su cuenta ni pagos en línea. Los dejamos fuera desde la Actividad 1 para poder terminar y demostrar un proceso completo dentro del semestre.

# 5. Requerimientos funcionales y no funcionales

Los requerimientos son los de la Actividad 1. La columna Estado indica si cada uno quedó implementado, comprobándolo contra el código y contra las pruebas de la sección 11.

## 5.1 Requerimientos funcionales

| Código | Requerimiento funcional | Actor | Estado |
|---|---|---|---|
| RF-01 | Iniciar sesión con correo y contraseña. | Todos los roles | Implementado |
| RF-02 | Cerrar la sesión. | Todos los roles | Implementado |
| RF-03 | Panel principal con accesos a los módulos permitidos para el rol. | Todos los roles | Implementado |
| RF-04 | Registrar un usuario con nombre completo, correo, contraseña y rol. | Administrador | Implementado |
| RF-05 | Desactivar un usuario para impedir su acceso. | Administrador | Implementado |
| RF-06 | Registrar una farmacia con nombre, NIT, responsable, teléfono, dirección y zona. | Ejecutivo de ventas | Implementado |
| RF-07 | Listado de farmacias activas. | Ejecutivo de ventas | Implementado |
| RF-08 | Detalle de una farmacia. | Ejecutivo de ventas | Implementado |
| RF-09 | Modificar los datos de una farmacia. | Ejecutivo de ventas | Implementado |
| RF-10 | Desactivar una farmacia conservando su historial de pedidos. | Ejecutivo de ventas | Implementado |
| RF-11 | Buscar farmacias por nombre o NIT. | Ejecutivo de ventas | Implementado |
| RF-12 | Registrar una categoría de medicamentos. | Administrador | Implementado |
| RF-13 | Registrar un medicamento con nombre, presentación, categoría, precio y stock. | Administrador | Implementado |
| RF-14 | Listado de medicamentos activos con categoría, precio y stock. | Todos los roles | Implementado |
| RF-15 | Detalle de un medicamento. | Todos los roles | Implementado |
| RF-16 | Modificar los datos de un medicamento. | Administrador | Implementado |
| RF-17 | Desactivar un medicamento. | Administrador | Implementado |
| RF-18 | Registrar un pedido de una farmacia activa con uno o más medicamentos. | Ejecutivo de ventas | Implementado |
| RF-19 | Calcular el subtotal de cada línea y el total del pedido. | Ejecutivo de ventas | Implementado |
| RF-20 | Listado de pedidos filtrado por estado o por farmacia. | Todos los roles | Implementado |
| RF-21 | Detalle de un pedido con sus medicamentos, cantidades, precios y total. | Todos los roles | Implementado |
| RF-22 | Marcar un pedido pendiente como despachado. | Encargado de almacén | Implementado |
| RF-23 | Descontar del stock las cantidades del pedido al despacharlo. | Encargado de almacén | Implementado |
| RF-24 | Impedir el despacho si el stock de algún medicamento no alcanza, indicando cuál. | Encargado de almacén | Implementado |
| RF-25 | Marcar un pedido despachado como entregado. | Encargado de almacén | Implementado |
| RF-26 | Anular un pedido que sigue pendiente. | Ejecutivo de ventas | Implementado |
| RF-27 | Reporte de pedidos por farmacia en un rango de fechas. | Administrador | Implementado |

El administrador, además, puede hacer lo que hacen los otros dos roles: gestionar farmacias, registrar y anular pedidos, y despacharlos y entregarlos. El servidor aplica estas reglas en cada ruta (sección 15.8).

## 5.2 Requerimientos no funcionales

| Código | Requerimiento no funcional | Estado |
|---|---|---|
| RNF-01 | Pedir inicio de sesión antes de mostrar cualquier módulo y mostrar a cada usuario solo las opciones de su rol. | Implementado |
| RNF-02 | Guardar las contraseñas como hash bcrypt. | Implementado |
| RNF-03 | Ejecutar las consultas con parámetros, sin concatenar lo que escribe el usuario. | Implementado |
| RNF-04 | Funcionar en las versiones actuales de Chrome, Edge y Firefox. | Parcial: se probó con Chromium; no se hizo una pasada en Firefox |
| RNF-05 | Mostrar mensajes de validación y de error en español, sin detalles técnicos. | Implementado |
| RNF-06 | Poder usarse en computadora y en tablet desde 768 píxeles de ancho, sin desplazamiento horizontal. | Implementado |
| RNF-07 | Responder en menos de 3 segundos en listados y formularios. | Parcial: se cumple con la aplicación despierta, pero la primera visita al sistema desplegado puede tardar cerca de un minuto |
| RNF-08 | Organizar el código con el patrón MVC en carpetas separadas. | Implementado |
| RNF-09 | Versionar el código y la documentación en GitHub con commits descriptivos. | Implementado |
| RNF-10 | Desactivar farmacias, medicamentos y usuarios con el campo activo en lugar de eliminarlos. | Implementado |

## 5.3 Casos de uso

El diagrama de casos de uso agrupa las funciones por actor. Se mantiene el de la Actividad 1, porque el sistema final cubre los mismos casos que se planearon.

![Diagrama de casos de uso](../../diagramas/casos-de-uso.png "ancho")

# 6. Modelado C4 de la aplicación web

El modelo C4 describe el sistema desde lo más general hasta sus partes. Los tres primeros diagramas son los de la Actividad 1 y los usamos sin cambios, porque la estructura no cambió; lo único distinto es que en aquel momento las tecnologías eran una propuesta y ahora están confirmadas, y que la base de datos es MySQL 8.4. A ellos se suma el diagrama de despliegue, que muestra dónde corre cada parte ahora que el sistema está en Internet.

## 6.1 Diagrama de contexto

Tres personas usan el sistema: el administrador, que mantiene usuarios, medicamentos y categorías y consulta el reporte; el ejecutivo de ventas, que registra farmacias y pedidos; y el encargado de almacén, que despacha y entrega los pedidos. No hay sistemas externos porque el alcance no tiene correo, pagos ni facturación.

![Diagrama de contexto (C4)](../../diagramas/c4-contexto.png "ancho")

## 6.2 Diagrama de contenedores

Las personas trabajan desde un navegador web. Del otro lado hay una sola aplicación Node.js con Express y vistas EJS, que recibe la solicitud, aplica las reglas y devuelve la página armada, y una base de datos MySQL. Un contenedor en C4 es una unidad que se ejecuta por separado, no un contenedor de Docker.

![Diagrama de contenedores (C4)](../../diagramas/c4-contenedores.png "ancho")

## 6.3 Diagrama de componentes

Dentro de la aplicación, las rutas envían cada solicitud al controlador de su módulo, después de que el componente de autenticación comprueba la sesión y el rol. Los controladores validan y aplican las reglas, los modelos son los únicos que hablan con la base de datos y las vistas arman el HTML.

![Diagrama de componentes (C4)](../../diagramas/c4-componentes.png "ancho")

## 6.4 Diagrama de despliegue

Este diagrama se agregó en esta actividad. El usuario abre el sistema desde su computadora o su celular y se conecta por HTTPS a la aplicación, que corre como servicio web en Render (plan gratuito, región de Virginia). La aplicación se conecta con la base de datos MySQL 8.4 alojada en Aiven (plan Developer, en Nueva York) por una conexión cifrada con TLS que verifica el certificado, con un usuario que solo puede leer, insertar, actualizar y borrar datos. Render toma el código del repositorio de GitHub cuando se pide un despliegue manual.

![Diagrama de despliegue (C4)](../../diagramas/c4-despliegue.png "ancho")

# 7. Diseño de la base de datos (conceptual, lógico y físico)

La base de datos tiene siete tablas: rol, usuario, farmacia, categoria, medicamento, pedido y detalle_pedido. Salieron de los sustantivos de los requerimientos funcionales y se presentan en tres modelos: el conceptual dice qué cosas existen y cómo se relacionan, el lógico las organiza en tablas, campos y claves, y el físico las baja al motor concreto con tipos de dato y restricciones.

## 7.1 Modelo conceptual

Un rol se asigna a muchos usuarios, una farmacia realiza muchos pedidos, un usuario registra muchos pedidos, una categoría clasifica muchos medicamentos y un pedido contiene varias líneas. Entre pedido y medicamento la relación real es de muchos a muchos, y la entidad detalle_pedido la resuelve y además guarda el precio que tenía el medicamento al momento del pedido.

![Modelo conceptual](../../diagramas/er-conceptual.png "ancho")

## 7.2 Modelo lógico

En el modelo lógico cada tabla tiene su clave primaria y cada relación es una clave foránea: usuario apunta a rol, medicamento a categoria, pedido a farmacia y a usuario, y detalle_pedido a pedido y a medicamento. Los campos opcionales son la descripción de rol y categoría, el responsable de la farmacia, la observación del pedido y las fechas de despacho y entrega, que solo se llenan cuando el pedido avanza.

![Modelo lógico](../../diagramas/modelo-logico.png "ancho")

## 7.3 Modelo físico

El modelo físico usa MySQL con el motor InnoDB y el juego de caracteres utf8mb4, para que los acentos se guarden bien. Las reglas de integridad son campos obligatorios con NOT NULL, valores únicos en el NIT de la farmacia, el correo del usuario y los nombres de rol y categoría, restricciones CHECK para que precios y cantidades sean mayores que cero y para que el stock, el subtotal y el total no sean negativos, y las seis claves foráneas. El precio unitario se copia a detalle_pedido porque el precio del medicamento puede cambiar después y los pedidos anteriores deben conservar el valor con el que se vendieron.

![Modelo físico](../../diagramas/modelo-fisico.png "ancho")

## 7.4 Motor y scripts

La base se crea con database/script_inicial.sql, que genera la base delta_pedidos, las siete tablas y datos ficticios de prueba, incluidos los tres usuarios de prueba con su contraseña guardada como hash. El archivo database/actividad6.sql sirve para una base que ya existía antes de agregar el inicio de sesión: inserta los tres usuarios sin repetirlos si se ejecuta más de una vez.

La actividad sugiere PostgreSQL entre las herramientas posibles, pero mantuvimos MySQL 8.4. Es el motor que se aprobó desde la Actividad 1, el modelo físico y los scripts están escritos para él, y Aiven lo ofrece como servicio administrado, así que no había una razón técnica para cambiar a esta altura.

# 8. Descripción de la arquitectura MVC implementada

## 8.1 Estructura de carpetas

La aplicación está en la carpeta src y cada responsabilidad tiene su carpeta. En models están las consultas a MySQL, una por tabla o grupo de tablas; en views están las páginas EJS, organizadas por módulo, con las partes comunes en views/partials; en controllers está la lógica de cada acción; en routes se asocia cada dirección con una acción del controlador; en validators se revisan los datos que llegan de los formularios; en middlewares están la sesión y los permisos por rol; y en config está la conexión a la base de datos. Fuera de src, la carpeta public tiene los estilos, el JavaScript del navegador y el logotipo.

## 8.2 Recorrido de una solicitud

La mejor forma de ver cómo trabajan las capas juntas es seguir una operación completa: el encargado de almacén despacha un pedido pendiente.

El navegador envía POST /pedidos/12/despachar. En app.js la solicitud pasa primero por requiereSesion, que redirige al login si no hay sesión, y llega al router de pedidos. Allí la ruta está protegida con permitirRoles, que deja pasar solo al administrador y al encargado de almacén y responde 403 a cualquier otro rol. Después se ejecuta la acción despachar del controlador, que lee el id y le pide al modelo que despache el pedido.

El modelo hace todo el trabajo dentro de una transacción: si falla algo, no queda nada a medias. Bloquea el pedido y sus líneas con SELECT ... FOR UPDATE, comprueba que el pedido esté pendiente y que el stock de cada medicamento alcance, descuenta el stock y cambia el estado a despachado con la fecha. Si el stock no alcanza en alguna línea, deshace la transacción y devuelve la lista de faltantes.

```js
// pedidoModel.js, parte de despachar
const faltantes = lineas.filter((l) => l.stock < l.cantidad);
if (faltantes.length > 0) {
  await conexion.rollback();
  return { existe: true, ok: false, faltantes };
}
for (const l of lineas) {
  await conexion.query('UPDATE medicamento SET stock = stock - ? WHERE id_medicamento = ?', [l.cantidad, l.id_medicamento]);
}
await conexion.query("UPDATE pedido SET estado = 'despachado', fecha_despacho = NOW() WHERE id_pedido = ?", [id]);
await conexion.commit();
```

Con esa respuesta, el controlador elige qué mostrar. Si se despachó, redirige a GET /pedidos/12?ok=despachado, donde la vista detalle.ejs dibuja el pedido con el mensaje de éxito. Si faltó stock, vuelve a mostrar el pedido con el código 409 y un mensaje que nombra el medicamento, cuántas unidades pide el pedido y cuántas hay.

## 8.3 Decisiones de diseño

El precio de cada línea y el total del pedido los calcula el servidor con el precio vigente en la base de datos, en centavos enteros para evitar errores de decimales. El formulario muestra un total estimado, pero solo como ayuda: si alguien altera los campos al enviar, el servidor los ignora. Lo comprobamos en el caso PI-03, donde se envían a propósito un precio de 0,01 y un total de 1.

El stock no se toca al registrar el pedido, sino al despacharlo. Así un pedido pendiente no reserva unidades y el stock siempre refleja lo que de verdad salió del almacén. La contrapartida es que dos pedidos pendientes pueden pedir las mismas unidades; el segundo se rechaza al despachar, y la transacción con bloqueo evita que dos despachos simultáneos dejen el stock en negativo.

Los registros no se borran, se desactivan con el campo activo, para no perder el historial de pedidos. Las validaciones se hacen en el servidor, que es la que decide, y se repiten en el navegador solo para avisar antes. Y los permisos se comprueban en el servidor en cada ruta, no solo ocultando botones, porque cualquiera puede escribir una dirección a mano.

# 9. Descripción de los módulos y funcionalidades desarrolladas

La tabla resume qué hace cada módulo y qué roles lo usan.

| Módulo | Funcionalidades | Roles |
|---|---|---|
| Autenticación | Inicio y cierre de sesión, sesión regenerada al ingresar, mensaje igual para cualquier credencial incorrecta | Todos |
| Usuarios | Listado, registro con rol y contraseña en hash, desactivación | Administrador |
| Farmacias | Listado con búsqueda, registro, detalle, edición, desactivación y reactivación por NIT | Administrador y ejecutivo de ventas |
| Categorías y medicamentos | Registro de categorías; catálogo con filtro por categoría, registro, detalle, edición y desactivación de medicamentos | Catálogo: todos los roles pueden ver; administrador administra |
| Pedidos | Registro con varias líneas, listado con filtros, detalle, despacho con control de stock, entrega y anulación | Ventas registra y anula, almacén despacha y entrega, todos consultan |
| Reportes | Pedidos por farmacia y rango de fechas con total | Administrador |
| Panel | Contadores de farmacias, medicamentos y pedidos por estado, y medicamentos con stock bajo | Todos |

Autenticación. El usuario ingresa con su correo y contraseña. El servidor compara la contraseña con el hash guardado usando bcrypt y, si es correcta, crea una sesión nueva. Si el correo no existe, la clave es incorrecta o el usuario está desactivado se responde lo mismo, para que nadie pueda averiguar qué correos están registrados.

Usuarios. El administrador registra usuarios con nombre, correo, contraseña de al menos 8 caracteres y rol, y puede desactivarlos. Un usuario desactivado ya no puede ingresar, pero su fila se conserva porque puede figurar como quien registró pedidos. El administrador no puede desactivarse a sí mismo para no quedarse sin acceso.

Farmacias. Permite registrar, buscar, ver, editar y desactivar farmacias. El NIT es único aunque la farmacia esté desactivada; si alguien registra de nuevo ese NIT, el sistema reactiva la farmacia con los datos nuevos en lugar de bloquearlo, que fue la corrección del error ERR-01 de la Actividad 4.

Categorías y medicamentos. Las categorías ordenan el catálogo. Cada medicamento tiene nombre, presentación, categoría, precio mayorista mayor que cero y stock que no puede ser negativo, y no puede repetirse la combinación de nombre y presentación.

Pedidos. Es el módulo central. El ejecutivo de ventas elige la farmacia y agrega una o más líneas; el sistema rechaza pedidos sin líneas, cantidades inválidas y medicamentos repetidos. Un pedido pasa de pendiente a despachado, de despachado a entregado, y solo puede anularse mientras está pendiente.

Reportes. El administrador elige una farmacia o todas y un rango de fechas. El reporte lista los pedidos del rango sin contar los anulados y muestra el total.

Panel. La pantalla de inicio resume los datos reales de la base y ofrece accesos rápidos según el rol.

# 10. Evidencias de las interfaces y operaciones CRUD

Las capturas son de una corrida del sistema local con datos ficticios de demostración, hechas con Playwright entrando por el formulario de login real. En cada pie de figura se indica qué operación del CRUD muestra: crear, leer, actualizar o desactivar.

## 10.1 Inicio de sesión y paneles

El inicio de sesión, el mensaje de error de las credenciales y el panel de cada rol están en el manual de usuario (sección 16), donde se explica paso a paso cada uno.

## 10.2 Farmacias

En el módulo de farmacias aparecen las cuatro operaciones. El formulario lleno corresponde a crear y después de guardarlo el listado muestra el mensaje de registro, que es la lectura. La captura del error de validación se tomó saltándose la validación del navegador, enviando el formulario directamente, para mostrar que el servidor rechaza un NIT con letras y marca el campo. El detalle muestra una farmacia, la edición de su teléfono la actualiza y el cuadro de confirmación aparece antes de desactivarla.

![Registrar farmacia: formulario lleno (crear)](../../evidencias/actividad-6/capturas/08-farmacias-formulario.png)
![Listado de farmacias con el mensaje de registro (leer)](../../evidencias/actividad-6/capturas/07-farmacias-listado.png)
![Validación del servidor: NIT con letras, con la validación del navegador desactivada](../../evidencias/actividad-6/capturas/09-farmacias-validacion.png)
![Detalle de una farmacia (leer)](../../evidencias/actividad-6/capturas/10-farmacias-detalle.png)
![Farmacia editada con su mensaje de éxito (actualizar)](../../evidencias/actividad-6/capturas/11-farmacias-editada.png)
![Confirmación antes de desactivar una farmacia (desactivar)](../../evidencias/actividad-6/capturas/12-farmacias-desactivar.png)

## 10.3 Medicamentos y categorías

El administrador registra medicamentos con el formulario y los ve en el catálogo, donde también cada uno muestra su categoría, su precio y su stock. Las categorías se registran desde su propia pantalla, que también las lista.

![Registrar medicamento: formulario lleno (crear)](../../evidencias/actividad-6/capturas/14-medicamentos-formulario.png)
![Catálogo de medicamentos con su categoría, precio y stock (leer)](../../evidencias/actividad-6/capturas/13-medicamentos-listado.png)
![Categorías: registro y listado](../../evidencias/actividad-6/capturas/15-categorias.png)

## 10.4 Usuarios

El administrador crea usuarios con un rol y los ve en el listado, con su estado. La contraseña se escribe en un campo oculto y nunca se vuelve a mostrar.

![Registrar usuario: formulario lleno (crear)](../../evidencias/actividad-6/capturas/17-usuarios-formulario.png)
![Listado de usuarios con su rol y estado (leer)](../../evidencias/actividad-6/capturas/16-usuarios-listado.png)

## 10.5 Pedidos

Estas capturas siguen la vida de un pedido. Primero se registra con dos líneas, como en el formulario de la sección 16.3, y queda pendiente; el almacén lo despacha y después lo marca como entregado. Otro pedido pide más unidades de las que hay, el despacho se rechaza con un mensaje que nombra el medicamento, y después ese pedido se anula. Por último, el listado se filtra por estado.

![Pedido registrado, en estado pendiente (crear)](../../evidencias/actividad-6/capturas/19-pedido-pendiente.png)
![Pedido despachado: el stock ya se descontó](../../evidencias/actividad-6/capturas/20-pedido-despachado.png)
![Pedido entregado (actualizar estado)](../../evidencias/actividad-6/capturas/21-pedido-entregado.png)
![Despacho rechazado: el stock no alcanza](../../evidencias/actividad-6/capturas/22-pedido-sin-stock.png)
![Pedido anulado](../../evidencias/actividad-6/capturas/23-pedido-anulado.png)
![Listado de pedidos filtrado por estado entregado (leer)](../../evidencias/actividad-6/capturas/24-pedidos-filtro.png)

## 10.6 Reporte y control de acceso

El reporte muestra los pedidos de una farmacia en el rango elegido, sin los anulados, con su total. La segunda captura muestra lo que ve el encargado de almacén cuando intenta abrir la pantalla de farmacias, que no es de su rol.

![Reporte de pedidos por farmacia](../../evidencias/actividad-6/capturas/25-reporte.png)
![Acceso denegado (403) para un rol sin permiso](../../evidencias/actividad-6/capturas/26-acceso-denegado.png)

# 11. Plan de pruebas y resultados obtenidos

## 11.1 Objetivos y técnica

El plan comprueba que cada requerimiento implementado hace lo que dice, tanto en el equipo de desarrollo como en el sistema desplegado, y deja evidencia de cada resultado. Se prestó atención especial a lo que se agregó en esta actividad: el inicio de sesión, los permisos por rol, los pedidos con control de stock, los usuarios y el reporte, y también a que la corrección del ERR-01 de la Actividad 4 siga funcionando.

Los datos de entrada se eligieron con particiones de equivalencia y valores límite: para cada formulario un caso válido y casos inválidos representativos, como un NIT con letras, una zona fuera de la lista, un precio igual a cero, un stock negativo, una cantidad de cero, un medicamento repetido en un pedido o una fecha que no existe en el calendario.

Los casos son de dos tipos. Las pruebas funcionales (PF) revisan una función desde afuera, enviando la misma solicitud que haría el navegador y mirando el código de respuesta y el mensaje. Las pruebas de integración (PI) revisan que varias capas trabajen juntas, por eso además de la respuesta consultan directamente MySQL para confirmar lo que se guardó, o lo que no se guardó, y varias se hacen sobre el sistema desplegado.

## 11.2 Entornos y ejecución

Hay dos entornos. El local es la aplicación iniciada por el propio script en el puerto 3100 con la base MySQL del equipo de desarrollo. El desplegado es https://pedidos-delta.onrender.com con la base en Aiven, a la que el script se conecta por TLS verificando el certificado y con el mismo usuario de mínimo privilegio que usa la aplicación.

Todo el plan está automatizado en el script pruebas/pruebas-act6.cjs, que se ejecuta con node pruebas/pruebas-act6.cjs. Usa fetch de Node.js para las solicitudes, con una sesión propia por usuario como si fueran navegadores distintos, y mysql2 para revisar las bases. Lo automatizamos para poder repetir el plan completo después de cada cambio: en la última ejecución los 32 casos tardaron 7 segundos. Reemplaza al script de la Actividad 4, pruebas-act4.cjs, que se escribió antes del inicio de sesión y ya no sirve, porque todas sus solicitudes serían redirigidas al login; lo dejamos en el repositorio solo como historial.

Los datos de prueba son ficticios y llevan un sufijo numérico distinto en cada ejecución. Todo lo que el script crea, en la base local y en la de Aiven, se borra al terminar, incluso si un caso falla, y el script comprueba al final que no quedó ningún registro. En la última ejecución quedaron 0 en las dos bases. La corrida definitiva se hizo el 25 de noviembre de 2026.

Una precisión sobre el sistema desplegado: la base de Aiven no tenía pedidos, así que para que el reporte del caso PI-13 tuviera algo que sumar, el script registra un pedido de una unidad a nombre de la farmacia ficticia de prueba. Ese pedido no modifica el stock y se borra junto con la farmacia al terminar.

## 11.3 Pruebas funcionales

Las pruebas funcionales cubren el acceso, los permisos, las validaciones de cada formulario, la baja lógica y las reglas de los pedidos. Todas se ejecutaron en el entorno local.

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

## 11.4 Pruebas de integración

Las pruebas PI-01 a PI-08 se ejecutaron en el entorno local y revisan lo guardado en MySQL. Las pruebas PI-09 a PI-14 se ejecutaron sobre el sistema desplegado y su base de Aiven. En PI-09 el tiempo hasta la primera respuesta fue de 0 segundos porque la instancia estaba despierta; Render indica que el servicio gratuito se duerme después de unos 15 minutos sin tráfico y que la primera solicitud posterior puede tardar cerca de un minuto, por eso el script reintenta durante tres minutos antes de empezar.

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

El caso PI-07 compara el total que muestra el reporte con la suma que calcula MySQL para los mismos pedidos, y comprueba que el pedido anulado no se cuente. El caso PI-13 hace lo mismo en la nube y sirve además para confirmar que el modo SQL y la zona horaria de la conexión están corregidos (sección 12.1).

## 11.5 Resumen de resultados

Resultados por tipo de prueba:

| Tipo | Casos | Correctos | Fallidos |
|---|---|---|---|
| Funcional | 18 | 18 | 0 |
| Integración | 14 | 14 | 0 |
| Total | 32 | 32 | 0 |

Resultados por entorno:

| Entorno | Casos | Correctos | Fallidos |
|---|---|---|---|
| Local | 26 | 26 | 0 |
| Desplegado | 6 | 6 | 0 |


Pasaron los 32 casos, 26 en el entorno local y 6 en el desplegado. No se encontró ningún error nuevo en esta ejecución: los errores que habíamos encontrado al construir los módulos ya estaban corregidos y quedaron cubiertos por casos de prueba, como la reactivación de una farmacia desactivada (PF-09) y la comprobación de los pedidos inválidos (PF-15 y PF-16).

# 12. Corrección y mejoras realizadas

## 12.1 Correcciones

Durante la construcción de los módulos de esta actividad y de su despliegue corregimos tres problemas, y comprobamos que un cuarto, de la Actividad 4, sigue corregido.

El primero fue que el formulario de usuarios mostraba en el encabezado el nombre y el rol equivocados. La vista recibía una variable llamada usuario con los datos del formulario, y esa variable tapaba a la que ya existía con el usuario de la sesión. La renombramos a datosUsuario en el controlador y en la vista.

El segundo fue que el reporte solo comprobaba el formato de las fechas, de modo que una fecha como 2026-02-30 llegaba a la consulta. Ahora se verifica también que la fecha exista en el calendario y que desde no sea posterior a hasta; en ambos casos se responde 422 con un mensaje. Lo cubre el caso PF-17.

El tercero apareció al desplegar. La base de Aiven trabaja con el modo SQL ANSI, donde las comillas dobles son nombres y no texto y el símbolo de doble barra concatena, y con la hora en UTC, mientras que MySQL en el equipo de desarrollo usa el modo por defecto. Para que la aplicación se comporte igual en los dos lugares, cada conexión del pool fija el modo SQL por defecto de MySQL 8 y la zona horaria de Bolivia (UTC-4), de modo que NOW() guarde la hora local. El caso PI-13 lo comprueba contra Aiven.

El cuarto es el error ERR-01 de la Actividad 4, que impedía volver a registrar el NIT de una farmacia desactivada. Ya estaba corregido y ahora tiene su caso de regresión PF-09, que sigue pasando.

Además, el script de pruebas de la Actividad 4 se reemplazó por el de esta actividad, como se explicó en la sección 11.2.

## 12.2 Mejoras desde la Actividad 4

Desde la Actividad 4 el sistema ganó el inicio de sesión con roles y permisos comprobados en el servidor, la administración de usuarios y categorías, el módulo de pedidos con despacho en transacción y control de stock, el reporte por farmacia y rango de fechas y el panel con contadores por estado. En cuanto al despliegue, pasamos del túnel temporal de Cloudflare, que dependía de que el equipo estuviera encendido, a un servicio permanente en Render con la base de datos en Aiven y una conexión cifrada.

# 13. Enlace de acceso a la aplicación web desplegada

## 13.1 Dirección de acceso

El sistema está publicado en https://pedidos-delta.onrender.com. Como corre en el plan gratuito de Render, la primera visita después de un rato sin uso puede tardar cerca de un minuto en responder. Para probarlo se puede ingresar con los tres usuarios de prueba, que usan la misma contraseña ficticia Delta2026: admin@delta.test (administrador), ventas@delta.test (ejecutivo de ventas) y almacen@delta.test (encargado de almacén). Esa contraseña debe cambiarse si el sistema se usara con datos reales.

## 13.2 Plataformas utilizadas

La aplicación corre en Render como servicio web del plan gratuito, en la región de Virginia. Para construirla ejecuta npm ci --omit=dev y para iniciarla npm start, y los despliegues son manuales con la opción de desplegar el último commit.

La base de datos es un servicio Aiven for MySQL 8.4 del plan Developer, alojado en DigitalOcean, en Nueva York. Lo usamos con los créditos de prueba de Aiven, que no pidieron tarjeta, porque Aiven retiró su plan gratuito de MySQL el 6 de noviembre de 2026. La conexión usa TLS y la aplicación verifica el certificado con la autoridad certificadora del servicio. La aplicación se conecta con un usuario que solo tiene SELECT, INSERT, UPDATE y DELETE sobre la base del proyecto, y el usuario administrador se usó solamente para cargar el script de la base. El caso PI-14 comprueba estos permisos.

## 13.3 Evidencia del despliegue

Las capturas muestran el sistema desplegado en un navegador de computadora y en uno de celular. Son de solo lectura: se inició sesión y se navegó, sin enviar formularios. La pantalla de pedidos está vacía porque la base de la nube no tiene pedidos cargados.

![Pantalla de inicio de sesión del sistema desplegado](../../evidencias/actividad-6/capturas/29-desplegado-login.png)
![Panel principal del administrador en el sistema desplegado](../../evidencias/actividad-6/capturas/30-desplegado-panel.png)
![Listado de pedidos del sistema desplegado](../../evidencias/actividad-6/capturas/31-desplegado-pedidos.png)
![Sistema desplegado visto en un celular](../../evidencias/actividad-6/capturas/32-desplegado-celular.png)

Como evidencia de que la respuesta llega por HTTPS desde el servicio de Render, esta es la respuesta de la pantalla de login tal como la guarda el script de pruebas, sin las cabeceras de cookies:

```
Solicitud: GET https://pedidos-delta.onrender.com/login
Respuesta: 200

alt-svc: h3=":443"; ma=86400
cf-cache-status: DYNAMIC
cf-ray: a5fde1fd5fc58bb2-LPB
content-encoding: br
content-length: 499
content-type: text/html; charset=utf-8
date: Wed, 25 Nov 2026 04:24:16 GMT
etag: W/"45c-ojyBIl0JZlkmkqmVwkBRQt0sluE"
rndr-id: 38a4814e-ab91-40f2
server: cloudflare
vary: Accept-Encoding
x-powered-by: Express
x-render-origin-server: Render
```

# 14. Enlace al repositorio GitHub

## 14.1 Dirección y estructura

El código está en https://github.com/GustavoRodVe/sistema-pedidos-delta, en la rama main. Es un repositorio público y no contiene contraseñas ni claves: el archivo .env está fuera de él y los datos de acceso a la base de la nube se configuran como variables de entorno en Render.

En la raíz están la carpeta src con la aplicación, database con los scripts SQL, public con los estilos y el JavaScript del navegador, pruebas con los scripts de pruebas y de capturas, evidencias con las capturas y los resultados de cada actividad, diagramas con los diagramas en formato editable y en imagen, documentacion con el texto de cada actividad, prototipos con el prototipo en HTML y el archivo README.md con las instrucciones.

![Página principal del repositorio en GitHub](../../evidencias/actividad-6/capturas/34-github-repositorio.png)
![Historial de commits del repositorio](../../evidencias/actividad-6/capturas/35-github-commits.png)

## 14.2 Historial de cambios

Estos son los commits de esta actividad, del más antiguo al más reciente.

| Commit | Descripción |
|---|---|
| 19dc238 | Agrega el inicio de sesión con roles, los usuarios de prueba y la configuración para el despliegue |
| 54bc511 | Agrega el módulo de pedidos: registro con detalle, despacho con control de stock, entrega y anulación |
| 6259b8e | Agrega la administración de usuarios y categorías, el reporte de pedidos por farmacia y actualiza el panel y el README |
| 30011e2 | Usa el modo SQL por defecto de MySQL en cada conexión para que la base en la nube se comporte igual que la local |
| fb922f4 | Agrega la base del plan de pruebas de la Actividad 6 con pruebas locales y contra el sistema desplegado |
| 8aaf8de | Completa el plan de pruebas de la Actividad 6 y agrega las capturas del recorrido y el diagrama de despliegue |
| db0480a | Actualiza el README con el enlace al sistema desplegado y el material de la Actividad 6 |

El último commit, que agrega este documento, aparece en el historial de GitHub y no se lista aquí porque su identificador se genera al guardarlo.

# 15. Manual técnico de la aplicación

## 15.1 Requisitos

Para ejecutar la aplicación en un equipo hace falta Node.js (probamos con la versión 26), MySQL 8.4 y Git. Para repetir las capturas se necesita además Playwright instalado de forma global, y para las pruebas contra el sistema desplegado, el archivo JSON con los datos de la base en la nube, que no está en el repositorio.

## 15.2 Instalación local

Se clona el repositorio, se entra a la carpeta sistema-pedidos-delta, se instalan las dependencias con npm install y se copia el archivo .env.example como .env para completar los datos de conexión. Después se crea la base de datos como se explica en la sección 15.4 y se inicia la aplicación con npm start. Con la configuración por defecto queda disponible en http://localhost:3000.

## 15.3 Variables de entorno

Las variables se leen del archivo .env en el equipo local, y se definen en el panel del servicio cuando la aplicación está en Render. Este documento solo lista sus nombres y su propósito, nunca sus valores.

| Variable | Propósito |
|---|---|
| PORT | Puerto en el que escucha el servidor. Por defecto 3000. |
| DB_HOST, DB_PORT | Dirección y puerto de MySQL. |
| DB_USER, DB_PASSWORD | Usuario y contraseña con los que la aplicación se conecta. |
| DB_NAME | Nombre de la base de datos, delta_pedidos. |
| SESSION_SECRET | Texto largo y aleatorio con el que se firma la cookie de sesión. Es obligatorio en producción: sin él la aplicación no arranca. |
| NODE_ENV | development en local; production activa la cookie segura y la confianza en el proxy de Render. |
| DB_SSL | true para cifrar la conexión y verificar el certificado, sin-verificar para cifrar sin verificarlo (plan B), cualquier otro valor para no usar TLS. |
| DB_CA | Contenido del certificado de la autoridad certificadora de Aiven, que puede ir en una sola línea con \n entre las líneas. |

## 15.4 Base de datos

El script database/script_inicial.sql crea la base delta_pedidos, las siete tablas y los datos de prueba, con los tres usuarios de prueba. Atención: empieza con DROP DATABASE IF EXISTS, así que borra la base si ya existía y solo debe ejecutarse al instalar desde cero. Si la base ya se había creado antes de agregar el inicio de sesión, en lugar de eso se ejecuta database/actividad6.sql, que solo agrega los usuarios y puede correrse más de una vez sin duplicarlos. Para que la aplicación funcione se crea además un usuario de MySQL con permisos SELECT, INSERT, UPDATE y DELETE sobre la base, y ese es el que se escribe en DB_USER.

## 15.5 Ejecución y pruebas

Con npm start se inicia el servidor y con npm run dev se reinicia solo cuando cambia un archivo. En la consola queda el registro de cada solicitud con su método, ruta, código de respuesta y tiempo.

Las pruebas se ejecutan con node pruebas/pruebas-act6.cjs, con MySQL encendido. El script arranca la aplicación en el puerto 3100, corre los 32 casos y escribe los resultados en evidencias/actividad-6. Las capturas se regeneran con node pruebas/capturas-act6.cjs.

## 15.6 Despliegue en Render y Aiven

Estos son los pasos que seguimos para publicar el sistema.

1. En Aiven se crea un servicio MySQL 8.4 y se descarga el certificado de la autoridad certificadora.
2. Con el usuario administrador del servicio y el cliente mysql, usando el certificado, se ejecuta database/script_inicial.sql. Es el único uso que se le da a ese usuario.
3. Se crea un usuario de aplicación con permisos SELECT, INSERT, UPDATE y DELETE solamente sobre la base delta_pedidos.
4. En Render se crea un servicio web a partir del repositorio de GitHub, en la rama main. Como comando de construcción se usa npm ci --omit=dev y como comando de inicio npm start.
5. En las variables de entorno del servicio se definen NODE_ENV=production, SESSION_SECRET, los datos de conexión del usuario de aplicación (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD y DB_NAME), DB_SSL=true y DB_CA con el contenido del certificado.
6. Se lanza el despliegue. Como los despliegues son manuales, cada vez que se sube un cambio al repositorio hay que usar la opción de desplegar el último commit.
7. Para verificar el resultado se abre la dirección pública y se ejecuta el plan de pruebas, cuyos casos PI-09 a PI-14 comprueban el sistema desplegado.

## 15.7 Estructura del proyecto

```
sistema-pedidos-delta/
  src/
    app.js              punto de entrada: sesión, rutas y manejo de errores
    config/db.js        conexión a MySQL (pool, TLS, zona horaria y modo SQL)
    middlewares/        sesión y permisos por rol
    routes/             una dirección por acción de cada módulo
    controllers/        lógica de cada acción
    validators/         validación de los formularios
    models/             consultas a MySQL
    views/              páginas EJS y partes comunes
  public/               css, js del navegador e imágenes
  database/             script_inicial.sql y actividad6.sql
  pruebas/              pruebas-act6.cjs, capturas-act6.cjs, servidor-local.cjs
  evidencias/           capturas y resultados por actividad
  diagramas/            C4, casos de uso y modelos de datos
  documentacion/        texto de cada actividad
```

## 15.8 Rutas principales

| Método | Ruta | Roles | Acción |
|---|---|---|---|
| GET | /login | Sin sesión | Formulario de inicio de sesión |
| POST | /login | Sin sesión | Iniciar sesión |
| POST | /logout | Con sesión | Cerrar sesión |
| GET | / | Todos | Panel principal |
| GET | /farmacias, /farmacias/:id | Administrador, ventas | Listado con búsqueda y detalle |
| GET, POST | /farmacias/nueva, /farmacias | Administrador, ventas | Formulario y registro |
| GET, POST | /farmacias/:id/editar | Administrador, ventas | Formulario y edición |
| POST | /farmacias/:id/desactivar | Administrador, ventas | Desactivar farmacia |
| GET | /medicamentos, /medicamentos/:id | Todos | Catálogo con filtro por categoría y detalle |
| GET, POST | /medicamentos/nuevo, /medicamentos | Administrador | Formulario y registro |
| GET, POST | /medicamentos/:id/editar | Administrador | Formulario y edición |
| POST | /medicamentos/:id/desactivar | Administrador | Desactivar medicamento |
| GET | /pedidos, /pedidos/:id | Todos | Listado con filtros y detalle |
| GET, POST | /pedidos/nuevo, /pedidos | Administrador, ventas | Formulario y registro de pedido |
| POST | /pedidos/:id/anular | Administrador, ventas | Anular un pedido pendiente |
| POST | /pedidos/:id/despachar | Administrador, almacén | Despachar y descontar el stock |
| POST | /pedidos/:id/entregar | Administrador, almacén | Marcar como entregado |
| GET, POST | /usuarios, /usuarios/nuevo | Administrador | Listado y registro de usuarios |
| POST | /usuarios/:id/desactivar | Administrador | Desactivar usuario |
| GET, POST | /categorias | Administrador | Listado y registro de categorías |
| GET | /reportes/pedidos | Administrador | Reporte por farmacia y fechas |

## 15.9 Medidas de seguridad

Las contraseñas se guardan con bcrypt, de modo que en la base nunca está la contraseña original. Al iniciar sesión se crea una sesión nueva, para que un identificador puesto de antemano por otra persona no sirva, y la cookie es httpOnly y sameSite lax; en producción además es secure, así que solo viaja por HTTPS. Cada ruta comprueba el rol en el servidor y responde 403 si no corresponde, y sin sesión todo redirige al login.

Todas las consultas a la base usan parámetros, lo que evita la inyección SQL, y las vistas EJS escapan el texto que muestran, lo que evita que una etiqueta escrita en un formulario se ejecute en la página; el caso PF-18 comprueba ambas cosas. La conexión entre la aplicación y Aiven va cifrada con TLS y verifica el certificado, y el usuario de la aplicación solo tiene los permisos de datos que necesita. Los secretos (contraseñas, la clave de sesión y el certificado) están fuera del repositorio, en el archivo .env local y en las variables de entorno de Render.

# 16. Manual de usuario

## 16.1 Ingreso al sistema

Se abre la dirección del sistema y aparece la pantalla de inicio de sesión. Se escribe el correo y la contraseña y se pulsa Ingresar. Si alguno de los dos datos es incorrecto, el sistema muestra un mensaje general sin decir cuál falló. Al ingresar se llega al panel principal, que muestra solo lo que corresponde al rol. Para salir se usa el botón Cerrar sesión de la esquina superior derecha.

![Pantalla de inicio de sesión](../../evidencias/actividad-6/capturas/01-login.png)
![Mensaje de error con una contraseña incorrecta](../../evidencias/actividad-6/capturas/02-login-error.png)

## 16.2 Administrador

El administrador ve todo el menú: Farmacias, Pedidos, Medicamentos, Categorías, Usuarios y Reporte de pedidos. En el panel principal hay tarjetas con el número de farmacias, medicamentos y pedidos por estado y la lista de los medicamentos con poco stock. Desde Usuarios puede registrar a una persona eligiendo su rol y desactivarla cuando deba perder el acceso. Desde Categorías y Medicamentos mantiene el catálogo, y desde Reporte de pedidos elige una farmacia y un rango de fechas y pulsa Generar reporte para ver los pedidos y su total.

En un celular el menú se oculta y se abre con el botón Menú.

![Panel principal del administrador](../../evidencias/actividad-6/capturas/03-panel-administrador.png)
![Menú desplegado en un celular](../../evidencias/actividad-6/capturas/06-menu-celular.png)

## 16.3 Ejecutivo de ventas

El ejecutivo de ventas trabaja con las farmacias y los pedidos. Para registrar un pedido entra a Pedidos y pulsa Nuevo pedido, elige la farmacia, agrega una línea por cada medicamento con su cantidad (con el botón Agregar medicamento se suman más líneas) y revisa el total estimado, que es solo una referencia. Al pulsar Guardar pedido, el sistema calcula el total real con los precios vigentes y deja el pedido pendiente. Mientras el pedido siga pendiente puede anularlo desde su detalle, confirmando en el cuadro que aparece.

![Panel principal del ejecutivo de ventas](../../evidencias/actividad-6/capturas/04-panel-ventas.png)
![Formulario de un pedido con dos líneas y total estimado](../../evidencias/actividad-6/capturas/18-pedido-formulario.png)

## 16.4 Encargado de almacén

El encargado de almacén ve los medicamentos con su stock y los pedidos. Abre el detalle de un pedido pendiente, revisa en la tabla el stock actual de cada línea y pulsa Despachar, confirmando en el cuadro. Si el stock alcanza, el pedido queda despachado y el stock baja; si no alcanza, el sistema avisa qué medicamento falta y no cambia nada. Cuando la farmacia recibe el pedido, lo marca con Marcar como entregado. En el celular las tablas se muestran como tarjetas.

![Panel principal del encargado de almacén](../../evidencias/actividad-6/capturas/05-panel-almacen.png)
![Listado de pedidos en un celular](../../evidencias/actividad-6/capturas/27-celular-pedidos.png)
![Formulario de pedido en un celular](../../evidencias/actividad-6/capturas/28-celular-pedido-formulario.png)

# 17. Conclusiones y recomendaciones

## 17.1 Conclusiones

El sistema cumple el objetivo con el que empezamos: el ciclo completo de un pedido, desde el registro hasta la entrega, queda en un solo lugar, con el mismo estado visible para ventas y para almacén, el stock descontado al despachar y un reporte por farmacia. Los 32 casos del plan de pruebas pasaron, tanto en el equipo de desarrollo como en el sistema publicado, y los 27 requerimientos funcionales quedaron implementados.

Lo que más nos dejó este trabajo fue ver la diferencia entre que algo funcione en nuestro equipo y que funcione desplegado. La base de Aiven tenía otro modo SQL y otra zona horaria, y solo lo descubrimos al probar contra ella; por eso conviene repetir el plan de pruebas en el entorno real y no solo en el local. También confirmamos que automatizar las pruebas vale la pena: repetir los 32 casos toma segundos, así que se puede hacer después de cada cambio.

## 17.2 Limitaciones y recomendaciones

Hay límites que conviene decir con claridad. Las sesiones se guardan en la memoria del servidor, así que se pierden cuando Render reinicia la aplicación y los usuarios tienen que volver a ingresar. El plan gratuito de Render duerme la instancia cuando no se usa y la primera visita puede tardar cerca de un minuto. El inicio de sesión no limita los intentos, de modo que alguien podría probar contraseñas sin freno, y las contraseñas de los usuarios de prueba son públicas. Además solo probamos con Chromium, no con Firefox.

Para un uso real recomendamos guardar las sesiones en MySQL, limitar los intentos de inicio de sesión, pasar a una instancia de pago que no se duerma, cambiar las contraseñas de los usuarios de prueba o eliminarlos, y probar el sistema también en Firefox y en Edge.

# 18. Glosario

Los términos están en orden alfabético.

- bcrypt: algoritmo para guardar contraseñas como un hash lento de calcular, que no se puede convertir de vuelta en la contraseña original.
- C4: forma de dibujar la arquitectura de un sistema en cuatro niveles: contexto, contenedores, componentes y código.
- CRUD: las cuatro operaciones básicas sobre los datos: crear, leer, actualizar y borrar (aquí, desactivar).
- Despliegue: publicar la aplicación en un servidor para que se pueda usar desde Internet.
- Endpoint: dirección de la aplicación a la que se puede enviar una solicitud, por ejemplo POST /pedidos.
- Hash: resultado de aplicar una función matemática a un texto; sirve para comprobar una contraseña sin guardarla.
- HTTPS: protocolo web cifrado, con el que viajan las páginas entre el navegador y el servidor.
- Middleware: función de Express que se ejecuta antes de la acción del controlador, por ejemplo la que revisa la sesión.
- MVC: patrón que separa el programa en modelos (datos), vistas (lo que se ve) y controladores (la lógica que une ambos).
- Pool de conexiones: conjunto de conexiones a la base que la aplicación reutiliza en lugar de abrir una por solicitud.
- Rol: tipo de usuario que determina lo que puede hacer en el sistema.
- Sesión: lo que el servidor recuerda de un usuario que ya ingresó, identificado por una cookie.
- SQL parametrizado: consulta en la que los valores se envían aparte del texto SQL, para que lo escrito por el usuario no se interprete como código.
- TLS: cifrado que protege la comunicación, por ejemplo entre la aplicación y la base de datos.
- Transacción: grupo de cambios en la base que se guardan todos juntos o no se guarda ninguno.

# 19. Anexos

## 19.1 Anexo A. Salida de la ejecución de las pruebas

Esta es la salida de la terminal de la ejecución definitiva del plan de pruebas, tal como la guarda el script en evidencias/actividad-6/terminal.txt.

```
Plan de pruebas de la Actividad 6 - 2026-11-25T04:24:18.750Z
Node v26.13.0, sufijo de la ejecución 0658750
Servidor local: http://localhost:3100
Sistema desplegado: https://pedidos-delta.onrender.com

PF-01 OK    [Local] Acceso sin sesión -> 302 hacia /login
PF-02 OK    [Local] Inicio de sesión con clave incorrecta -> 401, mensaje genérico: sí; luego GET /: 302 hacia /login
PF-03 OK    [Local] Inicio de sesión de los tres roles -> Administrador: 302 y 200; Ejecutivo de ventas: 302 y 200; Encargado de almacén: 302 y 200
PF-04 OK    [Local] Cerrar sesión -> 302 hacia /login; con la cookie vieja GET /: 302 hacia /login
PF-05 OK    [Local] Permisos por rol en el servidor -> almacén GET /farmacias: 403; ventas GET /usuarios: 403; ventas GET /categorias: 403; ventas GET /reportes/pedidos: 403; ventas GET /medicamentos/nuevo: 403; almacén POST /pedidos: 403
PF-06 OK    [Local] Registrar una farmacia con datos válidos (ventas) -> 302 hacia /farmacias?ok=registrada
PF-07 OK    [Local] Farmacia con NIT con letras y con zona fuera de la lista -> NIT con letras: 422, mensaje sí; zona Marte: 422, mensaje sí
PF-08 OK    [Local] NIT repetido de una farmacia activa -> 409, mensaje: sí
PF-09 OK    [Local] Registrar de nuevo el NIT de una farmacia desactivada (regresión del ERR-01) -> desactivar: 302, activo = 0; registrar otra vez: 302 /farmacias?ok=reactivada, activo = 1
PF-10 OK    [Local] Registrar medicamentos (administrador): válido, precio 0 y stock negativo -> válido: 302; precio 0: 422; stock negativo: 422
PF-11 OK    [Local] Registrar categorías (administrador): nueva y repetida -> nueva: 302 /categorias?ok=registrada; repetida: 409
PF-12 OK    [Local] Registrar usuarios (administrador): clave corta y correo repetido -> clave corta: 422, mensaje sí; correo repetido: 409
PF-13 OK    [Local] Un usuario desactivado ya no inicia sesión -> alta: 302; ingreso: 302; desactivar: 302; ingreso después: 401
PF-14 OK    [Local] El administrador no puede desactivarse a sí mismo -> 302 /usuarios?error=propio; activo = 1
PF-15 OK    [Local] Pedido inválido: sin líneas, cantidad 0 y medicamento repetido -> sin líneas: 422; cantidad 0: 422; repetido: 422; pedidos antes 0, después 0
PF-16 OK    [Local] Transiciones de estado no permitidas -> despachar: 302 y 409; entregar: 302; anular entregado: 409, mensaje legible: sí
PF-17 OK    [Local] Reporte con fechas inválidas -> 2026-02-30: 422; desde posterior a hasta: 422
PF-18 OK    [Local] Salida escapada y rutas inválidas -> escapado: sí; /no-existe: 404; /pedidos/abc: 404
PI-01 OK    [Local] La contraseña se guarda como hash -> empieza con $2b$, 60 caracteres, distinto de la contraseña: sí
PI-02 OK    [Local] Farmacia guardada y datos rechazados fuera de la base -> fila con los datos enviados: sí; filas de los NIT rechazados: 0
PI-03 OK    [Local] Pedido de dos líneas con el total calculado en el servidor (se envió precio_unitario=0.01 y total=1) -> 302 hacia /pedidos/14; total 53.50 (suma SQL 53.50), usuario de la sesión: sí, estado pendiente, stock 49->49 y 20->20
PI-04 OK    [Local] Despacho con stock insuficiente -> 409, nombra el medicamento: sí, estado pendiente, stock 49->49 y 20->20
PI-05 OK    [Local] Despacho correcto descuenta el stock -> 302, estado despachado, fecha de despacho registrada, stock 49->46 y 20->18
PI-06 OK    [Local] Entrega y anulación de pedidos -> entregar: 302, estado entregado, fecha de entrega registrada; anular: 302, estado anulado, stock 18->18
PI-07 OK    [Local] El total del reporte coincide con la base -> 200, total en pantalla Bs 12561.50, suma en MySQL Bs 12561.50, 3 pedidos, anulado excluido: sí
PI-08 OK    [Local] El listado de medicamentos muestra cada uno con su categoría -> 200, medicamento y categoría visibles: sí
PI-09 OK    [Desplegado] El sistema desplegado responde por HTTPS desde Internet -> 200 por HTTPS; tiempo hasta la primera respuesta: 0 s
PI-10 OK    [Desplegado] Sesión en producción con cookie segura -> 302; Secure: sí, HttpOnly: sí; GET /: 200
PI-11 OK    [Desplegado] Permisos en la nube -> sin sesión: 302 hacia /login; almacén en /farmacias: 403
PI-12 OK    [Desplegado] Un registro hecho desde Internet llega a la base de Aiven -> 302, filas en Aiven: 1
PI-13 OK    [Desplegado] El reporte en la nube coincide con la base de Aiven -> pedido de prueba: 302; reporte: 200, total en pantalla Bs 35.00, suma en Aiven Bs 35.00, 1 pedido(s) en el rango
PI-14 OK    [Desplegado] Mínimo privilegio del usuario de la aplicación en la nube -> SELECT, INSERT, UPDATE, DELETE sobre delta_pedidos

Limpieza: registros de prueba que quedan en la base local: 0, en la base de la nube: 0
32/32 casos correctos (7 s)
```

## 19.2 Anexo B. Comandos para repetir las pruebas y las capturas

Con MySQL encendido y desde la carpeta del repositorio:

```
node pruebas/pruebas-act6.cjs
node pruebas/capturas-act6.cjs
node pruebas/capturas-act6.cjs github
```

El primero ejecuta los 32 casos y escribe los resultados en evidencias/actividad-6, el segundo regenera las capturas del recorrido local, del sistema desplegado y el diagrama de despliegue, y el tercero solo las dos páginas de GitHub. Para las pruebas contra el sistema desplegado se necesita el archivo JSON con los datos de la base en la nube, cuya ruta puede indicarse con la variable DELTA_AIVEN_JSON.

## 19.3 Anexo C. Consulta usada para comprobar el total del reporte

Para los casos PI-07 y PI-13 el script calcula el total esperado con esta consulta, que usa las mismas condiciones que el reporte: no cuenta los pedidos anulados e incluye todo el último día del rango. Los signos de interrogación se reemplazan por la farmacia y las dos fechas.

```sql
SELECT COALESCE(SUM(total), 0) AS total, COUNT(*) AS pedidos
FROM pedido
WHERE id_farmacia = ?
  AND estado <> 'anulado'
  AND fecha_pedido >= ?
  AND fecha_pedido < DATE_ADD(?, INTERVAL 1 DAY);
```

En el caso PI-13 se usa la misma consulta sin la condición de la farmacia, porque el reporte se pide para todas.
