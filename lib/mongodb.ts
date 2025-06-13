import { MongoClient, ServerApiVersion, type Db } from "mongodb"

// Provide fallback values for development
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const MONGODB_DB = process.env.MONGODB_DB || "gofish"

if (!MONGODB_URI) {
  throw new Error("Por favor, define la variable de entorno MONGODB_URI")
}

if (!MONGODB_DB) {
  throw new Error("Por favor, define la variable de entorno MONGODB_DB")
}

const uri = MONGODB_URI
const dbName = MONGODB_DB

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

// Exportar el cliente directamente por si se necesita
export { client, clientPromise }

// Exportar también la base de datos
export const getDatabase = async (): Promise<Db> => {
  const mongoClient = await clientPromise
  return mongoClient.db(dbName)
}

export default clientPromise
