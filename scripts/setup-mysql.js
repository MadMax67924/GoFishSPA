// Script para configurar MySQL para GoFish SpA

import mysql from "mysql2/promise"

const config = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "gofish",
}

async function setupDatabase() {
  let connection

  try {
    console.log("🔄 Conectando a MySQL...")
    connection = await mysql.createConnection(config)
    console.log("✅ Conectado a MySQL")

    // Verificar si las tablas ya existen
    console.log("🔄 Verificando estructura de base de datos...")
    const [tables] = await connection.execute("SHOW TABLES")

    if (tables.length === 0) {
      console.log("📋 Creando estructura de base de datos...")

      // Crear tabla de usuarios
      await connection.execute(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role ENUM('user', 'admin') DEFAULT 'user',
          email_verified BOOLEAN DEFAULT FALSE,
          verification_token VARCHAR(64) NULL,
          verification_token_expires DATETIME NULL,
          password_reset_token VARCHAR(64) NULL,
          password_reset_expires DATETIME NULL,
          failed_login_attempts INT DEFAULT 0,
          account_locked_until DATETIME NULL,
          last_login_attempt DATETIME NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_verification_token (verification_token),
          INDEX idx_password_reset_token (password_reset_token)
        )
      `)
      console.log("✅ Tabla users creada")

      // Crear tabla de productos
      await connection.execute(`
        CREATE TABLE products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10, 2) NOT NULL,
          image VARCHAR(500),
          category ENUM('pescados', 'mariscos') NOT NULL,
          stock INT DEFAULT 0,
          featured BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_category (category),
          INDEX idx_featured (featured),
          INDEX idx_price (price)
        )
      `)
      console.log("✅ Tabla products creada")

      // Crear tabla de carritos
      await connection.execute(`
        CREATE TABLE carts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          cart_id VARCHAR(255) UNIQUE NOT NULL,
          user_id INT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `)
      console.log("✅ Tabla carts creada")

      // Crear tabla de items del carrito
      await connection.execute(`
        CREATE TABLE cart_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          cart_id INT NOT NULL,
          product_id INT NOT NULL,
          quantity INT NOT NULL DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
          UNIQUE KEY unique_cart_product (cart_id, product_id)
        )
      `)
      console.log("✅ Tabla cart_items creada")

      // Crear tabla de pedidos
      await connection.execute(`
        CREATE TABLE orders (
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
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
          INDEX idx_status (status),
          INDEX idx_created_at (created_at)
        )
      `)
      console.log("✅ Tabla orders creada")

      // Crear tabla de items del pedido
      await connection.execute(`
        CREATE TABLE order_items (
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
        )
      `)
      console.log("✅ Tabla order_items creada")

      // Crear tabla de contactos
      await connection.execute(`
        CREATE TABLE contacts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          status ENUM('new', 'read', 'replied') DEFAULT 'new',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `)
      console.log("✅ Tabla contacts creada")

      console.log("📦 Insertando datos de ejemplo...")

      // Insertar productos de ejemplo
      const products = [
        [
          "Salmón Fresco",
          "Salmón fresco del día, ideal para preparaciones crudas como sushi o ceviches.",
          8990.0,
          "/placeholder.svg?height=200&width=300",
          "pescados",
          50,
          true,
        ],
        [
          "Merluza Austral",
          "Merluza austral de aguas profundas, perfecta para frituras y guisos.",
          5990.0,
          "/placeholder.svg?height=200&width=300",
          "pescados",
          40,
          true,
        ],
        [
          "Reineta",
          "Reineta fresca, pescado blanco de sabor suave ideal para hornear.",
          6490.0,
          "/placeholder.svg?height=200&width=300",
          "pescados",
          35,
          true,
        ],
        [
          "Camarones",
          "Camarones ecuatorianos de cultivo, perfectos para cócteles y paellas.",
          12990.0,
          "/placeholder.svg?height=200&width=300",
          "mariscos",
          30,
          true,
        ],
        [
          "Congrio",
          "Congrio dorado, ideal para caldillo y frituras.",
          9990.0,
          "/placeholder.svg?height=200&width=300",
          "pescados",
          25,
          false,
        ],
        [
          "Choritos",
          "Choritos frescos de la zona, perfectos para preparar a la marinera.",
          4990.0,
          "/placeholder.svg?height=200&width=300",
          "mariscos",
          60,
          false,
        ],
        [
          "Pulpo",
          "Pulpo fresco, ideal para ensaladas y preparaciones a la parrilla.",
          15990.0,
          "/placeholder.svg?height=200&width=300",
          "mariscos",
          15,
          false,
        ],
        [
          "Atún",
          "Atún fresco, perfecto para tataki y preparaciones a la plancha.",
          11990.0,
          "/placeholder.svg?height=200&width=300",
          "pescados",
          20,
          false,
        ],
      ]

      for (const product of products) {
        await connection.execute(
          "INSERT INTO products (name, description, price, image, category, stock, featured) VALUES (?, ?, ?, ?, ?, ?, ?)",
          product,
        )
      }
      console.log("✅ Productos de ejemplo insertados")

      // Insertar usuario administrador
      const hashedPassword = "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi" // admin123
      await connection.execute(
        "INSERT INTO users (name, email, password, role, email_verified) VALUES (?, ?, ?, ?, ?)",
        ["Administrador GoFish", "admin@gofish.cl", hashedPassword, "admin", true],
      )
      console.log("✅ Usuario administrador creado")
      console.log("📧 Email: admin@gofish.cl")
      console.log("🔑 Contraseña: admin123")
    } else {
      console.log("ℹ️ La base de datos ya está configurada")
    }

    // Verificar conexión
    await connection.execute("SELECT 1")
    console.log("🎉 ¡Base de datos MySQL configurada correctamente!")
  } catch (error) {
    console.error("❌ Error al configurar la base de datos:", error.message)
    throw error
  } finally {
    if (connection) {
      await connection.end()
      console.log("🔌 Conexión cerrada")
    }
  }
}

// Ejecutar la configuración
setupDatabase()
