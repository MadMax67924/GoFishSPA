// Script simplificado para crear solo las tablas básicas

import mysql from "mysql2/promise"

async function createBasicTables() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "toki1801", 
    database: "gofish",
  })

  try {
    console.log("Creando tabla users...")
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log("Creando tabla products...")
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        image VARCHAR(500),
        category VARCHAR(50) NOT NULL,
        stock INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log("Insertando productos básicos...")
    await connection.execute(`
      INSERT IGNORE INTO products (id, name, price, image, category, stock) VALUES
      (1, 'Salmón Fresco', 8990.00, '/images/salmon.jpg', 'pescados', 50),
      (2, 'Merluza Austral', 5990.00, '/images/merluza.jpg', 'pescados', 40),
      (3, 'Reineta', 6490.00, '/images/reineta.jpg', 'pescados', 35),
      (4, 'Camarones', 12990.00, '/images/camarones.jpg', 'mariscos', 30)
    `)

    console.log(" Tablas básicas creadas exitosamente")
  } catch (error) {
    console.error("Error:", error)
  } finally {
    await connection.end()
  }
}

createBasicTables()
