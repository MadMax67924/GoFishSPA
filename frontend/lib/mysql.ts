import mysql from "mysql2/promise"

// Configuración simplificada sin opciones obsoletas
const config = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "toki1801",
  database: process.env.DB_NAME || "gofish",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000,
  charset: 'utf8mb4',
}

// Crear pool de conexiones
const pool = mysql.createPool(config)

// Función helper para ejecutar consultas
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
    console.error("🔢 Params:", params)
    throw error
  } finally {
    if (connection) {
      connection.release()
    }
  }
}

export async function testConnection() {
  try {
<<<<<<< Updated upstream
    console.log("🔍 Probando conexión a MySQL...")
    console.log(`📍 Host: ${config.host}:${config.port}`)
    console.log(`👤 Usuario: ${config.user}`)
    console.log(`🗄️ Base de datos: ${config.database}`)

    const connection = await pool.getConnection()
    await connection.ping()

    // Obtener información de la base de datos - TIPADO CORREGIDO
    const [dbInfo] = await connection.execute("SELECT DATABASE() as current_db, VERSION() as version") as any[]
    console.log(`✅ Conexión exitosa a MySQL`)
    console.log(`📁 Base de datos actual: ${(dbInfo as any)[0]?.current_db}`)
    console.log(`⚡ Versión MySQL: ${(dbInfo as any)[0]?.version}`)

=======
    const connection = await pool.getConnection()
    await connection.ping()
>>>>>>> Stashed changes
    connection.release()
    console.log("✅ Conexión a MySQL exitosa")
    return true
  } catch (error: any) {
    console.error("❌ Error de conexión a MySQL:", error.message)
<<<<<<< Updated upstream
    console.error("🔧 Verifica que:")
    console.error("   - MySQL esté ejecutándose")
    console.error("   - Las credenciales sean correctas")
    console.error("   - La base de datos 'gofish' exista")
=======
>>>>>>> Stashed changes
    return false
  }
}

export default pool