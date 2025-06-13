import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { executeQuery } from "@/lib/mysql"
import { isValidToken, validatePassword } from "@/lib/validation"

// Caso 9: Validando Token de Recuperación
// Caso 10: Cambiar Contraseña Recuperada
export async function POST(request: Request) {
  try {
    const { token, newPassword, confirmPassword } = await request.json()

    if (!token || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Caso 9: Validar formato del token
    if (!isValidToken(token)) {
      return NextResponse.json({ error: "Token de recuperación inválido" }, { status: 400 })
    }

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          error: "Las contraseñas no coinciden",
          field: "confirmPassword",
        },
        { status: 400 },
      )
    }

    // Caso 3: Validar fuerza de la nueva contraseña
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: passwordValidation.message,
          field: "newPassword",
          score: passwordValidation.score,
        },
        { status: 400 },
      )
    }

    // Buscar usuario con el token válido
    const sql = `
      SELECT id, email, password_reset_expires 
      FROM users 
      WHERE password_reset_token = ? AND email_verified = TRUE
    `
    const users = await executeQuery(sql, [token])

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ error: "Token de recuperación inválido o expirado" }, { status: 400 })
    }

    const user = users[0] as any

    // Verificar si el token ha expirado
    if (new Date() > new Date(user.password_reset_expires)) {
      return NextResponse.json({ error: "El token de recuperación ha expirado" }, { status: 400 })
    }

    // Caso 10: Cambiar la contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    const updateSql = `
      UPDATE users 
      SET password = ?, password_reset_token = NULL, password_reset_expires = NULL,
          failed_login_attempts = 0, account_locked_until = NULL, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    await executeQuery(updateSql, [hashedPassword, user.id])

    return NextResponse.json({
      success: true,
      message: "Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.",
    })
  } catch (error) {
    console.error("Error al resetear contraseña:", error)
    return NextResponse.json({ error: "Error al actualizar la contraseña" }, { status: 500 })
  }
}

// Verificar validez del token sin cambiar la contraseña
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get("token")

    if (!token || !isValidToken(token)) {
      return NextResponse.json({ valid: false, error: "Token inválido" }, { status: 400 })
    }

    const sql = `
      SELECT id, password_reset_expires 
      FROM users 
      WHERE password_reset_token = ? AND email_verified = TRUE
    `
    const users = await executeQuery(sql, [token])

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({ valid: false, error: "Token no encontrado" }, { status: 404 })
    }

    const user = users[0] as any

    if (new Date() > new Date(user.password_reset_expires)) {
      return NextResponse.json({ valid: false, error: "Token expirado" }, { status: 400 })
    }

    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error("Error al validar token:", error)
    return NextResponse.json({ valid: false, error: "Error del servidor" }, { status: 500 })
  }
}
