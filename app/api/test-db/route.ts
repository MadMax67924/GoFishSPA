import { NextResponse } from "next/server"
import { testConnection, executeQuery } from "@/lib/mysql"

export async function GET() {
  try {
    console.log("🔍 Iniciando test de conexión a base de datos...")

    // Probar conexión
    const isConnected = await testConnection()

    if (!isConnected) {
      return NextResponse.json(
        {
          success: false,
          message: "No se pudo conectar a la base de datos",
          details: "Verifica la configuración de MySQL",
        },
        { status: 500 },
      )
    }

    // Obtener información de la base de datos
    const dbInfo = await executeQuery("SELECT DATABASE() as current_db, VERSION() as version, NOW() as current_time")

    // Contar registros en tablas principales
    const productCount = await executeQuery("SELECT COUNT(*) as count FROM products")
    const userCount = await executeQuery("SELECT COUNT(*) as count FROM users")

    // Obtener lista de tablas
    const tables = await executeQuery("SHOW TABLES")
    const tableNames = tables.map((table: any) => Object.values(table)[0])

    return NextResponse.json({
      success: true,
      message: "✅ Conexión exitosa a base de datos GoFish",
      database_info: {
        host: "127.0.0.1",
        port: 3306,
        database: dbInfo[0].current_db,
        version: dbInfo[0].version,
        current_time: dbInfo[0].current_time,
      },
      tables: {
        total: tableNames.length,
        list: tableNames,
      },
      data_summary: {
        products: productCount[0].count,
        users: userCount[0].count,
      },
      connection_config: {
        host: process.env.DB_HOST || "127.0.0.1",
        port: process.env.DB_PORT || "3306",
        user: process.env.DB_USER || "root",
        database: process.env.DB_NAME || "gofish",
      },
    })
  } catch (error) {
    console.error("❌ Error en test de base de datos:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Error al conectar con la base de datos",
        error: error.message,
        suggestions: [
          "Verifica que MySQL esté ejecutándose",
          "Confirma que la base de datos 'gofish' exista",
          "Revisa las credenciales en las variables de entorno",
          "Asegúrate de que el puerto 3306 esté disponible",
        ],
      },
      { status: 500 },
    )
  }
}
