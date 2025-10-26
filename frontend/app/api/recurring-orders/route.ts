import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { 
  createRecurringOrder, 
  getUserRecurringOrders,
  processPendingRecurringOrders 
} from "@/lib/recurring-orders";

const JWT_SECRET = process.env.JWT_SECRET || "your-development-jwt-secret-key";

// Obtener suscripciones del usuario
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = parseInt(decoded.userId);

    const orders = await getUserRecurringOrders(userId);

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error obteniendo órdenes recurrentes:", error);
    return NextResponse.json({ error: "Error al obtener órdenes recurrentes" }, { status: 500 });
  }
}

// Crear nueva suscripción recurrente
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = parseInt(decoded.userId);

    const orderData = await request.json();

    const recurringOrder = await createRecurringOrder({
      user_id: userId,
      ...orderData
    });

    return NextResponse.json({ 
      success: true, 
      message: "Compra recurrente programada exitosamente",
      recurringOrder 
    });
  } catch (error) {
    console.error("Error creando orden recurrente:", error);
    return NextResponse.json({ error: "Error al crear orden recurrente" }, { status: 500 });
  }
}