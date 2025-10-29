-- Backup Manual - GoFish SpA
-- Fecha: 29-10-2025, 12:12:49 p. m.
-- Base de datos: gofish


-- Table structure for table `boleta`
DROP TABLE IF EXISTS `boleta`;
CREATE TABLE `boleta` (
  `id_boleta` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int NOT NULL,
  `razon_social` varchar(100) DEFAULT NULL,
  `rut_emisor` varchar(20) DEFAULT NULL,
  `direccion_emisor` varchar(100) DEFAULT NULL,
  `giro_emisor` varchar(100) DEFAULT NULL,
  `razon_receptor` varchar(100) DEFAULT NULL,
  `rut_receptor` varchar(20) DEFAULT NULL,
  `direccion_receptor` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_boleta`),
  KEY `id_pedido` (`id_pedido`),
  CONSTRAINT `boleta_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table structure for table `carrito`
DROP TABLE IF EXISTS `carrito`;
CREATE TABLE `carrito` (
  `id_carrito` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `valor_total` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id_carrito`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `carrito_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table structure for table `carritoproducto`
DROP TABLE IF EXISTS `carritoproducto`;
CREATE TABLE `carritoproducto` (
  `id_carrito` int NOT NULL,
  `id_producto` int NOT NULL,
  `cantidad` int NOT NULL,
  PRIMARY KEY (`id_carrito`,`id_producto`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `carritoproducto_ibfk_1` FOREIGN KEY (`id_carrito`) REFERENCES `carrito` (`id_carrito`),
  CONSTRAINT `carritoproducto_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table structure for table `cart_items`
DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_cart_product` (`cart_id`,`product_id`),
  KEY `fk_cart_items_product_id` (`product_id`),
  CONSTRAINT `fk_cart_items_cart_id` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_cart_items_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table structure for table `carts`
DROP TABLE IF EXISTS `carts`;
CREATE TABLE `carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cart_id` (`cart_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table structure for table `categoria`
DROP TABLE IF EXISTS `categoria`;
CREATE TABLE `categoria` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table structure for table `cliente`
DROP TABLE IF EXISTS `cliente`;
CREATE TABLE `cliente` (
  `id_cliente` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `metodo_pago` varchar(50) DEFAULT NULL,
  `direccion` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_cliente`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `cliente_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table structure for table `colores`
DROP TABLE IF EXISTS `colores`;
CREATE TABLE `colores` (
  `ID` int NOT NULL,
  `Primario` varchar(255) DEFAULT NULL,
  `Secundario` varchar(255) DEFAULT NULL,
  `Terciario` varchar(255) DEFAULT NULL,
  `Texto1` varchar(255) DEFAULT NULL,
  `Texto2` varchar(255) DEFAULT NULL,
  `Texto3` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table structure for table `comentarioproducto`
DROP TABLE IF EXISTS `comentarioproducto`;
CREATE TABLE `comentarioproducto` (
  `id_comentario` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_producto` int NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_comentario`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `comentarioproducto_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `comentarioproducto_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table structure for table `contacts`
DROP TABLE IF EXISTS `contacts`;
CREATE TABLE `contacts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('new','read','replied') COLLATE utf8mb4_unicode_ci DEFAULT 'new',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table structure for table `deseos`
DROP TABLE IF EXISTS `deseos`;
CREATE TABLE `deseos` (
  `id_deseos` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_producto` int NOT NULL,
  PRIMARY KEY (`id_deseos`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `deseos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `deseos_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table structure for table `document_logs`
DROP TABLE IF EXISTS `document_logs`;
CREATE TABLE `document_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `document_type` enum('boleta','factura') COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_number` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `download_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sent_via_email` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_document_logs_order_id` (`order_id`),
  CONSTRAINT `fk_document_logs_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `document_logs`
INSERT INTO `document_logs` VALUES
(1, 1, 'boleta', 'B-GF-1761710730121-469-730578', '/documents/GF-1761710730121-469-boleta.pdf', 1, Wed Oct 29 2025 01:05:30 GMT-0300 (hora de verano de Chile)),
(2, 2, 'boleta', 'B-GF-1761711365303-987-365712', '/documents/GF-1761711365303-987-boleta.pdf', 1, Wed Oct 29 2025 01:16:05 GMT-0300 (hora de verano de Chile)),
(3, 3, 'boleta', 'B-GF-1761711621372-303-621845', '/documents/GF-1761711621372-303-boleta.pdf', 1, Wed Oct 29 2025 01:20:21 GMT-0300 (hora de verano de Chile)),
(4, 4, 'boleta', 'B-GF-1761712145212-479-145623', '/documents/GF-1761712145212-479-boleta.pdf', 1, Wed Oct 29 2025 01:29:05 GMT-0300 (hora de verano de Chile)),
(5, 5, 'boleta', 'B-GF-1761713837944-567-838788', '/documents/GF-1761713837944-567-boleta.pdf', 1, Wed Oct 29 2025 01:57:18 GMT-0300 (hora de verano de Chile)),
(6, 6, 'boleta', 'B-GF-1761714226557-745-227092', '/documents/GF-1761714226557-745-boleta.pdf', 1, Wed Oct 29 2025 02:03:47 GMT-0300 (hora de verano de Chile));


-- Table structure for table `factura`
DROP TABLE IF EXISTS `factura`;
CREATE TABLE `factura` (
  `id_factura` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int NOT NULL,
  `razon_social` varchar(100) DEFAULT NULL,
  `rut_emisor` varchar(20) DEFAULT NULL,
  `direccion_emisor` varchar(100) DEFAULT NULL,
  `giro_emisor` varchar(100) DEFAULT NULL,
  `razon_receptor` varchar(100) DEFAULT NULL,
  `rut_receptor` varchar(20) DEFAULT NULL,
  `direccion_receptor` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_factura`),
  KEY `id_pedido` (`id_pedido`),
  CONSTRAINT `factura_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedido` (`id_pedido`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table structure for table `informacion de pagina`
DROP TABLE IF EXISTS `informacion de pagina`;
CREATE TABLE `informacion de pagina` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `logo` varchar(255) DEFAULT NULL,
  `portada` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table structure for table `informacion_pagina`
DROP TABLE IF EXISTS `informacion_pagina`;
CREATE TABLE `informacion_pagina` (
  `ID` int NOT NULL,
  `Logo` varchar(255) DEFAULT NULL,
  `Portada` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table structure for table `order_items`
DROP TABLE IF EXISTS `order_items`;
CREATE TABLE `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `product_price` decimal(10,2) NOT NULL,
  `quantity` int NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_order_items_product_id` (`product_id`),
  KEY `fk_order_items_order_id` (`order_id`),
  CONSTRAINT `fk_order_items_order_id` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_order_items_product_id` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `order_items`
INSERT INTO `order_items` VALUES
(1, 1, 2, 'Atún Rojo', '12990.00', 2, '25980.00', Wed Oct 29 2025 01:05:30 GMT-0300 (hora de verano de Chile)),
(2, 1, 3, 'Merluza Austral', '5990.00', 2, '11980.00', Wed Oct 29 2025 01:05:30 GMT-0300 (hora de verano de Chile)),
(3, 2, 2, 'Atún Rojo', '12990.00', 2, '25980.00', Wed Oct 29 2025 01:16:05 GMT-0300 (hora de verano de Chile)),
(4, 2, 3, 'Merluza Austral', '5990.00', 2, '11980.00', Wed Oct 29 2025 01:16:05 GMT-0300 (hora de verano de Chile)),
(5, 3, 2, 'Atún Rojo', '12990.00', 2, '25980.00', Wed Oct 29 2025 01:20:21 GMT-0300 (hora de verano de Chile)),
(6, 3, 3, 'Merluza Austral', '5990.00', 2, '11980.00', Wed Oct 29 2025 01:20:21 GMT-0300 (hora de verano de Chile)),
(7, 4, 2, 'Atún Rojo', '12990.00', 2, '25980.00', Wed Oct 29 2025 01:29:05 GMT-0300 (hora de verano de Chile)),
(8, 4, 3, 'Merluza Austral', '5990.00', 2, '11980.00', Wed Oct 29 2025 01:29:05 GMT-0300 (hora de verano de Chile)),
(9, 5, 2, 'Atún Rojo', '12990.00', 2, '25980.00', Wed Oct 29 2025 01:57:18 GMT-0300 (hora de verano de Chile)),
(10, 5, 3, 'Merluza Austral', '5990.00', 2, '11980.00', Wed Oct 29 2025 01:57:18 GMT-0300 (hora de verano de Chile)),
(11, 6, 2, 'Atún Rojo', '12990.00', 2, '25980.00', Wed Oct 29 2025 02:03:46 GMT-0300 (hora de verano de Chile)),
(12, 6, 3, 'Merluza Austral', '5990.00', 2, '11980.00', Wed Oct 29 2025 02:03:46 GMT-0300 (hora de verano de Chile)),
(13, 7, 2, 'Atún Rojo', '12990.00', 2, '25980.00', Wed Oct 29 2025 02:17:42 GMT-0300 (hora de verano de Chile)),
(14, 7, 3, 'Merluza Austral', '5990.00', 2, '11980.00', Wed Oct 29 2025 02:17:42 GMT-0300 (hora de verano de Chile)),
(15, 8, 2, 'Atún Rojo', '12990.00', 2, '25980.00', Wed Oct 29 2025 02:23:23 GMT-0300 (hora de verano de Chile)),
(16, 8, 3, 'Merluza Austral', '5990.00', 2, '11980.00', Wed Oct 29 2025 02:23:23 GMT-0300 (hora de verano de Chile)),
(17, 9, 2, 'Atún Rojo', '12990.00', 2, '25980.00', Wed Oct 29 2025 03:07:23 GMT-0300 (hora de verano de Chile)),
(18, 9, 3, 'Merluza Austral', '5990.00', 2, '11980.00', Wed Oct 29 2025 03:07:23 GMT-0300 (hora de verano de Chile)),
(19, 10, 2, 'Atún Rojo', '12990.00', 2, '25980.00', Wed Oct 29 2025 03:14:16 GMT-0300 (hora de verano de Chile)),
(20, 10, 3, 'Merluza Austral', '5990.00', 2, '11980.00', Wed Oct 29 2025 03:14:16 GMT-0300 (hora de verano de Chile)),
(21, 11, 2, 'Atún Rojo', '12990.00', 2, '25980.00', Wed Oct 29 2025 03:20:31 GMT-0300 (hora de verano de Chile)),
(22, 11, 3, 'Merluza Austral', '5990.00', 3, '17970.00', Wed Oct 29 2025 03:20:31 GMT-0300 (hora de verano de Chile)),
(23, 12, 2, 'Atún Rojo', '12990.00', 2, '25980.00', Wed Oct 29 2025 03:22:39 GMT-0300 (hora de verano de Chile)),
(24, 13, 2, 'Atún Rojo', '12990.00', 2, '25980.00', Wed Oct 29 2025 03:24:43 GMT-0300 (hora de verano de Chile)),
(25, 14, 2, 'Atún Rojo', '12990.00', 2, '25980.00', Wed Oct 29 2025 03:35:33 GMT-0300 (hora de verano de Chile)),
(26, 15, 2, 'Atún Rojo', '12990.00', 2, '25980.00', Wed Oct 29 2025 03:41:51 GMT-0300 (hora de verano de Chile)),
(27, 15, 3, 'Merluza Austral', '5990.00', 2, '11980.00', Wed Oct 29 2025 03:41:51 GMT-0300 (hora de verano de Chile)),
(28, 16, 2, 'Atún Rojo', '12990.00', 2, '25980.00', Wed Oct 29 2025 10:59:13 GMT-0300 (hora de verano de Chile)),
(29, 16, 3, 'Merluza Austral', '5990.00', 2, '11980.00', Wed Oct 29 2025 10:59:13 GMT-0300 (hora de verano de Chile)),
(30, 17, 2, 'Atún Rojo', '12990.00', 1, '12990.00', Wed Oct 29 2025 11:03:37 GMT-0300 (hora de verano de Chile)),
(31, 17, 3, 'Merluza Austral', '5990.00', 1, '5990.00', Wed Oct 29 2025 11:03:37 GMT-0300 (hora de verano de Chile)),
(32, 18, 2, 'Atún Rojo', '12990.00', 3, '38970.00', Wed Oct 29 2025 11:15:17 GMT-0300 (hora de verano de Chile)),
(33, 19, 2, 'Atún Rojo', '12990.00', 2, '25980.00', Wed Oct 29 2025 11:16:15 GMT-0300 (hora de verano de Chile)),
(34, 20, 2, 'Atún Rojo', '12990.00', 4, '51960.00', Wed Oct 29 2025 11:24:34 GMT-0300 (hora de verano de Chile)),
(35, 21, 2, 'Atún Rojo', '12990.00', 2, '25980.00', Wed Oct 29 2025 11:27:54 GMT-0300 (hora de verano de Chile)),
(36, 21, 3, 'Merluza Austral', '5990.00', 2, '11980.00', Wed Oct 29 2025 11:27:54 GMT-0300 (hora de verano de Chile)),
(37, 22, 2, 'Atún Rojo', '12990.00', 2, '25980.00', Wed Oct 29 2025 11:33:10 GMT-0300 (hora de verano de Chile)),
(38, 22, 3, 'Merluza Austral', '5990.00', 2, '11980.00', Wed Oct 29 2025 11:33:10 GMT-0300 (hora de verano de Chile)),
(39, 23, 2, 'Atún Rojo', '12990.00', 2, '25980.00', Wed Oct 29 2025 11:52:13 GMT-0300 (hora de verano de Chile)),
(40, 23, 3, 'Merluza Austral', '5990.00', 2, '11980.00', Wed Oct 29 2025 11:52:13 GMT-0300 (hora de verano de Chile));


-- Table structure for table `orders`
DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` int DEFAULT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `city` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `region` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `postal_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payment_method` enum('transferencia','webpay','efectivo') COLLATE utf8mb4_unicode_ci NOT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `subtotal` decimal(10,2) NOT NULL,
  `shipping` decimal(10,2) NOT NULL DEFAULT '0.00',
  `total` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','processing','shipped','delivered','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `document_type` enum('boleta','factura') COLLATE utf8mb4_unicode_ci DEFAULT 'boleta',
  `rut` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `business_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `document_generated` tinyint(1) DEFAULT '0',
  `document_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `stripe_payment_intent_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `invoice_pdf_path` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `orders`
INSERT INTO `orders` VALUES
(1, 'GF-1761710730121-469', NULL, 'tu mama', 'Gatica Vasquez', 'ignacio.gatica77@gmail.com', '9 5514 7872', 'jorge washington', 'Santiago', 'Valparaíso', '1030000', 'webpay', '', '37960.00', '0.00', '37960.00', 'pending', 'boleta', NULL, NULL, 1, '/documents/GF-1761710730121-469-boleta.pdf', Wed Oct 29 2025 01:05:30 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 01:05:30 GMT-0300 (hora de verano de Chile), NULL, NULL),
(2, 'GF-1761711365303-987', NULL, 'tu mama', 'Gatica Vasquez', 'ignacio.gatica77@gmail.com', '9 5514 7872', 'jorge washington', 'Santiago', 'Valparaíso', '1030000', 'webpay', '', '37960.00', '0.00', '37960.00', 'pending', 'boleta', NULL, NULL, 1, '/documents/GF-1761711365303-987-boleta.pdf', Wed Oct 29 2025 01:16:05 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 01:16:05 GMT-0300 (hora de verano de Chile), NULL, NULL),
(3, 'GF-1761711621372-303', NULL, 'tu mama', 'Gatica Vasquez', 'ignacio.gatica77@gmail.com', '9 5514 7872', 'jorge washington', 'Santiago', 'Valparaíso', '1030000', 'webpay', '', '37960.00', '0.00', '37960.00', 'pending', 'boleta', NULL, NULL, 1, '/documents/GF-1761711621372-303-boleta.pdf', Wed Oct 29 2025 01:20:21 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 01:20:21 GMT-0300 (hora de verano de Chile), NULL, NULL),
(4, 'GF-1761712145212-479', NULL, 'tu mama', 'Gatica Vasquez', 'ignacio.gatica77@gmail.com', '9 5514 7872', 'jorge washington', 'Santiago', 'Valparaíso', '1030000', 'webpay', '', '37960.00', '0.00', '37960.00', 'pending', 'boleta', NULL, NULL, 1, '/documents/GF-1761712145212-479-boleta.pdf', Wed Oct 29 2025 01:29:05 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 01:29:05 GMT-0300 (hora de verano de Chile), NULL, NULL),
(5, 'GF-1761713837944-567', NULL, 'tu mama', 'Gatica Vasquez', 'ignacio.gatica77@gmail.com', '9 5514 7872', 'jorge washington', 'Santiago', 'Valparaíso', '1030000', 'webpay', '', '37960.00', '0.00', '37960.00', 'pending', 'boleta', NULL, NULL, 1, '/documents/GF-1761713837944-567-boleta.pdf', Wed Oct 29 2025 01:57:17 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 01:57:18 GMT-0300 (hora de verano de Chile), NULL, NULL),
(6, 'GF-1761714226557-745', NULL, 'tu mama', 'Gatica Vasquez', 'ignacio.gatica77@gmail.com', '9 5514 7872', 'jorge washington', 'Santiago', 'Valparaíso', '1030000', 'webpay', '', '37960.00', '0.00', '37960.00', 'pending', 'boleta', NULL, NULL, 1, '/documents/GF-1761714226557-745-boleta.pdf', Wed Oct 29 2025 02:03:46 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 02:03:47 GMT-0300 (hora de verano de Chile), NULL, NULL),
(7, 'GF-1761715062633-334', NULL, 'tu mama', 'Gatica Vasquez', 'ignacio.gatica77@gmail.com', '9 5514 7872', 'jorge washington', 'Santiago', 'Valparaíso', '1030000', 'webpay', '', '37960.00', '0.00', '37960.00', 'pending', 'boleta', NULL, NULL, 0, NULL, Wed Oct 29 2025 02:17:42 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 02:17:42 GMT-0300 (hora de verano de Chile), NULL, NULL),
(8, 'GF-1761715403766-236', NULL, 'tu mama', 'Gatica Vasquez', 'ignacio.gatica77@gmail.com', '9 5514 7872', 'jorge washington', 'Santiago', 'Valparaíso', '1030000', 'webpay', '', '37960.00', '0.00', '37960.00', 'pending', 'boleta', NULL, NULL, 0, NULL, Wed Oct 29 2025 02:23:23 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 02:23:23 GMT-0300 (hora de verano de Chile), NULL, NULL),
(9, 'GF-1761718043684-18', NULL, 'tu mama', 'Gatica Vasquez', 'ignacio.gatica77@gmail.com', '9 5514 7872', 'jorge washington', 'Santiago', 'Metropolitana de Santiago', '1030000', 'webpay', '', '37960.00', '0.00', '37960.00', 'pending', 'boleta', NULL, NULL, 0, NULL, Wed Oct 29 2025 03:07:23 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 03:07:23 GMT-0300 (hora de verano de Chile), NULL, NULL),
(10, 'GF-1761718456917-162', NULL, 'tu mama', 'Gatica Vasquez', 'ignacio.gatica77@gmail.com', '9 5514 7872', 'jorge washington', 'Santiago', 'Metropolitana de Santiago', '1030000', 'webpay', '', '37960.00', '0.00', '37960.00', 'pending', 'boleta', NULL, NULL, 0, NULL, Wed Oct 29 2025 03:14:16 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 03:14:16 GMT-0300 (hora de verano de Chile), NULL, NULL),
(11, 'GF-1761718831923-594', NULL, 'tu mama', 'Gatica Vasquez', 'ignacio.gatica77@gmail.com', '9 5514 7872', 'jorge washington', 'Santiago', 'Valparaíso', '1030000', 'webpay', '', '43950.00', '0.00', '43950.00', 'pending', 'boleta', NULL, NULL, 0, NULL, Wed Oct 29 2025 03:20:31 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 03:20:31 GMT-0300 (hora de verano de Chile), NULL, NULL),
(12, 'GF-1761718959950-714', NULL, 'tu mama', 'Gatica Vasquez', 'ignacio.gatica77@gmail.com', '9 5514 7872', 'jorge washington', 'Santiago', 'Metropolitana de Santiago', '1030000', 'webpay', '', '25980.00', '5000.00', '30980.00', 'pending', 'boleta', NULL, NULL, 0, NULL, Wed Oct 29 2025 03:22:39 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 03:22:39 GMT-0300 (hora de verano de Chile), NULL, NULL),
(13, 'GF-1761719083472-678', NULL, 'tu mama', 'Gatica Vasquez', 'ignacio.gatica77@gmail.com', '9 5514 7872', 'jorge washington', 'Santiago', 'Metropolitana de Santiago', '1030000', 'webpay', '', '25980.00', '5000.00', '30980.00', 'pending', 'boleta', NULL, NULL, 0, NULL, Wed Oct 29 2025 03:24:43 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 03:24:43 GMT-0300 (hora de verano de Chile), NULL, NULL),
(14, 'GF-1761719733816-390', NULL, 'tu mama', 'Gatica Vasquez', 'ignacio.gatica77@gmail.com', '9 5514 7872', 'jorge washington', 'Santiago', 'Valparaíso', '1030000', 'webpay', '', '25980.00', '5000.00', '30980.00', 'pending', 'boleta', NULL, NULL, 0, NULL, Wed Oct 29 2025 03:35:33 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 03:35:33 GMT-0300 (hora de verano de Chile), NULL, NULL),
(15, 'GF-1761720111213-792', NULL, 'tu mama', 'Gatica Vasquez', 'ignacio.gatica77@gmail.com', '9 5514 7872', 'jorge washington', 'Santiago', 'Metropolitana de Santiago', '1030000', 'webpay', '', '37960.00', '0.00', '37960.00', 'pending', 'boleta', NULL, NULL, 0, NULL, Wed Oct 29 2025 03:41:51 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 03:41:51 GMT-0300 (hora de verano de Chile), NULL, NULL),
(16, 'GF-1761746353561-93', NULL, 'tu mama', 'Gatica Vasquez', 'jpeg181001@gmail.com', '9 5514 7872', 'jorge washington', 'Santiago', 'Valparaíso', '1030000', 'webpay', '', '37960.00', '0.00', '37960.00', 'pending', 'boleta', NULL, NULL, 0, NULL, Wed Oct 29 2025 10:59:13 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 10:59:13 GMT-0300 (hora de verano de Chile), NULL, NULL),
(17, 'GF-1761746617502-841', NULL, 'tu mama', 'Gatica Vasquez', 'jpeg181001@gmail.com', '9 5514 7872', 'jorge washington', 'Santiago', 'Valparaíso', '1030000', 'webpay', '', '18980.00', '5000.00', '23980.00', 'pending', 'boleta', NULL, NULL, 0, NULL, Wed Oct 29 2025 11:03:37 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 11:03:37 GMT-0300 (hora de verano de Chile), NULL, NULL),
(18, 'GF-1761747317667-712', NULL, 'tu mama', 'Gatica Vasquez', 'jpeg181001@gmail.com', '9 5514 7872', 'jorge washington', 'Santiago', 'Valparaíso', '1030000', 'webpay', '', '38970.00', '0.00', '38970.00', 'pending', 'boleta', NULL, NULL, 0, NULL, Wed Oct 29 2025 11:15:17 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 11:15:17 GMT-0300 (hora de verano de Chile), NULL, NULL),
(19, 'GF-1761747375910-465', NULL, 'tu mama', 'Gatica Vasquez', 'jpeg181001@gmail.com', '9 5514 7872', 'jorge washington', 'Santiago', 'Valparaíso', '1030000', 'webpay', '', '25980.00', '5000.00', '30980.00', 'pending', 'boleta', NULL, NULL, 0, NULL, Wed Oct 29 2025 11:16:15 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 11:16:15 GMT-0300 (hora de verano de Chile), NULL, NULL),
(20, 'GF-1761747874900-73', NULL, 'tu mama', 'Gatica Vasquez', 'jpeg181001@gmail.com', '9 5514 7872', 'jorge washington', 'Santiago', 'Valparaíso', '1030000', 'webpay', '', '51960.00', '0.00', '51960.00', 'pending', 'boleta', NULL, NULL, 0, NULL, Wed Oct 29 2025 11:24:34 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 11:24:34 GMT-0300 (hora de verano de Chile), NULL, NULL),
(21, 'GF-1761748074864-920', NULL, 'tu mama', 'Gatica Vasquez', 'jpeg181001@gmail.com', '9 5514 7872', 'jorge washington', 'Santiago', 'Valparaíso', '1030000', 'webpay', '', '37960.00', '0.00', '37960.00', 'pending', 'boleta', NULL, NULL, 0, NULL, Wed Oct 29 2025 11:27:54 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 11:27:54 GMT-0300 (hora de verano de Chile), NULL, NULL),
(22, 'GF-1761748390654-583', NULL, 'tu mama', 'Gatica Vasquez', 'jpeg181001@gmail.com', '9 5514 7872', 'jorge washington', 'Santiago', 'Valparaíso', '1030000', 'webpay', '', '37960.00', '0.00', '37960.00', 'pending', 'boleta', NULL, NULL, 0, NULL, Wed Oct 29 2025 11:33:10 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 11:38:13 GMT-0300 (hora de verano de Chile), 'cs_test_a1gorK1OEpfKOqvdf39avwQ7n7ZGobNfylRQVdxeFkAO8mq0uN5Yrzgnnm', NULL),
(23, 'GF-1761749533907-914', NULL, 'tu mama', 'Gatica Vasquez', 'jpeg181001@gmail.com', '9 5514 7872', 'jorge washington', 'Santiago', 'Valparaíso', '1030000', 'webpay', '', '37960.00', '0.00', '37960.00', 'pending', 'boleta', NULL, NULL, 0, NULL, Wed Oct 29 2025 11:52:13 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 11:52:15 GMT-0300 (hora de verano de Chile), 'cs_test_a1D4UoUCIGRMBunerlDysauvG8EKixNW6hGkzUQDX0yPcqj5SO17y39L0a', NULL);


-- Table structure for table `pedido`
DROP TABLE IF EXISTS `pedido`;
CREATE TABLE `pedido` (
  `id_pedido` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `valor_total` decimal(10,2) NOT NULL,
  `estado` varchar(50) NOT NULL,
  `fecha_solicitud` datetime NOT NULL,
  `fecha_recepcion` datetime DEFAULT NULL,
  PRIMARY KEY (`id_pedido`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `pedido_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table structure for table `permisos`
DROP TABLE IF EXISTS `permisos`;
CREATE TABLE `permisos` (
  `ID` int NOT NULL,
  `PermisoInfo` text,
  `PermisoColor` varchar(255) DEFAULT NULL,
  `IDColor` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `IDColor` (`IDColor`),
  CONSTRAINT `permisos_ibfk_1` FOREIGN KEY (`IDColor`) REFERENCES `colores` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table structure for table `producto`
DROP TABLE IF EXISTS `producto`;
CREATE TABLE `producto` (
  `id_producto` int NOT NULL AUTO_INCREMENT,
  `id_categoria` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `valor` decimal(10,2) NOT NULL,
  `stock` int NOT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `origen` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_producto`),
  KEY `id_categoria` (`id_categoria`),
  CONSTRAINT `producto_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categoria` (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table structure for table `products`
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(500) DEFAULT NULL,
  `category` enum('pescados','mariscos') NOT NULL,
  `stock` int DEFAULT '0',
  `featured` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table `products`
INSERT INTO `products` VALUES
(1, 'Salmón Fresco', 'Salmón fresco del día, ideal para preparaciones crudas como sushi o ceviches.', '8990.00', '/images/salmon.jpg', 'pescados', 50, 1, Tue Oct 28 2025 23:43:07 GMT-0300 (hora de verano de Chile), Tue Oct 28 2025 23:43:07 GMT-0300 (hora de verano de Chile)),
(2, 'Merluza Austral', 'Merluza austral de aguas profundas, perfecta para frituras y guisos.', '5990.00', '/images/merluza.jpg', 'pescados', 40, 1, Tue Oct 28 2025 23:43:07 GMT-0300 (hora de verano de Chile), Tue Oct 28 2025 23:43:07 GMT-0300 (hora de verano de Chile)),
(3, 'Reineta', 'Reineta fresca, pescado blanco de sabor suave ideal para hornear.', '6490.00', '/images/reineta.jpg', 'pescados', 35, 1, Tue Oct 28 2025 23:43:07 GMT-0300 (hora de verano de Chile), Tue Oct 28 2025 23:43:07 GMT-0300 (hora de verano de Chile)),
(4, 'Camarones', 'Camarones ecuatorianos de cultivo, perfectos para cócteles y paellas.', '12990.00', '/images/camarones.jpg', 'mariscos', 30, 1, Tue Oct 28 2025 23:43:07 GMT-0300 (hora de verano de Chile), Tue Oct 28 2025 23:43:07 GMT-0300 (hora de verano de Chile)),
(5, 'Congrio', 'Congrio dorado, ideal para caldillo y frituras.', '9990.00', '/images/congrio.jpg', 'pescados', 25, 0, Tue Oct 28 2025 23:43:07 GMT-0300 (hora de verano de Chile), Tue Oct 28 2025 23:43:07 GMT-0300 (hora de verano de Chile)),
(6, 'Choritos', 'Choritos frescos de la zona, perfectos para preparar a la marinera.', '4990.00', '/images/choritos.jpg', 'mariscos', 60, 0, Tue Oct 28 2025 23:43:07 GMT-0300 (hora de verano de Chile), Tue Oct 28 2025 23:43:07 GMT-0300 (hora de verano de Chile)),
(7, 'Pulpo', 'Pulpo fresco, ideal para ensaladas y preparaciones a la parrilla.', '15990.00', '/images/pulpo.jpg', 'mariscos', 15, 0, Tue Oct 28 2025 23:43:07 GMT-0300 (hora de verano de Chile), Tue Oct 28 2025 23:43:07 GMT-0300 (hora de verano de Chile)),
(8, 'Atún', 'Atún fresco, perfecto para tataki y preparaciones a la plancha.', '11990.00', '/images/atun.jpg', 'pescados', 20, 0, Tue Oct 28 2025 23:43:07 GMT-0300 (hora de verano de Chile), Tue Oct 28 2025 23:43:07 GMT-0300 (hora de verano de Chile));


-- Table structure for table `users`
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('user','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `email_verified` tinyint(1) DEFAULT '0',
  `verification_token` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verification_token_expires` datetime DEFAULT NULL,
  `password_reset_token` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_expires` datetime DEFAULT NULL,
  `failed_login_attempts` int DEFAULT '0',
  `account_locked_until` datetime DEFAULT NULL,
  `last_login_attempt` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_verification_token` (`verification_token`),
  KEY `idx_password_reset_token` (`password_reset_token`),
  KEY `idx_account_locked` (`account_locked_until`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `users`
INSERT INTO `users` VALUES
(1, 'Administrador GoFish', 'admin@gofish.cl', '$2b$10$7oEZ3MJukeV4LNr8Gg/GPeMBXEYP5./3Hip9VvR.gsNkrnf0DLN4O', 'admin', 1, NULL, NULL, NULL, NULL, 0, NULL, NULL, Wed Oct 29 2025 11:13:54 GMT-0300 (hora de verano de Chile), Wed Oct 29 2025 11:13:54 GMT-0300 (hora de verano de Chile));


-- Table structure for table `users_new`
DROP TABLE IF EXISTS `users_new`;
CREATE TABLE `users_new` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('user','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `email_verified` tinyint(1) DEFAULT '0',
  `verification_token` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verification_token_expires` datetime DEFAULT NULL,
  `password_reset_token` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_expires` datetime DEFAULT NULL,
  `failed_login_attempts` int DEFAULT '0',
  `account_locked_until` datetime DEFAULT NULL,
  `last_login_attempt` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `users_new`
INSERT INTO `users_new` VALUES
(1, 'Administrador GoFish', 'admin@gofish.cl', '$2b$10$W4fX5IlUBdoDVffir6uLYuCTuCNwzLjXqCRrYc52qVFd3FKfscFw.', 'admin', 1, NULL, NULL, NULL, NULL, 0, NULL, NULL, Tue Oct 28 2025 23:48:12 GMT-0300 (hora de verano de Chile), Tue Oct 28 2025 23:48:12 GMT-0300 (hora de verano de Chile));


-- Table structure for table `users_temp`
DROP TABLE IF EXISTS `users_temp`;
CREATE TABLE `users_temp` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('user','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `email_verified` tinyint(1) DEFAULT '0',
  `verification_token` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `verification_token_expires` datetime DEFAULT NULL,
  `password_reset_token` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password_reset_expires` datetime DEFAULT NULL,
  `failed_login_attempts` int DEFAULT '0',
  `account_locked_until` datetime DEFAULT NULL,
  `last_login_attempt` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table structure for table `usuario`
DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table structure for table `usuarios_mfa`
DROP TABLE IF EXISTS `usuarios_mfa`;
CREATE TABLE `usuarios_mfa` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `secret` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `usuarios_mfa_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Table structure for table `valoracionproducto`
DROP TABLE IF EXISTS `valoracionproducto`;
CREATE TABLE `valoracionproducto` (
  `id_valoracion` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `id_producto` int NOT NULL,
  `valoracion` tinyint(1) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_valoracion`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `valoracionproducto_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`),
  CONSTRAINT `valoracionproducto_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `producto` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Table structure for table `visita`
DROP TABLE IF EXISTS `visita`;
CREATE TABLE `visita` (
  `id_visita` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `fecha_registro` datetime NOT NULL,
  PRIMARY KEY (`id_visita`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `visita_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

