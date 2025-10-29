import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { executeQuery } from "@/lib/mysql"

const JWT_SECRET = process.env.JWT_SECRET || "your-development-jwt-secret-key"

//Extrae el token de sesion de las cookies y despues los datos asociados a ese token de la base de datos
export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("authToken")?.value

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
    const userId = decoded.userId

    const user = await executeQuery(
      "SELECT id, firstName, lastName, email FROM users WHERE id = ?",
      [userId]
    )

    if (!user || (user as any).length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return NextResponse.json((user as any)[0])
  } catch (error) {
    console.error("Error obteniendo información del usuario:", error)
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}
