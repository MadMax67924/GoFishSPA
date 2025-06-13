import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import { isValidToken, generateSecureToken } from "@/lib/validation"

// Caso 4: Confirmar Cuenta de Usuario vía Correo
export async function POST(request: Request) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token de verificación requerido" }, { status: 400 })
    }

    if (!isValidToken(token)) {
      return NextResponse.json({ error: "Token de verificación inválido" }, { status: 400 })
    }

    // Buscar usuario con el token
    const sql = `
      SELECT id, email, name, verification_token_expires 
      FROM users 
      WHERE verification_token = ? AND email_verified = FALSE
    `
    const users = await executeQuery(sql, [token])

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "Token de verificación inválido o ya utilizado" }, { status: 400 })
    }

    const user = users[0] as any

    // Verificar si el token ha expirado
    if (new Date() > new Date(user.verification_token_expires)) {
      return NextResponse.json({ error: "El token de verificación ha expirado" }, { status: 400 })
    }

    // Activar la cuenta
    const updateSql = `
      UPDATE users 
      SET email_verified = TRUE, verification_token = NULL, verification_token_expires = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    await executeQuery(updateSql, [user.id])

    return NextResponse.json({
      success: true,
      message: "Correo electrónico verificado exitosamente. Ya puedes iniciar sesión.",
    })
  } catch (error) {
    console.error("Error al verificar email:", error)
    return NextResponse.json({ error: "Error al verificar el correo electrónico" }, { status: 500 })
  }
}

// Reenviar correo de verificación
export async function PUT(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Correo electrónico requerido" }, { status: 400 })
    }

    // Buscar usuario no verificado
    const sql = "SELECT id FROM users WHERE email = ? AND email_verified = FALSE"
    const users = await executeQuery(sql, [email])

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        { error: "No se encontró una cuenta pendiente de verificación con este correo" },
        { status: 404 },
      )
    }

    // Generar nuevo token
    const verificationToken = generateSecureToken()
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000)

    const updateSql = `
      UPDATE users 
      SET verification_token = ?, verification_token_expires = ?
      WHERE email = ? AND email_verified = FALSE
    `
    await executeQuery(updateSql, [verificationToken, tokenExpiry, email])

    return NextResponse.json({
      success: true,
      message: "Correo de verificación reenviado exitosamente.",
      verificationToken: process.env.NODE_ENV === "development" ? verificationToken : undefined,
    })
  } catch (error) {
    console.error("Error al reenviar verificación:", error)
    return NextResponse.json({ error: "Error al reenviar el correo de verificación" }, { status: 500 })
  }
}
