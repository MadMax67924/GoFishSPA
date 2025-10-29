import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { query } from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "your-development-jwt-secret-key"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("authToken")?.value

    if (!token) {
      return NextResponse.json({ activo: false }, { status: 401 })
    }

    const decoded: any = jwt.verify(token, JWT_SECRET)
    const id_usuario = decoded.userId

    const rows: any = await query(
      "SELECT activo FROM usuarios_mfa WHERE id_usuario = ?",
      [id_usuario]
    )

    const activo = rows.length > 0 && rows[0].activo === 1
    return NextResponse.json({ activo })
  } catch (error) {
    console.error("Error obteniendo estado MFA:", error)
    return NextResponse.json({ activo: false }, { status: 500 })
  }
}
