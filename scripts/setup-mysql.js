const mysql = require("mysql2/promise")

async function setupDatabase() {
  let connection

  try {
    console.log("🔄 Conectando a MySQL...")

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "toki1801",
      database: process.env.DB_NAME || "gofish_db",
    })

    console.log(" Conexión exitosa a MySQL")
    // Verificar si las tablas ya existen
    const [tables] = await connection.execute(
      "SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = ? AND TABLE_NAME IN ('products', 'users', 'orders', 'order_items')",
      [process.env.DB_NAME || "gofish_db"],
    )

    const existingTables = tables.map((row) => row.TABLE_NAME)
    console.log(" Tablas existentes:", existingTables)

    // Crear tabla de productos si no existe
    if (!existingTables.includes("products")) {
      console.log(" Creando tabla products...")
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
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `)
      console.log(" Tabla products creada")
    }

    // Crear tabla de usuarios si no existe
    if (!existingTables.includes("users")) {
      console.log(" Creando tabla users...")
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
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `)
      console.log(" Tabla users creada")
    }

    // Crear tabla de órdenes si no existe
    if (!existingTables.includes("orders")) {
      console.log(" Creando tabla orders...")
      await connection.execute(`
        CREATE TABLE orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT,
          total DECIMAL(10,2) NOT NULL,
          status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
          shipping_address TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
        )
      `)
      console.log(" Tabla orders creada")
    }

    // Crear tabla de items de órdenes si no existe
    if (!existingTables.includes("order_items")) {
      console.log(" Creando tabla order_items...")
      await connection.execute(`
        CREATE TABLE order_items (
          id INT AUTO_INCREMENT PRIMARY KEY,
          order_id INT NOT NULL,
          product_id INT NOT NULL,
          quantity INT NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
        )
      `)
      console.log(" Tabla order_items creada")
    }

    // Verificar si ya hay productos
    const [productCount] = await connection.execute("SELECT COUNT(*) as count FROM products")

    if (productCount[0].count === 0) {
      console.log(" Insertando productos de ejemplo...")

      const products = [
        {
          name: "Salmón Fresco",
          description:
            "Salmón fresco del día, ideal para preparaciones crudas como sushi o ceviches. Producto de primera calidad.",
          price: 8990,
          image: "/placeholder.svg?height=300&width=400",
          category: "pescados",
          stock: 50,
          featured: true,
        },
        {
          name: "Atún Rojo",
          description:
            "Atún rojo de primera calidad, perfecto para sashimi y preparaciones gourmet. Capturado de forma sostenible.",
          price: 12990,
          image: "/placeholder.svg?height=300&width=400",
          category: "pescados",
          stock: 25,
          featured: true,
        },
        {
          name: "Merluza Austral",
          description:
            "Merluza austral de aguas profundas, perfecta para frituras y guisos. Pescado blanco de sabor suave.",
          price: 5990,
          image: "/placeholder.svg?height=300&width=400",
          category: "pescados",
          stock: 40,
          featured: false,
        },
        {
          name: "Camarones Ecuatorianos",
          description: "Camarones ecuatorianos de cultivo, perfectos para cócteles y paellas. Tamaño jumbo.",
          price: 15990,
          image: "/placeholder.svg?height=300&width=400",
          category: "mariscos",
          stock: 30,
          featured: true,
        },
        {
          name: "Pulpo Español",
          description: "Pulpo español cocido, listo para ensaladas y tapas. Textura tierna y sabor intenso.",
          price: 18990,
          image: "/placeholder.svg?height=300&width=400",
          category: "mariscos",
          stock: 15,
          featured: false,
        },
        {
          name: "Reineta",
          description: "Reineta fresca, pescado blanco de sabor suave ideal para hornear. Producto nacional.",
          price: 6490,
          image: "/placeholder.svg?height=300&width=400",
          category: "pescados",
          stock: 35,
          featured: false,
        },
        {
          name: "Langostinos",
          description: "Langostinos frescos de gran tamaño, perfectos para parrilla y preparaciones especiales.",
          price: 22990,
          image: "/placeholder.svg?height=300&width=400",
          category: "mariscos",
          stock: 20,
          featured: true,
        },
        {
          name: "Corvina",
          description: "Corvina fresca, pescado de carne firme y sabor delicado. Ideal para ceviches y frituras.",
          price: 7990,
          image: "/placeholder.svg?height=300&width=400",
          category: "pescados",
          stock: 45,
          featured: false,
        },
      ]

      for (const product of products) {
        await connection.execute(
          "INSERT INTO products (name, description, price, image, category, stock, featured) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [
            product.name,
            product.description,
            product.price,
            product.image,
            product.category,
            product.stock,
            product.featured,
          ],
        )
      }

      console.log(" Productos insertados correctamente")
    } else {
      console.log(" Ya existen productos en la base de datos")
    }

    // Verificar si ya hay usuarios admin
    const [adminCount] = await connection.execute('SELECT COUNT(*) as count FROM users WHERE role = "admin"')

    if (adminCount[0].count === 0) {
      console.log(" Creando usuario administrador...")

      // Hash simple para desarrollo (en producción usar bcrypt)
      const bcrypt = require("bcryptjs")
      const hashedPassword = await bcrypt.hash("admin123", 10)

      await connection.execute(
        "INSERT INTO users (email, password, name, role, email_verified) VALUES (?, ?, ?, ?, ?)",
        ["admin@gofish.com", hashedPassword, "Administrador", "admin", true],
      )

      console.log(" Usuario administrador creado")
      console.log(" Email: admin@gofish.com")
      console.log(" Password: admin123")
    } else {
      console.log("Ya existe un usuario administrador")
    }

    console.log("\n ¡Base de datos configurada correctamente!")
    console.log(" Resumen:")

    const [finalProductCount] = await connection.execute("SELECT COUNT(*) as count FROM products")
    const [finalUserCount] = await connection.execute("SELECT COUNT(*) as count FROM users")

    console.log(`   - Productos: ${finalProductCount[0].count}`)
    console.log(`   - Usuarios: ${finalUserCount[0].count}`)
    console.log("   - Tablas: products, users, orders, order_items")
  } catch (error) {
    console.error(" Error al configurar la base de datos:", error)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
      console.log("🔌 Conexión cerrada")
    }
  }
}

setupDatabase()
