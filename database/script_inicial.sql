-- Script inicial (borrador) del Sistema de Pedidos Mayoristas de Laboratorio Químico Delta.
-- Motor propuesto: MySQL 8, sujeto a la aprobación docente.
-- Todos los datos de este archivo son ficticios y sirven solo para pruebas.

SET NAMES utf8mb4;

-- Permite volver a ejecutar el script durante el desarrollo.
DROP DATABASE IF EXISTS delta_pedidos;
CREATE DATABASE delta_pedidos CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE delta_pedidos;

-- Roles de los usuarios del sistema.
CREATE TABLE rol (
  id_rol INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL UNIQUE,
  descripcion VARCHAR(150) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Categorías del catálogo de medicamentos.
CREATE TABLE categoria (
  id_categoria INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(60) NOT NULL UNIQUE,
  descripcion VARCHAR(150) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Farmacias clientes del laboratorio.
CREATE TABLE farmacia (
  id_farmacia INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  nit VARCHAR(20) NOT NULL UNIQUE,
  responsable VARCHAR(100) NULL,
  telefono VARCHAR(20) NOT NULL,
  direccion VARCHAR(150) NOT NULL,
  zona VARCHAR(50) NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Usuarios que entran al sistema; la clave se guarda como hash.
CREATE TABLE usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(100) NOT NULL,
  correo VARCHAR(100) NOT NULL UNIQUE,
  clave_hash VARCHAR(255) NOT NULL,
  id_rol INT NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuario_rol FOREIGN KEY (id_rol) REFERENCES rol(id_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Catálogo de medicamentos con su precio mayorista y su stock.
CREATE TABLE medicamento (
  id_medicamento INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  presentacion VARCHAR(80) NOT NULL,
  id_categoria INT NOT NULL,
  precio_mayorista DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_medicamento_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
  CONSTRAINT ck_medicamento_precio CHECK (precio_mayorista > 0),
  CONSTRAINT ck_medicamento_stock CHECK (stock >= 0),
  CONSTRAINT uq_medicamento_nombre_presentacion UNIQUE (nombre, presentacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Pedidos que hacen las farmacias.
CREATE TABLE pedido (
  id_pedido INT AUTO_INCREMENT PRIMARY KEY,
  id_farmacia INT NOT NULL,
  id_usuario INT NOT NULL,
  fecha_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado ENUM('pendiente','despachado','entregado','anulado') NOT NULL DEFAULT 'pendiente',
  total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  observacion VARCHAR(255) NULL,
  fecha_despacho DATETIME NULL,
  fecha_entrega DATETIME NULL,
  CONSTRAINT fk_pedido_farmacia FOREIGN KEY (id_farmacia) REFERENCES farmacia(id_farmacia),
  CONSTRAINT fk_pedido_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario),
  CONSTRAINT ck_pedido_total CHECK (total >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Líneas de cada pedido; guarda el precio vigente al momento del pedido.
CREATE TABLE detalle_pedido (
  id_detalle INT AUTO_INCREMENT PRIMARY KEY,
  id_pedido INT NOT NULL,
  id_medicamento INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_detalle_pedido FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido),
  CONSTRAINT fk_detalle_medicamento FOREIGN KEY (id_medicamento) REFERENCES medicamento(id_medicamento),
  CONSTRAINT ck_detalle_cantidad CHECK (cantidad > 0),
  CONSTRAINT ck_detalle_precio CHECK (precio_unitario > 0),
  CONSTRAINT ck_detalle_subtotal CHECK (subtotal >= 0),
  CONSTRAINT uq_detalle_pedido_medicamento UNIQUE (id_pedido, id_medicamento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Datos de prueba (ficticios).
INSERT INTO rol (nombre, descripcion) VALUES
('Administrador', 'Configura y supervisa la información del sistema'),
('Ejecutivo de ventas', 'Atiende a las farmacias y registra sus pedidos'),
('Encargado de almacén', 'Controla el stock y la salida de los pedidos');

INSERT INTO categoria (nombre, descripcion) VALUES
('Analgésicos', 'Medicamentos para aliviar el dolor y bajar la fiebre'),
('Antibióticos', 'Medicamentos para tratar infecciones bacterianas'),
('Antialérgicos', 'Medicamentos para controlar reacciones alérgicas'),
('Gastrointestinales', 'Medicamentos para molestias del estómago y la digestión'),
('Vitaminas y suplementos', 'Complementos para cubrir necesidades nutricionales');

-- Los valores de id_categoria (1 a 5) siguen el orden de inserción anterior.
INSERT INTO medicamento (nombre, presentacion, id_categoria, precio_mayorista, stock) VALUES
('Paracetamol 500 mg', 'Caja de 100 tabletas', 1, 35.00, 200),
('Ibuprofeno 400 mg', 'Caja de 50 tabletas', 1, 42.50, 150),
('Amoxicilina 500 mg', 'Caja de 20 cápsulas', 2, 58.00, 120),
('Loratadina 10 mg', 'Caja de 30 tabletas', 3, 27.50, 90),
('Omeprazol 20 mg', 'Caja de 28 cápsulas', 4, 49.90, 80),
('Vitamina C 500 mg', 'Frasco de 60 tabletas', 5, 31.00, 110);

INSERT INTO farmacia (nombre, nit, responsable, telefono, direccion, zona) VALUES
('Farmacia Central de Prueba', '1000000011', 'Responsable de prueba uno', '70000001', 'Calle Ejemplo 100', 'Centro'),
('Farmacia Norte de Prueba', '1000000022', 'Responsable de prueba dos', '70000002', 'Avenida Ejemplo 200', 'Norte'),
('Farmacia Sud de Prueba', '1000000033', NULL, '70000003', 'Calle Ejemplo 300', 'Sud'),
('Farmacia Quillacollo de Prueba', '1000000044', 'Responsable de prueba cuatro', '70000004', 'Avenida Ejemplo 400', 'Quillacollo');

-- No se insertan usuarios: el primer Administrador se crea cuando exista el hash de contraseñas (RNF-02, Actividad 3).
