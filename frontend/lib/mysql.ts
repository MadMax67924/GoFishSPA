import mysql from "mysql2/promise"

// Validar variables de entorno en producción
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
  throw new Error("DATABASE ENV VARIABLES NOT FOUND")
}

// Configuración para Railway con MySQL
const config = {
  host: process.env.DB_HOST!,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  ssl: {
    rejectUnauthorized: false
  }
}

// Crear pool de conexiones
const pool = mysql.createPool(config)

// Función helper para ejecutar consultas con mejor manejo de errores
export async function executeQuery(query: string, params: any[] = []) {
  let connection
  try {
    connection = await pool.getConnection()
    console.log(`🔍 Ejecutando query: ${query.substring(0, 100)}...`)
    const [results] = await connection.execute(query, params)
    console.log(`✅ Query ejecutada exitosamente`)
    return results
  } catch (error) {
    console.error("❌ Error ejecutando consulta:", error)
    console.error("📝 Query:", query)
    console.error("🔧 Params:", params)
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
    console.log("🔍 Probando conexión a MySQL...")
    console.log(`📍 Host: ${config.host}:${config.port}`)
    console.log(`👤 Usuario: ${config.user}`)
    console.log(`🗄️ Base de datos: ${config.database}`)

    const connection = await pool.getConnection()
    await connection.ping()

    // Obtener información de la base de datos
    const [dbInfo] = await connection.execute("SELECT DATABASE() as current_db, VERSION() as version") as any[]
    console.log(`✅ Conexión exitosa a MySQL`)
    console.log(`📁 Base de datos actual: ${(dbInfo as any)[0]?.current_db}`)
    console.log(`⚡ Versión MySQL: ${(dbInfo as any)[0]?.version}`)

    connection.release()
    return true
  } catch (error: any) {
    console.error("❌ Error de conexión a MySQL:", error.message)
    console.error("🔧 Verifica las variables de entorno en Railway")
    return false
  }
}

export default pool
