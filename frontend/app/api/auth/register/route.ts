import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { executeQuery } from "@/lib/mysql"
import { validateEmail, validatePassword, generateSecureToken } from "@/lib/validation"
import { sendVerificationEmail } from '@/lib/email'

// Caso 1: Registrar nueva cuenta de usuario (mejorado)
export async function POST(request: Request) {
  try {
    const { name, email, password, confirmPassword } = await request.json()

    // Validaciones básicas
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        {
          error: "Todos los campos son requeridos",
          field: "general",
        },
        { status: 400 },
      )
    }

    // Validar nombre
    if (name.length < 2) {
      return NextResponse.json(
        {
          error: "El nombre debe tener al menos 2 caracteres",
          field: "name",
        },
        { status: 400 },
      )
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          error: "El nombre es demasiado largo",
          field: "name",
        },
        { status: 400 },
      )
    }

    // Caso 2: Validar Formato de Correo de Usuario
    const emailValidation = validateEmail(email)
    if (!emailValidation.isValid) {
      return NextResponse.json(
        {
          error: emailValidation.message,
          field: "email",
        },
        { status: 400 },
      )
    }

    // Caso 3: Validar Fuerza de Contraseña de Usuario
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        {
          error: passwordValidation.message,
          field: "password",
          score: passwordValidation.score,
        },
        { status: 400 },
      )
    }

    // Validar confirmación de contraseña
    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          error: "Las contraseñas no coinciden",
          field: "confirmPassword",
        },
        { status: 400 },
      )
    }

    // Verificar si el usuario ya existe
    const existingUserSql =
      "SELECT id, email_verified, failed_login_attempts, account_locked_until FROM users WHERE email = ?"
    const existingUsers = await executeQuery(existingUserSql, [email])

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      const existingUser = existingUsers[0] as any

      if (existingUser.email_verified) {
        return NextResponse.json(
          {
            error: "Ya existe una cuenta con este correo electrónico",
            field: "email",
          },
          { status: 409 },
        )
      } else {
        // Si existe pero no está verificado, permitir re-registro
        await executeQuery("DELETE FROM users WHERE email = ? AND email_verified = FALSE", [email])
      }
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Caso 4: Generar token de verificación para confirmar cuenta vía correo
    const verificationToken = generateSecureToken()
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas

    // Crear usuario con estado no verificado
    const insertSql = `
      INSERT INTO users (name, email, password, email_verified, verification_token, verification_token_expires, failed_login_attempts, account_locked_until) 
      VALUES (?, ?, ?, FALSE, ?, ?, 0, NULL)
    `
    // ... tu código existente hasta después de INSERT ...

const result = await executeQuery(insertSql, [name, email, hashedPassword, verificationToken, tokenExpiry])
const userId = (result as any).insertId

console.log('🔍 ANTES DE ENVIAR EMAIL - Llegó hasta aquí?')
console.log('🔍 Variables:', { email, token: verificationToken, name })

// ENVÍO DEL EMAIL DE VERIFICACIÓN
try {
  console.log('🔍 LLAMANDO A sendVerificationEmail...')
  await sendVerificationEmail(email, verificationToken, name)
  console.log('✅ Email de verificación enviado a:', email)
} catch (emailError) {
  console.error('❌ Error enviando email de verificación:', emailError)
}


// ✅ AHORA SÍ EL RETURN
return NextResponse.json({
  success: true,
  userId,
  message: "Cuenta creada exitosamente. Por favor, verifica tu correo electrónico.",
  verificationToken: process.env.NODE_ENV === "development" ? verificationToken : undefined,
})
  } catch (error) {
    console.error("Error al registrar usuario:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        field: "general",
      },
      { status: 500 },
    )
  }
}
