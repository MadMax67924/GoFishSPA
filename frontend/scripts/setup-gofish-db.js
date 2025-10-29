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
      password: process.env.DB_PASSWORD || "toki1801",
      database: process.env.DB_NAME || "gofish",
      charset: "utf8mb4",
      connectTimeout: 60000,
    }

    console.log(`📍 Conectando a ${config.host}:${config.port} como ${config.user}`)
    connection = await mysql.createConnection(config)
    console.log("✅ Conexión exitosa a MySQL")

    // Verificar tablas existentes
    console.log("🔍 Verificando estructura de base de datos...")
    const [tables] = await connection.execute("SHOW TABLES")
    const existingTables = tables.map((row) => Object.values(row)[0])
    console.log("📊 Tablas existentes:", existingTables)

    // VERIFICAR ESTRUCTURA DE USERS EXISTENTE
    console.log("🔍 Verificando estructura de tabla users...")
    try {
      const [userColumns] = await connection.execute("DESCRIBE users")
      const userColumnNames = userColumns.map(col => col.Field)
      console.log("📋 Columnas de users:", userColumnNames)

      // Si users tiene users_id en lugar de id, necesitamos crear una nueva tabla
      if (userColumnNames.includes('users_id') && !userColumnNames.includes('id')) {
        console.log("🔄 La tabla users tiene estructura antigua. Creando nueva tabla users_new...")
        
        // Crear nueva tabla users_new con estructura correcta
        await connection.execute(`
          CREATE TABLE IF NOT EXISTS users_new (
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
            INDEX idx_email (email)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `)
        console.log("✅ Tabla users_new creada")

        // Migrar datos si existen
        try {
          const [oldUsers] = await connection.execute("SELECT * FROM users")
          if (oldUsers.length > 0) {
            console.log(`🔄 Migrando ${oldUsers.length} usuarios a la nueva estructura...`)
            for (const user of oldUsers) {
              await connection.execute(
                "INSERT INTO users_new (name, email, password, role) VALUES (?, ?, ?, ?)",
                [
                  `${user.name || ''} ${user.surname || ''}`.trim() || 'Usuario',
                  user.email || '',
                  user.PASSWORD || '',
                  'user'
                ]
              )
            }
            console.log("✅ Usuarios migrados correctamente")
          }
        } catch (migrateError) {
          console.log("ℹ️ No se pudieron migrar usuarios:", migrateError.message)
        }
      }
    } catch (error) {
      console.log("ℹ️ Error al verificar users:", error.message)
    }

    // CREAR TABLAS NECESARIAS

    // Tabla products si no existe
    if (!existingTables.includes("products")) {
      console.log("🆕 Creando tabla products...")
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
      console.log("✅ Tabla products creada")
    }

    // Tabla carts
    if (!existingTables.includes("carts")) {
      console.log("🆕 Creando tabla carts...")
      await connection.execute(`
        CREATE TABLE carts (
          id INT AUTO_INCREMENT PRIMARY KEY,
          cart_id VARCHAR(255) UNIQUE NOT NULL,
          user_id INT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log("✅ Tabla carts creada")
    }

    // Tabla cart_items
    if (!existingTables.includes("cart_items")) {
      console.log("🆕 Creando tabla cart_items...")
      await connection.execute(`
        CREATE TABLE cart_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          cart_id INT NOT NULL,
          product_id INT NOT NULL,
          quantity INT NOT NULL DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY unique_cart_product (cart_id, product_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log("✅ Tabla cart_items creada")
    }

    // Tabla orders (ACTUALIZADA con las columnas que necesitas)
    if (!existingTables.includes("orders")) {
      console.log("🆕 Creando tabla orders...")
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
<<<<<<< Updated upstream
          stripe_payment_intent_id VARCHAR(255) NULL,
=======
          -- NUEVAS COLUMNAS PARA DOCUMENTOS
          document_type ENUM('boleta', 'factura') DEFAULT 'boleta',
          rut VARCHAR(20) NULL,
          business_name VARCHAR(255) NULL,
          document_generated BOOLEAN DEFAULT FALSE,
          document_url VARCHAR(500) NULL,
>>>>>>> Stashed changes
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log("✅ Tabla orders creada con todas las columnas necesarias")
    } else {
      console.log("📋 Tabla orders ya existe, verificando columnas...")
      
      // Agregar columnas faltantes a orders si es necesario
      const orderColumnsToAdd = [
        {name: 'document_type', sql: "ADD COLUMN document_type ENUM('boleta', 'factura') DEFAULT 'boleta'"},
        {name: 'rut', sql: "ADD COLUMN rut VARCHAR(20) NULL"},
        {name: 'business_name', sql: "ADD COLUMN business_name VARCHAR(255) NULL"},
        {name: 'document_generated', sql: "ADD COLUMN document_generated BOOLEAN DEFAULT FALSE"},
        {name: 'document_url', sql: "ADD COLUMN document_url VARCHAR(500) NULL"}
      ]

      for (const column of orderColumnsToAdd) {
        try {
          await connection.execute(`ALTER TABLE orders ${column.sql}`)
          console.log(`✅ Columna ${column.name} agregada a orders`)
        } catch (error) {
          if (error.code === 'ER_DUP_FIELDNAME') {
            console.log(`ℹ️ Columna ${column.name} ya existe en orders`)
          } else {
            console.log(`ℹ️ No se pudo agregar ${column.name}: ${error.message}`)
          }
        }
      }
    }

    // Tabla order_items
    if (!existingTables.includes("order_items")) {
      console.log("🆕 Creando tabla order_items...")
      await connection.execute(`
        CREATE TABLE order_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id INT NOT NULL,
          product_id INT NOT NULL,
          product_name VARCHAR(255) NOT NULL,
          product_price DECIMAL(10, 2) NOT NULL,
          quantity INT NOT NULL,
          subtotal DECIMAL(10, 2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log("✅ Tabla order_items creada")
    }

    // Tabla contacts
    if (!existingTables.includes("contacts")) {
      console.log("🆕 Creando tabla contacts...")
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

    // Tabla document_logs
    if (!existingTables.includes("document_logs")) {
      console.log("🆕 Creando tabla document_logs...")
      await connection.execute(`
        CREATE TABLE document_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id INT NOT NULL,
          document_type ENUM('boleta', 'factura') NOT NULL,
          document_number VARCHAR(100) NOT NULL,
          download_url VARCHAR(500) NULL,
          sent_via_email BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `)
      console.log("✅ Tabla document_logs creada")
    }

    // AGREGAR FOREIGN KEYS (opcional, para mejor integridad)
    console.log("🔗 Agregando foreign keys...")
    
    const foreignKeys = [
      {table: 'cart_items', constraint: 'fk_cart_items_product_id', sql: 'ADD CONSTRAINT fk_cart_items_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE'},
      {table: 'order_items', constraint: 'fk_order_items_product_id', sql: 'ADD CONSTRAINT fk_order_items_product_id FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT'},
      {table: 'order_items', constraint: 'fk_order_items_order_id', sql: 'ADD CONSTRAINT fk_order_items_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE'},
      {table: 'document_logs', constraint: 'fk_document_logs_order_id', sql: 'ADD CONSTRAINT fk_document_logs_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE'},
      {table: 'cart_items', constraint: 'fk_cart_items_cart_id', sql: 'ADD CONSTRAINT fk_cart_items_cart_id FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE'}
    ]

    for (const fk of foreignKeys) {
      try {
        await connection.execute(`ALTER TABLE ${fk.table} ${fk.sql}`)
        console.log(`✅ Foreign key ${fk.constraint} agregada`)
      } catch (error) {
        console.log(`ℹ️ No se pudo agregar ${fk.constraint}: ${error.message}`)
      }
    }

<<<<<<< Updated upstream
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
      await connection.execute("CREATE INDEX IF NOT EXISTS idx_stripe_payment_intent_id ON orders(stripe_payment_intent_id)")
      console.log(" Índices creados correctamente")
    } catch (error) {
      console.log(" Los índices ya existen o hubo un error al crearlos:", error.message)
    }

    // Verificar si ya hay productos
=======
    // INSERTAR DATOS DE EJEMPLO
    console.log("📦 Verificando datos de ejemplo...")
    
>>>>>>> Stashed changes
    const [productCount] = await connection.execute("SELECT COUNT(*) as count FROM products")
    if (productCount[0].count === 0) {
      console.log("📦 Insertando productos de ejemplo...")
      
      const products = [
<<<<<<< Updated upstream
        [
          "Salmón Fresco",
          "Salmón fresco del día, ideal para preparaciones crudas como sushi o ceviches. Producto de primera calidad capturado de forma sostenible.",
          8990.00,
          "/images/salmon.jpg",
          "pescados",
          0,
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
=======
        ["Salmón Fresco", "Salmón fresco del día, ideal para preparaciones crudas como sushi o ceviches.", 8990.00, "/images/salmon.jpg", "pescados", 50, true],
        ["Merluza Austral", "Merluza austral de aguas profundas, perfecta para frituras y guisos.", 5990.00, "/images/merluza.jpg", "pescados", 40, true],
        ["Reineta", "Reineta fresca, pescado blanco de sabor suave ideal para hornear.", 6490.00, "/images/reineta.jpg", "pescados", 35, true],
        ["Camarones", "Camarones ecuatorianos de cultivo, perfectos para cócteles y paellas.", 12990.00, "/images/camarones.jpg", "mariscos", 30, true],
        ["Congrio", "Congrio dorado, ideal para caldillo y frituras.", 9990.00, "/images/congrio.jpg", "pescados", 25, false],
        ["Choritos", "Choritos frescos de la zona, perfectos para preparar a la marinera.", 4990.00, "/images/choritos.jpg", "mariscos", 60, false],
        ["Pulpo", "Pulpo fresco, ideal para ensaladas y preparaciones a la parrilla.", 15990.00, "/images/pulpo.jpg", "mariscos", 15, false],
        ["Atún", "Atún fresco, perfecto para tataki y preparaciones a la plancha.", 11990.00, "/images/atun.jpg", "pescados", 20, false],
>>>>>>> Stashed changes
      ]

      for (const product of products) {
        await connection.execute(
          "INSERT INTO products (name, description, price, image, category, stock, featured) VALUES (?, ?, ?, ?, ?, ?, ?)",
          product,
        )
      }
      console.log("✅ Productos insertados correctamente")
    } else {
      console.log(`ℹ️ Ya existen ${productCount[0].count} productos`)
    }

    // CREAR USUARIO ADMIN (usando la nueva tabla si existe)
    console.log("👤 Verificando usuario administrador...")
    try {
      // Intentar usar users_new si existe, sino users
      const [adminCount] = await connection.execute('SELECT COUNT(*) as count FROM users_new WHERE role = "admin"')
      if (adminCount[0].count === 0) {
        console.log("👤 Creando usuario administrador...")
        const bcrypt = require("bcryptjs")
        const hashedPassword = await bcrypt.hash("admin123", 10)

        await connection.execute(
          "INSERT INTO users_new (name, email, password, role, email_verified) VALUES (?, ?, ?, ?, ?)",
          ["Administrador GoFish", "admin@gofish.cl", hashedPassword, "admin", true],
        )
        console.log("✅ Usuario administrador creado")
        console.log("📧 Email: admin@gofish.cl")
        console.log("🔑 Password: admin123")
      } else {
        console.log("ℹ️ Ya existe un usuario administrador")
      }
    } catch (error) {
      console.log("ℹ️ No se pudo crear usuario admin:", error.message)
    }

    // RESUMEN FINAL
    console.log("\n🎉 ¡Base de datos configurada correctamente!")
    console.log("📊 Resumen de tablas creadas:")
    
    const tableList = [
      'products', 'carts', 'cart_items', 'orders', 
      'order_items', 'contacts', 'document_logs', 'users_new'
    ]
    
    for (const table of tableList) {
      try {
        const [result] = await connection.execute(`SELECT COUNT(*) as count FROM ${table}`)
        console.log(`   - ${table}: ${result[0].count} registros`)
      } catch (error) {
        console.log(`   - ${table}: no existe o error`)
      }
    }

    console.log("\n💡 **INFORMACIÓN IMPORTANTE:**")
    console.log("   - Se creó 'users_new' con la estructura correcta")
    console.log("   - Las tablas 'orders' tienen las columnas document_type, rut, business_name")
    console.log("   - El sistema de pagos ahora debería funcionar correctamente")
    console.log("   - Si necesitas migrar usuarios antiguos, revisa la tabla 'users_new'")

  } catch (error) {
    console.error("❌ Error al configurar la base de datos:", error.message)
  } finally {
    if (connection) {
      await connection.end()
      console.log("🔌 Conexión cerrada")
    }
  }
}

// Ejecutar
try {
  require("mysql2/promise")
  setupDatabase()
} catch (error) {
  console.error("❌ Error: mysql2 no está instalado")
  process.exit(1)
}