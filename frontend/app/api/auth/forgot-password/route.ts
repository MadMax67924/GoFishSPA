import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import { validateEmail, generateSecureToken } from "@/lib/validation"

// Caso 8: Recuperar contraseña de Usuario
export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Correo electrónico requerido" }, { status: 400 })
    }

    // Validar formato de email
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return NextResponse.json({ error: emailValidation.message }, { status: 400 })
    }

    // Verificar si el usuario existe y está verificado
    const sql = "SELECT id, name FROM users WHERE email = ? AND email_verified = TRUE"
    const users = await executeQuery(sql, [email])

    // Por seguridad, siempre devolver éxito, incluso si el email no existe
    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Si existe una cuenta con este correo, recibirás un enlace de recuperación.",
      })
    }

    const user = users[0] as any

    // Generar token de recuperación
    const resetToken = generateSecureToken()
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000) // 1 hora

    // Guardar token en la base de datos
    const updateSql = `
      UPDATE users 
      SET password_reset_token = ?, password_reset_expires = ?
      WHERE id = ?
    `
    await executeQuery(updateSql, [resetToken, tokenExpiry, user.id])

    // En un entorno real, aquí enviarías el correo con el enlace de recuperación
    // Por ahora, devolvemos el token para testing
    return NextResponse.json({
      success: true,
      message: "Si existe una cuenta con este correo, recibirás un enlace de recuperación.",
      // En producción, NO devolver el token en la respuesta
      resetToken: process.env.NODE_ENV === "development" ? resetToken : undefined,
    })
  } catch (error) {
    console.error("Error en recuperación de contraseña:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}
