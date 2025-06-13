import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { executeQuery } from "@/lib/mysql"

const JWT_SECRET = process.env.JWT_SECRET || "your-development-jwt-secret-key"
const MAX_LOGIN_ATTEMPTS = 5
const LOCKOUT_DURATION = 30 * 60 * 1000 // 30 minutos

// Caso 5: Inicio Sesión de Usuario (mejorado)
// Caso 6: Mostrar Error al Usuario en Login Fallido
// Caso 7: Bloquear Cuenta Usuario tras Intentos Fallidos
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Correo y contraseña son requeridos",
          field: "general",
        },
        { status: 400 },
      )
    }

    // Buscar usuario
    const sql = `
      SELECT id, name, email, password, email_verified, failed_login_attempts, 
             account_locked_until, last_login_attempt
      FROM users WHERE email = ?
    `
    const users = await executeQuery(sql, [email])

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json(
        {
          error: "Credenciales inválidas",
          field: "email",
        },
        { status: 401 },
      )
    }

    const user = users[0] as any

    // Verificar si el correo está verificado
    if (!user.email_verified) {
      return NextResponse.json(
        {
          error: "Debes verificar tu correo electrónico antes de iniciar sesión",
          field: "email",
          needsVerification: true,
        },
        { status: 403 },
      )
    }

    // Caso 7: Verificar si la cuenta está bloqueada
    const now = new Date()
    if (user.account_locked_until && new Date(user.account_locked_until) > now) {
      const lockoutEnd = new Date(user.account_locked_until)
      const remainingMinutes = Math.ceil((lockoutEnd.getTime() - now.getTime()) / (1000 * 60))

      return NextResponse.json(
        {
          error: `Cuenta bloqueada temporalmente. Intenta de nuevo en ${remainingMinutes} minutos.`,
          field: "general",
          accountLocked: true,
          lockoutEnd: lockoutEnd.toISOString(),
        },
        { status: 423 },
      )
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      // Incrementar intentos fallidos
      const newFailedAttempts = (user.failed_login_attempts || 0) + 1
      let lockoutUntil = null

      // Caso 7: Bloquear cuenta si se exceden los intentos
      if (newFailedAttempts >= MAX_LOGIN_ATTEMPTS) {
        lockoutUntil = new Date(Date.now() + LOCKOUT_DURATION)
      }

      await executeQuery(
        `UPDATE users 
         SET failed_login_attempts = ?, account_locked_until = ?, last_login_attempt = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [newFailedAttempts, lockoutUntil, user.id],
      )

      const remainingAttempts = MAX_LOGIN_ATTEMPTS - newFailedAttempts

      if (lockoutUntil) {
        return NextResponse.json(
          {
            error: "Demasiados intentos fallidos. Cuenta bloqueada temporalmente por 30 minutos.",
            field: "password",
            accountLocked: true,
            lockoutEnd: lockoutUntil.toISOString(),
          },
          { status: 423 },
        )
      } else {
        return NextResponse.json(
          {
            error: `Credenciales inválidas. Te quedan ${remainingAttempts} intentos.`,
            field: "password",
            remainingAttempts,
          },
          { status: 401 },
        )
      }
    }

    // Login exitoso - resetear intentos fallidos
    await executeQuery(
      `UPDATE users 
       SET failed_login_attempts = 0, account_locked_until = NULL, last_login_attempt = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [user.id],
    )

    // Generar token JWT
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" })

    // Establecer cookie con el token
    cookies().set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: "/",
      sameSite: "lax",
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      message: "Inicio de sesión exitoso",
    })
  } catch (error) {
    console.error("Error al iniciar sesión:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        field: "general",
      },
      { status: 500 },
    )
  }
}
