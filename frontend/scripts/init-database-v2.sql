-- Script actualizado para inicializar la base de datos MySQL de GoFish SpA
-- Incluye nuevas funcionalidades de autenticación

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS gofish CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gofish;

-- Tabla de usuarios actualizada con nuevas columnas de seguridad
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    
    -- Campos para verificación de email
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(64) NULL,
    verification_token_expires DATETIME NULL,
    
    -- Campos para recuperación de contraseña
    password_reset_token VARCHAR(64) NULL,
    password_reset_expires DATETIME NULL,
    
    -- Campos para seguridad de cuenta
    failed_login_attempts INT DEFAULT 0,
    account_locked_until DATETIME NULL,
    last_login_attempt DATETIME NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Índices para mejorar rendimiento
    INDEX idx_email (email),
    INDEX idx_verification_token (verification_token),
    INDEX idx_password_reset_token (password_reset_token),
    INDEX idx_account_locked (account_locked_until)
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(500),
    category ENUM('pescados', 'mariscos') NOT NULL,
    stock INT DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de carritos
CREATE TABLE IF NOT EXISTS carts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id VARCHAR(255) UNIQUE NOT NULL,
    user_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla de items del carrito
CREATE TABLE IF NOT EXISTS cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_cart_product (cart_id, product_id)
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(255) NOT NULL,
    region VARCHAR(255) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    payment_method ENUM('transferencia', 'webpay', 'efectivo') NOT NULL,
    notes TEXT,
    subtotal DECIMAL(10, 2) NOT NULL,
    shipping DECIMAL(10, 2) NOT NULL DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabla de items del pedido
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

-- Tabla de contactos
CREATE TABLE IF NOT EXISTS contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de resenas, 
-- no esta implementada aun la FOREIGN KEY debido a la falta de implementacion de base de datos en productos
CREATE TABLE reviews (
	id VARCHAR(255) NOT NULL,
	productId VARCHAR(255) NOT NULL,
	texto VARCHAR(255) NOT NULL,
	imagen VARCHAR(255) NULL,
	fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	aprovado BOOLEAN DEFAULT FALSE
);

-- Índices adicionales para mejorar el rendimiento
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Insertar datos de ejemplo
INSERT IGNORE INTO products (name, description, price, image, category, stock, featured) VALUES
('Salmón Fresco', 'Salmón fresco del día, ideal para preparaciones crudas como sushi o ceviches.', 8990.00, '/images/salmon.jpg', 'pescados', 50, TRUE),
('Merluza Austral', 'Merluza austral de aguas profundas, perfecta para frituras y guisos.', 5990.00, '/images/merluza.jpg', 'pescados', 40, TRUE),
('Reineta', 'Reineta fresca, pescado blanco de sabor suave ideal para hornear.', 6490.00, '/images/reineta.jpg', 'pescados', 35, TRUE),
('Camarones', 'Camarones ecuatorianos de cultivo, perfectos para cócteles y paellas.', 12990.00, '/images/camarones.jpg', 'mariscos', 30, TRUE),
('Congrio', 'Congrio dorado, ideal para caldillo y frituras.', 9990.00, '/images/congrio.jpg', 'pescados', 25, FALSE),
('Choritos', 'Choritos frescos de la zona, perfectos para preparar a la marinera.', 4990.00, '/images/choritos.jpg', 'mariscos', 60, FALSE),
('Pulpo', 'Pulpo fresco, ideal para ensaladas y preparaciones a la parrilla.', 15990.00, '/images/pulpo.jpg', 'mariscos', 15, FALSE),
('Atún', 'Atún fresco, perfecto para tataki y preparaciones a la plancha.', 11990.00, '/images/atun.jpg', 'pescados', 20, FALSE);

-- Insertar usuario administrador de ejemplo (contraseña: admin123)
INSERT IGNORE INTO users (name, email, password, role, email_verified) VALUES
('Administrador GoFish', 'admin@gofish.cl', '$2b$12$oY8XRaFPgaAroDCsM.YBbet.NMVS6CzyQIA6hitFYWMR7.riMZ35S', 'admin', TRUE);

-- =============================================================================
-- NUEVAS TABLAS PARA MERCADO PAGO Y TARJETAS TOKENIZADAS
-- =============================================================================

-- Tabla para tarjetas tokenizadas de usuarios
CREATE TABLE IF NOT EXISTS user_cards (
    id VARCHAR(36) PRIMARY KEY,
    user_id INT NOT NULL,
    card_token VARCHAR(255) NOT NULL,
    last_four_digits VARCHAR(4) NOT NULL,
    expiration_month INT NOT NULL,
    expiration_year INT NOT NULL,
    cardholder_name VARCHAR(255) NOT NULL,
    card_type VARCHAR(50),
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_card_token (card_token),
    INDEX idx_user_cards_user_id (user_id),
    INDEX idx_user_cards_active (is_active)
);

-- =============================================================================
-- TABLAS PARA COMPRAS RECURRENTES (Caso de uso Nº62)
-- =============================================================================

-- Tabla de suscripciones/recurrencias
CREATE TABLE IF NOT EXISTS recurring_orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    
    -- Configuración de recurrencia
    frequency ENUM('weekly', 'biweekly', 'monthly') NOT NULL,
    interval_value INT DEFAULT 1, -- Cada 1 semana, 2 semanas, etc.
    
    -- Próxima ejecución
    next_delivery_date DATE NOT NULL,
    
    -- Información de envío y pago
    shipping_address JSON NOT NULL,
    payment_method VARCHAR(100) NOT NULL,
    card_token VARCHAR(255) NULL, -- Tarjeta guardada para pagos automáticos
    
    -- Estado y configuración
    status ENUM('active', 'paused', 'cancelled') DEFAULT 'active',
    max_occurrences INT NULL, -- Límite de repeticiones (NULL = infinito)
    occurrences_count INT DEFAULT 0,
    
    -- Metadatos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_processed_at TIMESTAMP NULL,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    
    INDEX idx_recurring_orders_user_id (user_id),
    INDEX idx_recurring_orders_status (status),
    INDEX idx_recurring_orders_next_delivery (next_delivery_date),
    INDEX idx_recurring_orders_active (status, next_delivery_date)
);

-- Tabla de historial de órdenes recurrentes procesadas
CREATE TABLE IF NOT EXISTS recurring_order_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recurring_order_id VARCHAR(36) NOT NULL,
    order_id INT NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('success', 'failed') NOT NULL,
    error_message TEXT NULL,
    
    FOREIGN KEY (recurring_order_id) REFERENCES recurring_orders(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    
    INDEX idx_recurring_logs_recurring_id (recurring_order_id),
    INDEX idx_recurring_logs_processed_at (processed_at)
);


-- Agregar campos de Mercado Pago a la tabla orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS mercado_pago_preference_id VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS payment_status ENUM('pending', 'approved', 'rejected', 'in_process', 'cancelled') DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(100) NULL,
ADD COLUMN IF NOT EXISTS card_last_four VARCHAR(4) NULL,
ADD COLUMN IF NOT EXISTS installments INT DEFAULT 1;

-- Actualizar el ENUM de payment_method en orders para incluir mercado_pago
ALTER TABLE orders 
MODIFY COLUMN payment_method ENUM('transferencia', 'webpay', 'efectivo', 'mercado_pago') NOT NULL;

-- Tabla para logs de pagos (opcional pero recomendado)
CREATE TABLE IF NOT EXISTS payment_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    payment_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    message TEXT,
    raw_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_payment_logs_order_id (order_id),
    INDEX idx_payment_logs_payment_id (payment_id),
    INDEX idx_payment_logs_created_at (created_at)
);

-- Índices adicionales para mejorar rendimiento de pagos
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_mercado_pago_preference ON orders(mercado_pago_preference_id);

-- =============================================================================
-- CAMPOS PARA BOLETA/FACTURA (Caso de uso N°41)
-- =============================================================================

-- Agregar campos de documento fiscal a la tabla orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS document_type ENUM('boleta', 'factura') DEFAULT 'boleta',
ADD COLUMN IF NOT EXISTS rut VARCHAR(12) NULL,
ADD COLUMN IF NOT EXISTS business_name VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS document_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS document_url VARCHAR(500) NULL;

-- Tabla para logs de generación de documentos
CREATE TABLE IF NOT EXISTS document_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    document_type ENUM('boleta', 'factura') NOT NULL,
    document_number VARCHAR(50) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    download_url VARCHAR(500) NULL,
    sent_via_email BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_document_logs_order_id (order_id),
    INDEX idx_document_logs_document_number (document_number)
);

COMMIT;