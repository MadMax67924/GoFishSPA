import { NextResponse } from "next/server";
import { processPendingRecurringOrders } from "@/lib/recurring-orders";

// Endpoint para procesar órdenes recurrentes (ejecutar automáticamente)
export async function POST(request: Request) {
  try {
    // Verificar clave de API para seguridad
    const authHeader = request.headers.get("Authorization");
    const expectedToken = process.env.RECURRING_ORDERS_API_KEY;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const results = await processPendingRecurringOrders();

    return NextResponse.json({
      success: true,
      processed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results
    });
  } catch (error) {
    console.error("Error procesando órdenes recurrentes:", error);
    return NextResponse.json({ error: "Error procesando órdenes recurrentes" }, { status: 500 });
  }
}