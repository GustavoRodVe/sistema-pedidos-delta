# Justificación y objetivos

## Justificación

El proceso que mejora este proyecto es el registro y el seguimiento de los pedidos mayoristas de las farmacias. Hoy esa información está repartida entre un cuaderno, hojas de Excel y mensajes; con el sistema pasaría a estar en un solo lugar, con un mismo formato para todos los pedidos.

Los beneficios son los que se pueden comprobar al probar la aplicación. Cada pedido queda registrado con su farmacia, sus medicamentos, sus cantidades y su total calculado por el sistema. El ejecutivo de ventas y el encargado de almacén ven el mismo estado del pedido (pendiente, despachado, entregado o anulado), sin tener que llamarse para preguntarlo. El stock de cada medicamento baja cuando el pedido se despacha, y el sistema avisa si no alcanza. Además, cada farmacia conserva su historial de pedidos y el administrador puede generar un reporte de los pedidos de una farmacia en un rango de fechas. La información que se ordena es el catálogo de medicamentos con su precio y stock, los datos de las farmacias y el detalle de cada pedido.

## Objetivo general

Desarrollar una aplicación web para el registro y seguimiento de los pedidos mayoristas de farmacias de Laboratorio Químico Delta, que centralice la información de farmacias, medicamentos y pedidos.

## Objetivos específicos

1. Analizar el proceso actual de atención de pedidos y definir los actores y los requerimientos funcionales y no funcionales, documentados en tablas de requerimientos.
2. Diseñar la arquitectura y el modelo de datos del sistema mediante casos de uso, diagramas C4 y modelos conceptual, lógico y físico, junto con el script SQL inicial.
3. Implementar los módulos de farmacias, medicamentos y pedidos bajo el patrón MVC, con operaciones de registro, consulta, modificación y desactivación.
4. Validar el funcionamiento del sistema con casos de prueba que verifiquen el registro de pedidos, el cambio de estado y el descuento de stock.
