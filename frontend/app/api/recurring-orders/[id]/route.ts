import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { updateRecurringOrderStatus } from "@/lib/recurring-orders";

const JWT_SECRET = process.env.JWT_SECRET || "your-development-jwt-secret-key";

// Actualizar estado de suscripción (pausar/cancelar)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const recurringOrderId = params.id;
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const { status } = await request.json();

    await updateRecurringOrderStatus(recurringOrderId, status);

    return NextResponse.json({ 
      success: true, 
      message: `Suscripción ${status === 'cancelled' ? 'cancelada' : 'pausada'} exitosamente` 
    });
  } catch (error) {
    console.error("Error actualizando orden recurrente:", error);
    return NextResponse.json({ error: "Error al actualizar orden recurrente" }, { status: 500 });
  }
}