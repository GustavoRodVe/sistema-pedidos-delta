-- Actividad 6: usuarios de prueba para el inicio de sesión.
-- Este script es para una base ya creada con script_inicial.sql antes de agregar
-- el login. Si se instala desde cero, script_inicial.sql ya trae estos usuarios.
-- Se puede ejecutar más de una vez: INSERT IGNORE no repite un correo que ya existe.
-- Los datos son ficticios. La contraseña de prueba está en el README y aquí solo
-- se guarda su hash bcrypt (RNF-02), nunca la contraseña en texto.
SET NAMES utf8mb4;
USE delta_pedidos;

-- El id_rol se busca por el nombre del rol para no depender del orden de inserción.
INSERT IGNORE INTO usuario (nombre_completo, correo, clave_hash, id_rol)
SELECT 'Administrador de Prueba', 'admin@delta.test', '$2b$10$zOPT84AMQXjjJlSObcyNw.umdTRDdIRPG1ywRVBgmgICPYPUsVQue', id_rol
FROM rol WHERE nombre = 'Administrador';

INSERT IGNORE INTO usuario (nombre_completo, correo, clave_hash, id_rol)
SELECT 'Ejecutivo de Ventas de Prueba', 'ventas@delta.test', '$2b$10$8C7qxtu1HL1hph34aOn7seiLYvZgu/dXw9bJnVLqdL9HF9j54ML9q', id_rol
FROM rol WHERE nombre = 'Ejecutivo de ventas';

INSERT IGNORE INTO usuario (nombre_completo, correo, clave_hash, id_rol)
SELECT 'Encargado de Almacén de Prueba', 'almacen@delta.test', '$2b$10$8Yo41AZZpaPbLMJKkOGmy.t2Id5BhJ/9aB8jvOi5HGaROK4PjQwFa', id_rol
FROM rol WHERE nombre = 'Encargado de almacén';
