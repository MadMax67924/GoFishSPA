import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json()

    // Validar datos
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    // Guardar mensaje de contacto
    const sql = "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)"
    await executeQuery(sql, [name, email, message])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al enviar mensaje de contacto:", error)
    return NextResponse.json({ error: "Error al enviar mensaje de contacto" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const sql = "SELECT * FROM contacts ORDER BY created_at DESC"
    const contacts = await executeQuery(sql)

    return NextResponse.json(contacts)
  } catch (error) {
    console.error("Error al obtener mensajes de contacto:", error)
    return NextResponse.json({ error: "Error al obtener mensajes de contacto" }, { status: 500 })
  }
}
