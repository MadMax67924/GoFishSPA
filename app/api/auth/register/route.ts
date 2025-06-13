import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { executeQuery } from "@/lib/mysql"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Validar datos
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Verificar si el usuario ya existe
    const existingUserSql = "SELECT id FROM users WHERE email = ?"
    const existingUsers = await executeQuery(existingUserSql, [email])

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json({ error: "El correo electrónico ya está registrado" }, { status: 409 })
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario
    const insertSql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)"
    const result = await executeQuery(insertSql, [name, email, hashedPassword])

    return NextResponse.json({
      success: true,
      userId: (result as any).insertId,
    })
  } catch (error) {
    console.error("Error al registrar usuario:", error)
    return NextResponse.json({ error: "Error al registrar usuario" }, { status: 500 })
  }
}
