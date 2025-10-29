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
      return NextResponse.json({ user: null }, { status: 401 })
    }

    const decoded: any = jwt.verify(token, JWT_SECRET)

    const rows: any = await query(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [decoded.userId]
    )

    if (!rows.length) {
      return NextResponse.json({ user: null }, { status: 404 })
    }

    return NextResponse.json({ user: rows[0] })
  } catch (error) {
    console.error("Error obteniendo usuario:", error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
