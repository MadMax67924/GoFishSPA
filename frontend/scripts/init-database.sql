-- Script para inicializar la base de datos MySQL de GoFish SpA

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS gofish CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE gofish;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Tabla para historial de precios
CREATE TABLE IF NOT EXISTS price_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    date_recorded TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product_date (product_id, date_recorded)
);

-- Trigger para guardar automáticamente cambios de precio
DROP TRIGGER IF EXISTS price_change_trigger;
DELIMITER //
CREATE TRIGGER price_change_trigger
    AFTER UPDATE ON products
    FOR EACH ROW
BEGIN
    IF OLD.price != NEW.price THEN
        INSERT INTO price_history (product_id, price) 
        VALUES (NEW.id, NEW.price);
    END IF;
END//
DELIMITER ;

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

-- Insertar usuario administrador de ejemplo
INSERT IGNORE INTO users (name, email, password, role) VALUES
('Administrador GoFish', 'admin@gofish.cl', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Poblar algunos datos históricos de ejemplo
INSERT IGNORE INTO price_history (product_id, price, date_recorded) VALUES
(1, 10990, DATE_SUB(NOW(), INTERVAL 45 DAY)),
(1, 9890, DATE_SUB(NOW(), INTERVAL 30 DAY)),
(1, 9490, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(1, 8990, DATE_SUB(NOW(), INTERVAL 7 DAY)),
(2, 6490, DATE_SUB(NOW(), INTERVAL 20 DAY)),
(2, 5990, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(3, 7490, DATE_SUB(NOW(), INTERVAL 25 DAY)),
(3, 6490, DATE_SUB(NOW(), INTERVAL 12 DAY));

-- Marcar algunos productos como agotados para probar
UPDATE products SET stock = 0 WHERE id IN (1, 7);

COMMIT;
