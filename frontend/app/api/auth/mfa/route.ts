import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import speakeasy from "speakeasy"
import QRCode from "qrcode"
import { query } from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "your-development-jwt-secret-key"

// ✅ Generar secreto MFA y devolver QR
export async function POST() {
  try {
    // Leer cookie de sesión
    const cookieStore = await cookies()
    const token = cookieStore.get("authToken")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
    }

    // Decodificar el JWT y obtener el id del usuario
    const decoded: any = jwt.verify(token, JWT_SECRET)
    const id_usuario = decoded.userId

    // Generar secreto MFA
    const secret = speakeasy.generateSecret({
      name: `GoFishSPA (${id_usuario})`,
    })

    const qr = await QRCode.toDataURL(secret.otpauth_url!)

    // Guardar secreto en la BD (o actualizar si ya existe)
    await query(
      `
      INSERT INTO usuarios_mfa (id_usuario, secret, activo, created_at, updated_at)
      VALUES (?, ?, 0, NOW(), NOW())
      ON DUPLICATE KEY UPDATE secret = VALUES(secret), activo = 0, updated_at = NOW()
      `,
      [id_usuario, secret.base32]
    )

    return NextResponse.json({
      success: true,
      qr,
      message: "Código QR MFA generado correctamente ✅",
    })
  } catch (error) {
    console.error("Error generando MFA:", error)
    return NextResponse.json(
      { success: false, message: "Error al generar MFA ❌" },
      { status: 500 }
    )
  }
}

// ✅ Validar código MFA del usuario logueado
export async function PUT(req: Request) {
  try {
    const { token: codigo } = await req.json()

    // Leer cookie de sesión
    const cookieStore = await cookies()
    const token = cookieStore.get("authToken")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "No autenticado" }, { status: 401 })
    }

    // Decodificar JWT y obtener el id_usuario real
    const decoded: any = jwt.verify(token, JWT_SECRET)
    const id_usuario = decoded.userId

    // Obtener secreto de la BD
    const rows: any = await query(
      "SELECT secret FROM usuarios_mfa WHERE id_usuario = ?",
      [id_usuario]
    )

    if (!rows.length) {
      return NextResponse.json({
        success: false,
        message: "No se encontró un registro MFA para este usuario ❌",
      })
    }

    // Verificar código TOTP
    const verified = speakeasy.totp.verify({
      secret: rows[0].secret,
      encoding: "base32",
      token: codigo,
      window: 1, // permite margen de tiempo
    })

    if (!verified) {
      return NextResponse.json({
        success: false,
        message: "Código inválido ❌",
      })
    }

    // Marcar MFA como activo
    await query("UPDATE usuarios_mfa SET activo = 1, updated_at = NOW() WHERE id_usuario = ?", [
      id_usuario,
    ])

    return NextResponse.json({
      success: true,
      message: "Autenticación MFA activada correctamente ✅",
    })
  } catch (error) {
    console.error("Error validando MFA:", error)
    return NextResponse.json(
      { success: false, message: "Error al validar MFA ❌" },
      { status: 500 }
    )
  }
}
