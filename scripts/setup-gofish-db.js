const mysql = require("mysql2/promise")

async function setupGofishDatabase() {
  let connection

  try {
    console.log("🐟 Configurando base de datos GoFish...")
    console.log("📍 Conectando a: 127.0.0.1:3306")
    console.log("👤 Usuario: root")
    console.log("🗄️ Base de datos: gofish")

    // Conectar a MySQL
    connection = await mysql.createConnection({
      host: "127.0.0.1",
      port: 3306,
      user: "root",
      password: process.env.DB_PASSWORD || "",
      database: "gofish",
    })

    console.log("✅ Conexión exitosa a MySQL")

    // Verificar si las tablas ya existen
    console.log("🔍 Verificando estructura de base de datos...")
    const [tables] = await connection.execute("SHOW TABLES")
    const existingTables = tables.map((row) => Object.values(row)[0])

    console.log("📋 Tablas existentes:", existingTables)

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
          category ENUM('pescados', 'mariscos') NOT NULL,
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
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role ENUM('user', 'admin') DEFAULT 'user',
          email_verified BOOLEAN DEFAULT FALSE,
          verification_token VARCHAR(64) NULL,
          verification_token_expires DATETIME NULL,
          password_reset_token VARCHAR(64) NULL,
          password_reset_expires DATETIME NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_email (email),
          INDEX idx_verification_token (verification_token)
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
          cart_id VARCHAR(255) UNIQUE NOT NULL,
          user_id INT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          INDEX idx_cart_id (cart_id),
          INDEX idx_user_id (user_id)
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
          INDEX idx_order_number (order_number),
          INDEX idx_status (status),
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
          product_price DECIMAL(10, 2) NOT NULL,
          quantity INT NOT NULL,
          subtotal DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log("✅ Tabla order_items creada")
    }

    // Crear tabla de contactos si no existe
    if (!existingTables.includes("contacts")) {
      console.log("🔄 Creando tabla contacts...")
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
      console.log("✅ Tabla contacts creada")
    }

    // Verificar si ya hay productos
    const [productCount] = await connection.execute("SELECT COUNT(*) as count FROM products")

    if (productCount[0].count === 0) {
      console.log("🐟 Insertando productos de GoFish...")

      const products = [
        [
          "Salmón Fresco",
          "Salmón fresco del día, ideal para preparaciones crudas como sushi o ceviches.",
          8990.0,
          "/placeholder.svg?height=300&width=400",
          "pescados",
          50,
          true,
        ],
        [
          "Atún Rojo",
          "Atún rojo de primera calidad, perfecto para sashimi y preparaciones gourmet.",
          12990.0,
          "/placeholder.svg?height=300&width=400",
          "pescados",
          25,
          true,
        ],
        [
          "Merluza Austral",
          "Merluza austral de aguas profundas, perfecta para frituras y guisos.",
          5990.0,
          "/placeholder.svg?height=300&width=400",
          "pescados",
          40,
          false,
        ],
        [
          "Camarones Ecuatorianos",
          "Camarones ecuatorianos de cultivo, perfectos para cócteles y paellas.",
          15990.0,
          "/placeholder.svg?height=300&width=400",
          "mariscos",
          30,
          true,
        ],
        [
          "Pulpo Español",
          "Pulpo español cocido, listo para ensaladas y tapas.",
          18990.0,
          "/placeholder.svg?height=300&width=400",
          "mariscos",
          15,
          false,
        ],
        [
          "Reineta",
          "Reineta fresca, pescado blanco de sabor suave ideal para hornear.",
          6490.0,
          "/placeholder.svg?height=300&width=400",
          "pescados",
          35,
          false,
        ],
        [
          "Langostinos",
          "Langostinos frescos de gran tamaño, perfectos para parrilla.",
          22990.0,
          "/placeholder.svg?height=300&width=400",
          "mariscos",
          20,
          true,
        ],
        [
          "Corvina",
          "Corvina fresca, pescado de carne firme y sabor delicado.",
          7990.0,
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
    }

    // Verificar si ya hay usuario admin
    const [adminCount] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE role = "admin"')

    if (adminCount[0].count === 0) {
      console.log("👤 Creando usuario administrador...")

      // Hash de la contraseña (en producción usar bcrypt)
      const hashedPassword = "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi" // admin123

      await connection.execute(
        "INSERT INTO users (name, email, password, role, email_verified) VALUES (?, ?, ?, ?, ?)",
        ["Administrador GoFish", "admin@gofish.cl", hashedPassword, "admin", true],
      )

      console.log("✅ Usuario administrador creado")
      console.log("📧 Email: admin@gofish.cl")
      console.log("🔑 Contraseña: admin123")
    }

    // Mostrar resumen final
    console.log("\n🎉 ¡Base de datos GoFish configurada correctamente!")
    console.log("📊 Resumen de la configuración:")

    const [finalProductCount] = await connection.execute("SELECT COUNT(*) as count FROM products")
    const [finalUserCount] = await connection.execute("SELECT COUNT(*) as count FROM users")
    const [finalTables] = await connection.execute("SHOW TABLES")

    console.log(`   🐟 Productos: ${finalProductCount[0].count}`)
    console.log(`   👥 Usuarios: ${finalUserCount[0].count}`)
    console.log(`   📋 Tablas: ${finalTables.length}`)
    console.log("   🔗 Conexión: 127.0.0.1:3306")
    console.log("   🗄️ Base de datos: gofish")
  } catch (error) {
    console.error("❌ Error al configurar la base de datos GoFish:", error.message)
    console.error("\n🔧 Posibles soluciones:")
    console.error("   1. Verifica que MySQL esté ejecutándose")
    console.error("   2. Confirma que la base de datos 'gofish' exista")
    console.error("   3. Verifica las credenciales de acceso")
    console.error("   4. Asegúrate de tener permisos de escritura")
    throw error
  } finally {
    if (connection) {
      await connection.end()
      console.log("🔌 Conexión cerrada")
    }
  }
}

// Ejecutar la configuración
setupGofishDatabase()
