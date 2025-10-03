import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    
    const sql = `
      SELECT 
        se.*,
        u.name as user_name
      FROM security_events se
      LEFT JOIN users u ON se.user_id = u.id
      ORDER BY se.created_at DESC
      LIMIT ?
    `
    
    const events = await executeQuery(sql, [limit])
    
    return NextResponse.json({
      success: true,
      events: events || []
    })
    
  } catch (error) {
    console.error("Error obteniendo eventos de seguridad:", error)
    return NextResponse.json(
      { error: "Error al obtener eventos de seguridad" },
      { status: 500 }
    )
  }
}