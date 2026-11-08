# Descripción del negocio y problema

## Descripción del negocio

Laboratorio Químico Delta es una empresa de Cochabamba, Bolivia, que fabrica medicamentos y los vende al por mayor a las farmacias de la ciudad. No atiende al público final: sus clientes son las farmacias, que le hacen pedidos con varios medicamentos a la vez y los reciben en su local.

Queremos dejar claro que se trata de un escenario ficticio, inventado para este proyecto académico. No representa a ninguna empresa real, aunque existan otras con un nombre parecido, y todos los datos que usamos (farmacias, medicamentos, precios, nombres y números) son datos de prueba.

De todo lo que hace un laboratorio elegimos un solo proceso para el proyecto: la recepción y el seguimiento de los pedidos mayoristas que hacen las farmacias. Es un proceso con un principio y un final claros, lo hacen personas concretas y deja información que se puede guardar, consultar y reportar.

## Alcance del proyecto

El sistema se limita al ciclo de vida de un pedido, desde que una farmacia lo solicita hasta que lo recibe. Todo lo que no ayude a registrar o seguir un pedido queda fuera, para que el trabajo se pueda terminar y demostrar dentro del semestre.

Incluye:

- Farmacias, que son los clientes del laboratorio.
- El catálogo de medicamentos, organizado por categorías.
- Pedidos con su detalle de medicamentos y cantidades, y con un estado: pendiente, despachado, entregado o anulado.
- Usuarios del sistema con roles.
- El descuento del stock cuando un pedido se despacha.

No incluye:

- Contabilidad y facturación.
- Planillas de sueldos.
- Control de producción y fabricación.
- Lotes y fechas de vencimiento.
- Varias sucursales.
- Un portal para que las farmacias hagan sus pedidos por su cuenta.
- Pagos en línea.

## Viabilidad del tema

Antes de seguir revisamos si el tema se puede trabajar como proyecto de la materia.

| Pregunta | Respuesta |
| --- | --- |
| ¿Existe una necesidad concreta? | Sí. Los pedidos se anotan hoy en cuadernos, hojas de Excel y mensajes, y eso genera pérdidas de información y confusión sobre el estado de cada pedido. |
| ¿Hay usuarios identificables? | Sí. El ejecutivo de ventas que recibe los pedidos, el encargado de almacén que los prepara y el administrador que supervisa la información. |
| ¿Se manejarán datos? | Sí. Farmacias, medicamentos con su precio y stock, pedidos con su detalle y usuarios con su rol. |
| ¿Se puede construir en la materia? | Sí. Son pocas entidades y un solo proceso, con operaciones de registrar, consultar, modificar y desactivar que se pueden implementar por actividades. |
| ¿Se podrá demostrar? | Sí. Con datos de prueba se puede registrar un pedido, despacharlo y ver cómo cambian su estado y el stock. |

## Proceso actual

Hoy el pedido empieza cuando una farmacia se comunica con el ejecutivo de ventas, casi siempre por llamada telefónica o por WhatsApp, y le dice qué medicamentos necesita y en qué cantidad. El ejecutivo de ventas es quien toma el pedido y el único que conoce la lista completa de lo que se pidió.

El ejecutivo anota el pedido en un cuaderno. Luego llama al almacén para preguntar si hay stock suficiente de cada medicamento, y con la respuesta confirma o ajusta lo que le dijo a la farmacia. Después copia el pedido a una hoja de Excel. El personal del almacén prepara los medicamentos a partir de lo que le avisan y despacha el pedido. Cuando la farmacia quiere saber cómo va su pedido, vuelve a llamar al ejecutivo, que tiene que buscar en el cuaderno o preguntar al almacén.

La información queda repartida en varios lugares: el cuaderno del ejecutivo, las hojas de Excel, los mensajes del chat y la memoria de las personas. Ninguno de esos lugares tiene el cuadro completo de qué se pidió, qué se despachó y qué sigue pendiente.

## Problemas identificados

Del proceso anterior se desprenden varios problemas que se pueden observar sin necesidad de medirlos:

- Hay pedidos que se pierden o se anotan dos veces, porque dependen de un cuaderno y de mensajes sueltos.
- Al tomar el pedido no se conoce el stock real, así que a veces se promete algo que el almacén no tiene.
- Es difícil saber en qué estado está un pedido sin llamar a alguien.
- El almacén se entera tarde de los pedidos, porque el aviso llega por llamada o mensaje.
- No existe un historial ordenado de lo que ha pedido cada farmacia.
- Armar un reporte sencillo, por ejemplo los pedidos de una farmacia en un periodo, lleva mucho tiempo porque hay que revisar varias fuentes.

## Descripción del problema

Laboratorio Químico Delta vende medicamentos al por mayor a las farmacias de Cochabamba. Hoy sus pedidos se reciben por teléfono o por mensajes, se anotan en un cuaderno y se copian a hojas de Excel, mientras el almacén se entera por llamadas. Por eso hay pedidos que se pierden o se repiten, el stock no se conoce al tomar el pedido y nadie sabe con certeza en qué estado está cada uno. Esto afecta al ejecutivo de ventas, al personal del almacén y a las farmacias, que esperan sin información clara. Se necesita una aplicación web que centralice farmacias, medicamentos y pedidos.
