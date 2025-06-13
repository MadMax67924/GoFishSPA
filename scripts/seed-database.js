// Este script inicializa la base de datos MongoDB con datos de ejemplo

import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

// Normalmente, esta variable vendría de las variables de entorno
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/gofish"

async function seedDatabase() {
  console.log("Iniciando la carga de datos de ejemplo...")

  let client

  try {
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    console.log("Conectado a MongoDB")

    const db = client.db()

    // Crear colecciones si no existen
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    if (!collectionNames.includes("products")) {
      await db.createCollection("products")
    }

    if (!collectionNames.includes("users")) {
      await db.createCollection("users")
    }

    if (!collectionNames.includes("carts")) {
      await db.createCollection("carts")
    }

    if (!collectionNames.includes("contacts")) {
      await db.createCollection("contacts")
    }

    // Limpiar datos existentes
    await db.collection("products").deleteMany({})

    // Insertar productos de ejemplo
    const products = [
      {
        name: "Salmón Fresco",
        price: 8990,
        image: "/images/salmon.jpg",
        description: "Salmón fresco del día, ideal para preparaciones crudas como sushi o ceviches.",
        stock: 50,
        category: "pescados",
        featured: true,
      },
      {
        name: "Merluza Austral",
        price: 5990,
        image: "/images/merluza.jpg",
        description: "Merluza austral de aguas profundas, perfecta para frituras y guisos.",
        stock: 40,
        category: "pescados",
        featured: true,
      },
      {
        name: "Reineta",
        price: 6490,
        image: "/images/reineta.jpg",
        description: "Reineta fresca, pescado blanco de sabor suave ideal para hornear.",
        stock: 35,
        category: "pescados",
        featured: true,
      },
      {
        name: "Camarones",
        price: 12990,
        image: "/images/camarones.jpg",
        description: "Camarones ecuatorianos de cultivo, perfectos para cócteles y paellas.",
        stock: 30,
        category: "mariscos",
        featured: true,
      },
      {
        name: "Congrio",
        price: 9990,
        image: "/images/congrio.jpg",
        description: "Congrio dorado, ideal para caldillo y frituras.",
        stock: 25,
        category: "pescados",
        featured: false,
      },
      {
        name: "Choritos",
        price: 4990,
        image: "/images/choritos.jpg",
        description: "Choritos frescos de la zona, perfectos para preparar a la marinera.",
        stock: 60,
        category: "mariscos",
        featured: false,
      },
      {
        name: "Pulpo",
        price: 15990,
        image: "/images/pulpo.jpg",
        description: "Pulpo fresco, ideal para ensaladas y preparaciones a la parrilla.",
        stock: 15,
        category: "mariscos",
        featured: false,
      },
      {
        name: "Atún",
        price: 11990,
        image: "/images/atun.jpg",
        description: "Atún fresco, perfecto para tataki y preparaciones a la plancha.",
        stock: 20,
        category: "pescados",
        featured: false,
      },
    ]

    await db.collection("products").insertMany(products)
    console.log(`${products.length} productos insertados`)

    // Crear usuario de ejemplo si no existe
    const existingUser = await db.collection("users").findOne({ email: "admin@gofish.cl" })

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash("admin123", 10)

      await db.collection("users").insertOne({
        name: "Administrador GoFish",
        email: "admin@gofish.cl",
        password: hashedPassword,
        role: "admin",
        createdAt: new Date(),
      })

      console.log("Usuario administrador creado")
    }

    console.log("Base de datos inicializada correctamente")
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error)
  } finally {
    if (client) {
      await client.close()
      console.log("Conexión cerrada")
    }
  }
}

// Ejecutar el script
seedDatabase()
