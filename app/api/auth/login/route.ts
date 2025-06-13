import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { executeQuery } from "@/lib/mysql"

// Provide a fallback JWT secret for development
const JWT_SECRET = process.env.JWT_SECRET || "your-development-jwt-secret-key"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validar datos
    if (!email || !password) {
      return NextResponse.json({ error: "Correo y contraseña son requeridos" }, { status: 400 })
    }

    // Buscar usuario
    const sql = "SELECT * FROM users WHERE email = ?"
    const users = await executeQuery(sql, [email])

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const user = users[0] as any

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Generar token JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" })

    // Establecer cookie con el token
    cookies().set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 })
  }
}
