import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { executeQuery } from "@/lib/mysql"

const JWT_SECRET = process.env.JWT_SECRET || "your-development-jwt-secret-key"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("authToken")?.value

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string }
    const userId = decoded.userId

    const user = await executeQuery(
      "SELECT id, name, email FROM users WHERE id = ?",
      [userId]
    )

    if (!user || (user as any).length === 0) {
      return NextResponse.json({ authenticated: false }, { status: 200 })
    }

    const found = (user as any)[0]
    return NextResponse.json({
      authenticated: true,
      id: found.id,
      name: found.name,
      email: found.email,
    })

  } catch (error) {
    console.error("Error obteniendo información del usuario:", error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
