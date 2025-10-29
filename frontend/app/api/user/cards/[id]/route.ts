import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/mysql";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-development-jwt-secret-key";

// Eliminar tarjeta guardada
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const cardId = params.id;
    const cookieStore = await cookies();
    const token = cookieStore.get("authToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const userId = decoded.userId;

    // Verificar que la tarjeta pertenece al usuario
    const checkSql = "SELECT id FROM user_cards WHERE id = ? AND user_id = ?";
    const cards = await executeQuery(checkSql, [cardId, userId]);

    if (!Array.isArray(cards) || cards.length === 0) {
      return NextResponse.json({ error: "Tarjeta no encontrada" }, { status: 404 });
    }

    // Marcar tarjeta como inactiva (soft delete)
    const deleteSql = "UPDATE user_cards SET is_active = FALSE WHERE id = ? AND user_id = ?";
    await executeQuery(deleteSql, [cardId, userId]);

    return NextResponse.json({ success: true, message: "Tarjeta eliminada" });
  } catch (error) {
    console.error("Error eliminando tarjeta:", error);
    return NextResponse.json({ error: "Error al eliminar tarjeta" }, { status: 500 });
  }
}