import mysql from "mysql2/promise"

// Configuración más robusta para la conexión
const config = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "gofish",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
}

// Crear pool de conexiones
const pool = mysql.createPool(config)

// Función helper para ejecutar consultas con mejor manejo de errores
export async function executeQuery(query: string, params: any[] = []) {
  let connection
  try {
    connection = await pool.getConnection()
    const [results] = await connection.execute(query, params)
    return results
  } catch (error) {
    console.error("Error ejecutando consulta:", error)
    console.error("Query:", query)
    console.error("Params:", params)
    throw error
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

// Función para verificar la conexión
export async function testConnection() {
  try {
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()
    console.log("✅ Conexión a MySQL exitosa")
    return true
  } catch (error) {
    console.error("❌ Error de conexión a MySQL:", error)
    return false
  }
}

export default pool
