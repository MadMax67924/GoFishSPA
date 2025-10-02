const mysql = require("mysql2/promise")

async function setupDatabase() {
  let connection

  try {
    console.log(" Conectando a MySQL...")

    // Configuración de conexión
    const config = {
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number.parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "toki1801",
      database: process.env.DB_NAME || "gofish",
      charset: "utf8mb4",
      acquireTimeout: 60000,
      timeout: 60000,
    }

    console.log(` Conectando a ${config.host}:${config.port} como ${config.user}`)

    connection = await mysql.createConnection(config)
    console.log(" Conexión exitosa a MySQL")

    // Verificar si las tablas ya existen
    console.log(" Verificando estructura de base de datos...")
    const [tables] = await connection.execute("SHOW TABLES")
    const existingTables = tables.map((row) => Object.values(row)[0])

    console.log(" Tablas existentes:", existingTables.length > 0 ? existingTables : "ninguna")

    // Crear tabla de usuarios actualizada con nuevas columnas de seguridad
    if (!existingTables.includes("users")) {
      console.log(" Creando tabla users...")
      await connection.execute(`
        CREATE TABLE users (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log(" Tabla users creada")
    }

    // Crear tabla de productos
    if (!existingTables.includes("products")) {
      console.log(" Creando tabla products...")
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
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log(" Tabla products creada")
    }

    // Crear tabla de carritos
    if (!existingTables.includes("carts")) {
      console.log(" Creando tabla carts...")
      await connection.execute(`
        CREATE TABLE carts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          cart_id VARCHAR(255) UNIQUE NOT NULL,
          user_id INT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log(" Tabla carts creada")
    }

    // Crear tabla de items del carrito
    if (!existingTables.includes("cart_items")) {
      console.log(" Creando tabla cart_items...")
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log(" Tabla cart_items creada")
    }

    // Crear tabla de pedidos
    if (!existingTables.includes("orders")) {
      console.log(" Creando tabla orders...")
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
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log(" Tabla orders creada")
    }

    // Crear tabla de items de pedidos
    if (!existingTables.includes("order_items")) {
      console.log(" Creando tabla order_items...")
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log(" Tabla order_items creada")
    }

    // Crear tabla de contactos
    if (!existingTables.includes("contacts")) {
      console.log(" Creando tabla contacts...")
      await connection.execute(`
        CREATE TABLE contacts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          status ENUM('new', 'read', 'replied') DEFAULT 'new',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log(" Tabla contacts creada")
    }

    // Crear tabla de reseñas
    if (!existingTables.includes("reviews")) {
      console.log(" Creando tabla reviews...")
      await connection.execute(`
        CREATE TABLE reviews (
          id VARCHAR(255) NOT NULL,
          productId VARCHAR(255) NOT NULL,
          texto VARCHAR(255) NOT NULL,
          imagen VARCHAR(255) NULL,
          fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          aprovado BOOLEAN DEFAULT FALSE,
          rating INT NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log(" Tabla reviews creada")
    }

    // Crear tabla de sugerencias
    if (!existingTables.includes("sugerencias")) {
      console.log(" Creando tabla sugerencias...")
      await connection.execute(`
        CREATE TABLE sugerencias (
          id VARCHAR(255) PRIMARY KEY,
          texto VARCHAR(255) NOT NULL,
          imagen VARCHAR(255) NULL,
          fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log(" Tabla sugerencias creada")
    }

    // Crear índices adicionales para mejorar el rendimiento
    console.log(" Creando índices adicionales...")
    try {
      await connection.execute("CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)")
      await connection.execute("CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured)")
      await connection.execute("CREATE INDEX IF NOT EXISTS idx_products_price ON products(price)")
      await connection.execute("CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)")
      await connection.execute("CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)")
      await connection.execute("CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id)")
      await connection.execute("CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)")
      await connection.execute("CREATE INDEX IF NOT EXISTS idx_sugerencias_fecha ON sugerencias(fecha)")
      console.log(" Índices creados correctamente")
    } catch (error) {
      console.log(" Los índices ya existen o hubo un error al crearlos:", error.message)
    }

    // Verificar si ya hay productos
    const [productCount] = await connection.execute("SELECT COUNT(*) as count FROM products")

    if (productCount[0].count === 0) {
      console.log(" Insertando productos de ejemplo...")

      const products = [
        [
          "Salmón Fresco",
          "Salmón fresco del día, ideal para preparaciones crudas como sushi o ceviches. Producto de primera calidad capturado de forma sostenible.",
          8990.00,
          "/images/salmon.jpg",
          "pescados",
          50,
          true,
        ],
        [
          "Merluza Austral",
          "Merluza austral de aguas profundas, perfecta para frituras y guisos. Pescado blanco de sabor suave y textura firme.",
          5990.00,
          "/images/merluza.jpg",
          "pescados",
          40,
          true,
        ],
        [
          "Reineta",
          "Reineta fresca, pescado blanco de sabor suave ideal para hornear.",
          6490.00,
          "/images/reineta.jpg",
          "pescados",
          35,
          true,
        ],
        [
          "Camarones",
          "Camarones ecuatorianos de cultivo, perfectos para cócteles y paellas.",
          12990.00,
          "/images/camarones.jpg",
          "mariscos",
          30,
          true,
        ],
        [
          "Congrio",
          "Congrio dorado, ideal para caldillo y frituras.",
          9990.00,
          "/images/congrio.jpg",
          "pescados",
          25,
          false,
        ],
        [
          "Choritos",
          "Choritos frescos de la zona, perfectos para preparar a la marinera.",
          4990.00,
          "/images/choritos.jpg",
          "mariscos",
          60,
          false,
        ],
        [
          "Pulpo",
          "Pulpo fresco, ideal para ensaladas y preparaciones a la parrilla.",
          15990.00,
          "/images/pulpo.jpg",
          "mariscos",
          15,
          false,
        ],
        [
          "Atún",
          "Atún fresco, perfecto para tataki y preparaciones a la plancha.",
          11990.00,
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

      console.log(" Productos insertados correctamente")
    } else {
      console.log(` Ya existen ${productCount[0].count} productos en la base de datos`)
    }

    // Verificar si ya hay usuarios admin
    const [adminCount] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE role = "admin"')

    if (adminCount[0].count === 0) {
      console.log(" Creando usuario administrador...")

      const bcrypt = require("bcryptjs")
      const hashedPassword = await bcrypt.hash("admin123", 10)

      await connection.execute(
        "INSERT INTO users (name, email, password, role, email_verified) VALUES (?, ?, ?, ?, ?)",
        ["Administrador GoFish", "admin@gofish.cl", hashedPassword, "admin", true],
      )

      console.log(" Usuario administrador creado")
      console.log(" Email: admin@gofish.cl")
      console.log(" Password: admin123")
    } else {
      console.log(" Ya existe un usuario administrador")
    }

    // Resumen final
    console.log("\n ¡Base de datos configurada correctamente!")
    console.log(" Resumen:")

    const [finalProductCount] = await connection.execute("SELECT COUNT(*) as count FROM products")
    const [finalUserCount] = await connection.execute("SELECT COUNT(*) as count FROM users")
    const [finalTables] = await connection.execute("SHOW TABLES")

    console.log(`   - Productos: ${finalProductCount[0].count}`)
    console.log(`   - Usuarios: ${finalUserCount[0].count}`)
    console.log(`   - Tablas: ${finalTables.length}`)
    console.log("   - Base de datos: gofish")
    console.log("   - Host: 127.0.0.1:3306")
  } catch (error) {
    console.error(" Error al configurar la base de datos:")
    console.error("   Mensaje:", error.message)
    console.error("   Código:", error.code)

    if (error.code === "ECONNREFUSED") {
      console.error("\n Sugerencias:")
      console.error("   - Verifica que MySQL esté ejecutándose")
      console.error("   - Confirma que el puerto 3306 esté disponible")
      console.error("   - Revisa las credenciales de conexión")
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("\n Sugerencias:")
      console.error("   - Verifica el usuario y contraseña")
      console.error("   - Confirma los permisos del usuario")
    } else if (error.code === "ER_BAD_DB_ERROR") {
      console.error("\n Sugerencias:")
      console.error("   - Crea la base de datos 'gofish' manualmente")
      console.error("   - Verifica el nombre de la base de datos")
    }

    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
      console.log(" Conexión cerrada")
    }
  }
}

// Verificar si mysql2 está disponible
try {
  require("mysql2/promise")
  setupDatabase()
} catch (error) {
  console.error("Error: mysql2 no está instalado")
  console.error(" Ejecuta primero: npm install")
  process.exit(1)
}