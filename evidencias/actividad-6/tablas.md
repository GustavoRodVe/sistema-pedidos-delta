Pruebas funcionales

| ID | Caso | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| PF-01 | Acceso sin sesión | Redirección 302 hacia /login | 302 hacia /login | Correcto |
| PF-03 | Inicio de sesión de los tres roles | Cada rol: 302 hacia / y el panel (200) muestra su rol | Administrador: 302 y 200; Ejecutivo de ventas: 302 y 200; Encargado de almacén: 302 y 200 | Correcto |

Pruebas de integración

| ID | Caso | Resultado esperado | Resultado obtenido | Estado |
|---|---|---|---|---|
| PI-03 | Pedido de dos líneas con el total calculado en el servidor (se envió precio_unitario=0.01 y total=1) | Redirección al pedido; total = suma de cantidad x precio de la base; usuario de la sesión; estado pendiente; stock sin cambios | 302 hacia /pedidos/4; total 53.50 (suma SQL 53.50), usuario de la sesión: sí, estado pendiente, stock 50 y 20 | Correcto |
| PI-09 | El sistema desplegado responde por HTTPS desde Internet (sistema desplegado) | 200 en https://pedidos-delta.onrender.com/login | 200 por HTTPS; la primera respuesta tardó 1 s (arranque en frío) | Correcto |
| PI-14 | Mínimo privilegio del usuario de la aplicación en la nube (sistema desplegado) | Solo SELECT, INSERT, UPDATE y DELETE sobre delta_pedidos | SELECT, INSERT, UPDATE, DELETE sobre delta_pedidos | Correcto |

Resumen por tipo

| Tipo | Casos | Correctos | Fallidos |
|---|---|---|---|
| Funcional | 2 | 2 | 0 |
| Integración | 3 | 3 | 0 |
| Total | 5 | 5 | 0 |

Resumen por entorno

| Entorno | Casos | Correctos | Fallidos |
|---|---|---|---|
| Local | 3 | 3 | 0 |
| Desplegado | 2 | 2 | 0 |
