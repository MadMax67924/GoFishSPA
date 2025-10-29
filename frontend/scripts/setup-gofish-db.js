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
      charset: "utf8mb4"
    }

    console.log(` Conectando a ${config.host}:${config.port} como ${config.user}`)

    connection = await mysql.createConnection(config)
    console.log(" Conexión exitosa a MySQL")

    // Verificar si las tablas ya existen
    console.log(" Verificando estructura de base de datos...")
    const [tables] = await connection.execute("SHOW TABLES")
    const existingTables = tables.map((row) => Object.values(row)[0])

    console.log(" Tablas existentes:", existingTables.length > 0 ? existingTables : "ninguna")

    // VERIFICAR ESTRUCTURA DE TABLA USERS
    console.log("🔍 Verificando estructura de tabla users...")
    const [userColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'users'
    `, [config.database])

    const userColumnNames = userColumns.map(col => col.COLUMN_NAME)
    console.log(" Columnas en users:", userColumnNames)

    // Si no existe la tabla users o le falta la columna id, crearla
    if (!existingTables.includes("users") || !userColumnNames.includes("id")) {
      console.log(" Creando/actualizando tabla users...")
      
      // Si la tabla existe pero no tiene la estructura correcta, hacer drop
      if (existingTables.includes("users")) {
        console.log(" Eliminando tabla users existente con estructura incorrecta...")
        await connection.execute("DROP TABLE IF EXISTS users")
      }
      
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
      console.log(" Tabla users creada/actualizada")
    } else {
      console.log("✅ Tabla users ya existe con estructura correcta")
    }

    // Crear tabla de autenticación multifactor (MFA) - SOLO si users tiene la estructura correcta
    if (!existingTables.includes("usuarios_mfa")) {
      console.log(" Creando tabla usuarios_mfa...")
      await connection.execute(`
        CREATE TABLE usuarios_mfa (
          id INT AUTO_INCREMENT PRIMARY KEY,
          id_usuario INT NOT NULL,
          secret VARCHAR(255) NOT NULL,
          activo BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (id_usuario) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log(" Tabla usuarios_mfa creada")
    } else {
      console.log("✅ Tabla usuarios_mfa ya existe")
    }

    // VERIFICAR Y AGREGAR COLUMNAS FALTANTES EN ORDERS
    console.log("🔍 Verificando columnas faltantes en tabla orders...")
    
    if (existingTables.includes("orders")) {
      const columnsToAdd = [
        { name: 'stripe_payment_intent_id', type: 'VARCHAR(255) NULL' },
        { name: 'invoice_pdf_path', type: 'VARCHAR(500) NULL' }
      ]

      for (const column of columnsToAdd) {
        const [columnExists] = await connection.execute(`
          SELECT COLUMN_NAME 
          FROM information_schema.COLUMNS 
          WHERE TABLE_SCHEMA = ? 
          AND TABLE_NAME = 'orders' 
          AND COLUMN_NAME = ?
        `, [config.database, column.name])

        if (columnExists.length === 0) {
          console.log(`📝 Agregando columna ${column.name}...`)
          await connection.execute(`
            ALTER TABLE orders 
            ADD COLUMN ${column.name} ${column.type}
          `)
          console.log(`✅ Columna ${column.name} agregada`)
        } else {
          console.log(`✅ Columna ${column.name} ya existe`)
        }
      }
    } else {
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
          stripe_payment_intent_id VARCHAR(255) NULL,
          invoice_pdf_path VARCHAR(500) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log(" Tabla orders creada")
    }

    // VERIFICAR TABLA ORDER_ITEMS
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
    } else {
      console.log("✅ Tabla order_items ya existe")
    }

    // VERIFICAR TABLA PRODUCTS
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
    } else {
      console.log("✅ Tabla products ya existe")
    }

    // VERIFICAR TABLA CARTS
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
    } else {
      console.log("✅ Tabla carts ya existe")
    }

    // VERIFICAR TABLA CART_ITEMS
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
    } else {
      console.log("✅ Tabla cart_items ya existe")
    }

    // VERIFICAR TABLA CONTACTS
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
    } else {
      console.log("✅ Tabla contacts ya existe")
    }

    // Crear índices adicionales para mejorar el rendimiento
    console.log(" Creando índices adicionales...")
    try {
      if (existingTables.includes("products")) {
        await connection.execute("CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)")
        await connection.execute("CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured)")
        await connection.execute("CREATE INDEX IF NOT EXISTS idx_products_price ON products(price)")
      }
      if (existingTables.includes("orders")) {
        await connection.execute("CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)")
        await connection.execute("CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)")
        await connection.execute("CREATE INDEX IF NOT EXISTS idx_stripe_payment_intent_id ON orders(stripe_payment_intent_id)")
        await connection.execute("CREATE INDEX IF NOT EXISTS idx_invoice_pdf_path ON orders(invoice_pdf_path)")
      }
      if (existingTables.includes("cart_items")) {
        await connection.execute("CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id)")
      }
      if (existingTables.includes("order_items")) {
        await connection.execute("CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)")
      }
      if (existingTables.includes("sugerencias")) {
        await connection.execute("CREATE INDEX IF NOT EXISTS idx_sugerencias_fecha ON sugerencias(fecha)")
      }
      console.log(" Índices creados/verificados correctamente")
    } catch (error) {
      console.log(" Los índices ya existen o hubo un error al crearlos:", error.message)
    }

    // Verificar si ya hay productos
    const [productCount] = await connection.execute("SELECT COUNT(*) as count FROM products")
    console.log(`📊 Productos existentes: ${productCount[0].count}`)

    // Verificar si ya hay usuarios admin
    const [adminCount] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE role = "admin"')
    console.log(`👤 Usuarios admin existentes: ${adminCount[0].count}`)

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
    console.log("\n🎉 ¡Base de datos configurada correctamente!")
    console.log("📋 Resumen:")

    const [finalProductCount] = await connection.execute("SELECT COUNT(*) as count FROM products")
    const [finalUserCount] = await connection.execute("SELECT COUNT(*) as count FROM users")
    const [finalTables] = await connection.execute("SHOW TABLES")

    console.log(`   - Productos: ${finalProductCount[0].count}`)
    console.log(`   - Usuarios: ${finalUserCount[0].count}`)
    console.log(`   - Tablas: ${finalTables.length}`)
    console.log("   - Base de datos: gofish")
    console.log("   - Host: 127.0.0.1:3306")

    // Verificar específicamente las columnas de orders
    console.log("\n🔍 Verificación final de columnas en orders:")
    const [orderColumns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'orders'
      ORDER BY ORDINAL_POSITION
    `, [config.database])
    
    console.log(" Columnas en orders:", orderColumns.map(col => col.COLUMN_NAME))

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
      console.log("🔒 Conexión cerrada")
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