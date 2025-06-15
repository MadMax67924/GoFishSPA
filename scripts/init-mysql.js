// Script para inicializar la base de datos MySQL paso a paso

import mysql from "mysql2/promise"

const DATABASE_URL = process.env.DATABASE_URL || "mysql://root:password@localhost:3306/gofish"

async function initializeDatabase() {
  let connection

  try {
    console.log("🔄 Conectando a MySQL...")

    // Crear conexión
    connection = await mysql.createConnection(DATABASE_URL)
    console.log(" Conectado a MySQL")

    // Crear tablas una por una
    console.log(" Creando tabla users...")
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    console.log("✅ Tabla users creada")

    console.log("🔄 Creando tabla products...")
    await connection.execute(`
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
      )
    `)
    console.log(" Tabla products creada")

    console.log(" Creando tabla carts...")
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS carts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cart_id VARCHAR(255) UNIQUE NOT NULL,
        user_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `)
    console.log(" Tabla carts creada")

    console.log("Creando tabla cart_items...")
    await connection.execute(`
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
      )
    `)
    console.log(" Tabla cart_items creada")

    console.log(" Creando tabla orders...")
    await connection.execute(`
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
      )
    `)
    console.log(" Tabla orders creada")

    console.log(" Creando tabla order_items...")
    await connection.execute(`
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
      )
    `)
    console.log(" Tabla order_items creada")

    console.log(" Creando tabla contacts...")
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('new', 'read', 'replied') DEFAULT 'new',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `)
    console.log("Tabla contacts creada")

    console.log("Insertando productos de ejemplo...")

    // Verificar si ya existen productos
    const [existingProducts] = await connection.execute("SELECT COUNT(*) as count FROM products")

    if (existingProducts[0].count === 0) {
      const products = [
        [
          "Salmón Fresco",
          "Salmón fresco del día, ideal para preparaciones crudas como sushi o ceviches.",
          8990.0,
          "/images/salmon.jpg",
          "pescados",
          50,
          true,
        ],
        [
          "Merluza Austral",
          "Merluza austral de aguas profundas, perfecta para frituras y guisos.",
          5990.0,
          "/images/merluza.jpg",
          "pescados",
          40,
          true,
        ],
        [
          "Reineta",
          "Reineta fresca, pescado blanco de sabor suave ideal para hornear.",
          6490.0,
          "/images/reineta.jpg",
          "pescados",
          35,
          true,
        ],
        [
          "Camarones",
          "Camarones ecuatorianos de cultivo, perfectos para cócteles y paellas.",
          12990.0,
          "/images/camarones.jpg",
          "mariscos",
          30,
          true,
        ],
        [
          "Congrio",
          "Congrio dorado, ideal para caldillo y frituras.",
          9990.0,
          "/images/congrio.jpg",
          "pescados",
          25,
          false,
        ],
        [
          "Choritos",
          "Choritos frescos de la zona, perfectos para preparar a la marinera.",
          4990.0,
          "/images/choritos.jpg",
          "mariscos",
          60,
          false,
        ],
        [
          "Pulpo",
          "Pulpo fresco, ideal para ensaladas y preparaciones a la parrilla.",
          15990.0,
          "/images/pulpo.jpg",
          "mariscos",
          15,
          false,
        ],
        [
          "Atún",
          "Atún fresco, perfecto para tataki y preparaciones a la plancha.",
          11990.0,
          "/images/atun.jpg",
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
      console.log("Productos de ejemplo insertados")
    } else {
      console.log("ℹ Los productos ya existen, saltando inserción")
    }

    console.log(" Creando usuario administrador...")

    // Verificar si ya existe el usuario admin
    const [existingAdmin] = await connection.execute(
      "SELECT COUNT(*) as count FROM users WHERE email = 'admin@gofish.cl'",
    )

    if (existingAdmin[0].count === 0) {
      // Hash de la contraseña "admin123"
      const hashedPassword = "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi"

      await connection.execute("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [
        "Administrador GoFish",
        "admin@gofish.cl",
        hashedPassword,
        "admin",
      ])
      console.log(" Usuario administrador creado")
      console.log(" Email: admin@gofish.cl")
      console.log(" Contraseña: admin123")
    } else {
      console.log(" El usuario administrador ya existe")
    }

    console.log(" ¡Base de datos inicializada correctamente!")
  } catch (error) {
    console.error(" Error al inicializar la base de datos:", error.message)
    throw error
  } finally {
    if (connection) {
      await connection.end()
      console.log("🔌 Conexión cerrada")
    }
  }
}

// Ejecutar la inicialización
initializeDatabase()
