import { NextResponse } from "next/server"
import { testConnection, executeQuery } from "@/lib/mysql"

export async function GET() {
  try {
    // Probar la conexión a MySQL
    const isConnected = await testConnection()

    if (!isConnected) {
      return NextResponse.json(
        {
          error: "No se pudo conectar a la base de datos MySQL",
          connected: false,
          database: "MySQL",
        },
        { status: 500 },
      )
    }

    // Probar una consulta simple
    const result = await executeQuery("SELECT 1 as test, NOW() as current_time")

    // Verificar si las tablas existen
    const tables = await executeQuery("SHOW TABLES")

    // Obtener información de la base de datos
    const dbInfo = await executeQuery("SELECT DATABASE() as database_name, VERSION() as mysql_version")

    return NextResponse.json({
      connected: true,
      database: "MySQL",
      testQuery: result,
      tables: tables,
      databaseInfo: dbInfo,
      message: "Conexión a MySQL exitosa",
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Error en test de base de datos MySQL:", error)
    return NextResponse.json(
      {
        error: error.message,
        connected: false,
        database: "MySQL",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
