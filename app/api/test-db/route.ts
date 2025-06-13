import { NextResponse } from "next/server"
import { testConnection, executeQuery } from "@/lib/mysql"

export async function GET() {
  try {
    // Probar la conexión
    const isConnected = await testConnection()

    if (!isConnected) {
      return NextResponse.json(
        {
          error: "No se pudo conectar a la base de datos",
          connected: false,
        },
        { status: 500 },
      )
    }

    // Probar una consulta simple
    const result = await executeQuery("SELECT 1 as test")

    // Verificar si las tablas existen
    const tables = await executeQuery("SHOW TABLES")

    return NextResponse.json({
      connected: true,
      testQuery: result,
      tables: tables,
      message: "Conexión a MySQL exitosa",
    })
  } catch (error: any) {
    console.error("Error en test de base de datos:", error)
    return NextResponse.json(
      {
        error: error.message,
        connected: false,
      },
      { status: 500 },
    )
  }
}
