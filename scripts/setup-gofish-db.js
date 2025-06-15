const mysql = require("mysql2/promise")

async function setupDatabase() {
  let connection

  try {
    console.log("🔄 Conectando a MySQL...")

    // Configuración de conexión
    const config = {
      host: process.env.DB_HOST || "127.0.0.1",
      port: Number.parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "gofish",
      charset: "utf8mb4",
      acquireTimeout: 60000,
      timeout: 60000,
    }

    console.log(`📡 Conectando a ${config.host}:${config.port} como ${config.user}`)

    connection = await mysql.createConnection(config)
    console.log("✅ Conexión exitosa a MySQL")

    // Verificar si las tablas ya existen
    console.log("🔍 Verificando estructura de base de datos...")
    const [tables] = await connection.execute("SHOW TABLES")
    const existingTables = tables.map((row) => Object.values(row)[0])

    console.log("📋 Tablas existentes:", existingTables.length > 0 ? existingTables : "ninguna")

    // Crear tabla de productos si no existe
    if (!existingTables.includes("products")) {
      console.log("🔄 Creando tabla products...")
      await connection.execute(`
        CREATE TABLE products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          price DECIMAL(10,2) NOT NULL,
          image VARCHAR(500),
          category VARCHAR(100) NOT NULL,
          stock INT DEFAULT 0,
          featured BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_category (category),
          INDEX idx_featured (featured),
          INDEX idx_name (name)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log("✅ Tabla products creada")
    }

    // Crear tabla de usuarios si no existe
    if (!existingTables.includes("users")) {
      console.log("🔄 Creando tabla users...")
      await connection.execute(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          role ENUM('admin', 'customer') DEFAULT 'customer',
          email_verified BOOLEAN DEFAULT FALSE,
          verification_token VARCHAR(255),
          reset_token VARCHAR(255),
          reset_token_expires DATETIME,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_role (role)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log("✅ Tabla users creada")
    }

    // Crear tabla de carritos si no existe
    if (!existingTables.includes("carts")) {
      console.log("🔄 Creando tabla carts...")
      await connection.execute(`
        CREATE TABLE carts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          session_id VARCHAR(255) NOT NULL,
          user_id INT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_session (session_id),
          INDEX idx_user (user_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log("✅ Tabla carts creada")
    }

    // Crear tabla de items del carrito si no existe
    if (!existingTables.includes("cart_items")) {
      console.log("🔄 Creando tabla cart_items...")
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
      console.log("✅ Tabla cart_items creada")
    }

    // Crear tabla de órdenes si no existe
    if (!existingTables.includes("orders")) {
      console.log("🔄 Creando tabla orders...")
      await connection.execute(`
        CREATE TABLE orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_number VARCHAR(50) UNIQUE NOT NULL,
          user_id INT NULL,
          customer_name VARCHAR(255) NOT NULL,
          customer_email VARCHAR(255) NOT NULL,
          customer_phone VARCHAR(50),
          shipping_address TEXT,
          total DECIMAL(10,2) NOT NULL,
          status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
          payment_method VARCHAR(50),
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
          INDEX idx_status (status),
          INDEX idx_order_number (order_number),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log("✅ Tabla orders creada")
    }

    // Crear tabla de items de órdenes si no existe
    if (!existingTables.includes("order_items")) {
      console.log("🔄 Creando tabla order_items...")
      await connection.execute(`
        CREATE TABLE order_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id INT NOT NULL,
          product_id INT NOT NULL,
          product_name VARCHAR(255) NOT NULL,
          product_price DECIMAL(10,2) NOT NULL,
          quantity INT NOT NULL,
          subtotal DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log("✅ Tabla order_items creada")
    }

    // Verificar si ya hay productos
    const [productCount] = await connection.execute("SELECT COUNT(*) as count FROM products")

    if (productCount[0].count === 0) {
      console.log("🔄 Insertando productos de ejemplo...")

      const products = [
        [
          "Salmón Fresco",
          "Salmón fresco del día, ideal para preparaciones crudas como sushi o ceviches. Producto de primera calidad capturado de forma sostenible.",
          8990,
          "/placeholder.svg?height=300&width=400",
          "pescados",
          50,
          true,
        ],
        [
          "Atún Rojo",
          "Atún rojo de primera calidad, perfecto para sashimi y preparaciones gourmet. Capturado de forma sostenible en aguas del Pacífico.",
          12990,
          "/placeholder.svg?height=300&width=400",
          "pescados",
          25,
          true,
        ],
        [
          "Merluza Austral",
          "Merluza austral de aguas profundas, perfecta para frituras y guisos. Pescado blanco de sabor suave y textura firme.",
          5990,
          "/placeholder.svg?height=300&width=400",
          "pescados",
          40,
          false,
        ],
        [
          "Camarones Ecuatorianos",
          "Camarones ecuatorianos de cultivo, perfectos para cócteles y paellas. Tamaño jumbo, frescos y de excelente calidad.",
          15990,
          "/placeholder.svg?height=300&width=400",
          "mariscos",
          30,
          true,
        ],
        [
          "Pulpo Español",
          "Pulpo español cocido, listo para ensaladas y tapas. Textura tierna y sabor intenso del Mediterráneo.",
          18990,
          "/placeholder.svg?height=300&width=400",
          "mariscos",
          15,
          false,
        ],
        [
          "Reineta Nacional",
          "Reineta fresca nacional, pescado blanco de sabor suave ideal para hornear. Producto local de excelente calidad.",
          6490,
          "/placeholder.svg?height=300&width=400",
          "pescados",
          35,
          false,
        ],
        [
          "Langostinos Jumbo",
          "Langostinos frescos de gran tamaño, perfectos para parrilla y preparaciones especiales. Sabor dulce y textura firme.",
          22990,
          "/placeholder.svg?height=300&width=400",
          "mariscos",
          20,
          true,
        ],
        [
          "Corvina Dorada",
          "Corvina fresca, pescado de carne firme y sabor delicado. Ideal para ceviches, frituras y preparaciones al horno.",
          7990,
          "/placeholder.svg?height=300&width=400",
          "pescados",
          45,
          false,
        ],
      ]

      for (const product of products) {
        await connection.execute(
          "INSERT INTO products (name, description, price, image, category, stock, featured) VALUES (?, ?, ?, ?, ?, ?, ?)",
          product,
        )
      }

      console.log("✅ Productos insertados correctamente")
    } else {
      console.log(`ℹ️ Ya existen ${productCount[0].count} productos en la base de datos`)
    }

    // Verificar si ya hay usuarios admin
    const [adminCount] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE role = "admin"')

    if (adminCount[0].count === 0) {
      console.log("🔄 Creando usuario administrador...")

      const bcrypt = require("bcryptjs")
      const hashedPassword = await bcrypt.hash("admin123", 10)

      await connection.execute(
        "INSERT INTO users (email, password, name, role, email_verified) VALUES (?, ?, ?, ?, ?)",
        ["admin@gofish.cl", hashedPassword, "Administrador GoFish", "admin", true],
      )

      console.log("✅ Usuario administrador creado")
      console.log("📧 Email: admin@gofish.cl")
      console.log("🔑 Password: admin123")
    } else {
      console.log("ℹ️ Ya existe un usuario administrador")
    }

    // Resumen final
    console.log("\n🎉 ¡Base de datos configurada correctamente!")
    console.log("📊 Resumen:")

    const [finalProductCount] = await connection.execute("SELECT COUNT(*) as count FROM products")
    const [finalUserCount] = await connection.execute("SELECT COUNT(*) as count FROM users")
    const [finalTables] = await connection.execute("SHOW TABLES")

    console.log(`   - Productos: ${finalProductCount[0].count}`)
    console.log(`   - Usuarios: ${finalUserCount[0].count}`)
    console.log(`   - Tablas: ${finalTables.length}`)
    console.log("   - Base de datos: gofish")
    console.log("   - Host: 127.0.0.1:3306")
  } catch (error) {
    console.error("❌ Error al configurar la base de datos:")
    console.error("   Mensaje:", error.message)
    console.error("   Código:", error.code)

    if (error.code === "ECONNREFUSED") {
      console.error("\n💡 Sugerencias:")
      console.error("   - Verifica que MySQL esté ejecutándose")
      console.error("   - Confirma que el puerto 3306 esté disponible")
      console.error("   - Revisa las credenciales de conexión")
    } else if (error.code === "ER_ACCESS_DENIED_ERROR") {
      console.error("\n💡 Sugerencias:")
      console.error("   - Verifica el usuario y contraseña")
      console.error("   - Confirma los permisos del usuario")
    } else if (error.code === "ER_BAD_DB_ERROR") {
      console.error("\n💡 Sugerencias:")
      console.error("   - Crea la base de datos 'gofish' manualmente")
      console.error("   - Verifica el nombre de la base de datos")
    }

    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
      console.log("🔌 Conexión cerrada")
    }
  }
}

// Verificar si mysql2 está disponible
try {
  require("mysql2/promise")
  setupDatabase()
} catch (error) {
  console.error("❌ Error: mysql2 no está instalado")
  console.error("💡 Ejecuta primero: npm install")
  process.exit(1)
}
