import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"

export async function POST(request: Request) {
  try {
    const { parentOrderId, recurringConfig } = await request.json()

    if (!parentOrderId || !recurringConfig) {
      return NextResponse.json(
        { error: "Datos incompletos para crear orden recurrente" },
        { status: 400 }
      )
    }

    const {
      intervalMonths,
      totalDurationMonths,
      startDate,
      totalCycles
    } = recurringConfig

    // Crear registro de orden recurrente
    const sql = `
      INSERT INTO recurring_orders (
        parent_order_id,
        interval_months,
        total_duration_months,
        start_date,
        total_cycles,
        next_order_date,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'active', NOW())
    `

    const nextOrderDate = calculateNextOrderDate(startDate, intervalMonths, 0)
    
    const result = await executeQuery(sql, [
      parentOrderId,
      intervalMonths,
      totalDurationMonths,
      startDate,
      totalCycles,
      nextOrderDate
    ])

    return NextResponse.json({
      success: true,
      recurringOrderId: (result as any).insertId,
      message: "Orden recurrente creada exitosamente"
    })

  } catch (error) {
    console.error("Error creando orden recurrente:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("user_id")

    if (!userId) {
      return NextResponse.json(
        { error: "Se requiere user_id" },
        { status: 400 }
      )
    }

    const sql = `
      SELECT 
        ro.*,
        o.order_number,
        o.total,
        o.status as parent_order_status
      FROM recurring_orders ro
      INNER JOIN orders o ON ro.parent_order_id = o.id
      WHERE o.user_id = ?
      ORDER BY ro.created_at DESC
    `

    const recurringOrders = await executeQuery(sql, [userId])
    return NextResponse.json(recurringOrders)

  } catch (error) {
    console.error("Error obteniendo órdenes recurrentes:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Función auxiliar para calcular próxima fecha
function calculateNextOrderDate(startDate: string, intervalMonths: number, cyclesCompleted: number): string {
  const date = new Date(startDate)
  date.setMonth(date.getMonth() + (intervalMonths * (cyclesCompleted + 1)))
  return date.toISOString().split('T')[0]
}