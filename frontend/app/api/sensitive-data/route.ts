import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import { encryptData, hashData } from "@/lib/encryption"

export async function POST(request: Request) {
  try {
    const { userId, dataType, sensitiveData, description } = await request.json()

    // Validaciones
    if (!userId || !dataType || !sensitiveData) {
      return NextResponse.json(
        { error: "Datos requeridos: userId, dataType, sensitiveData" },
        { status: 400 }
      )
    }

    // Paso 2: Cifrar datos automáticamente antes de guardar
    const encrypted = encryptData(sensitiveData)
    const dataHash = hashData(sensitiveData) // Para evitar duplicados

    // Guardar en base de datos
    const sql = `
      INSERT INTO sensitive_data 
        (user_id, data_type, encrypted_data, encryption_iv, encryption_auth_tag, data_hash, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    
    const result = await executeQuery(sql, [
      userId,
      dataType,
      encrypted.encrypted,
      encrypted.iv,
      encrypted.authTag,
      dataHash,
      description || null
    ])

    return NextResponse.json({
      success: true,
      message: "Datos sensibles almacenados de forma segura",
      dataId: (result as any).insertId
    })

  } catch (error) {
    console.error("Error almacenando datos sensibles:", error)
    return NextResponse.json(
      { error: "Error al almacenar datos sensibles" },
      { status: 500 }
    )
  }
}

// Endpoint para recuperar datos (solo el usuario dueño)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const dataType = searchParams.get('dataType')

    if (!userId) {
      return NextResponse.json(
        { error: "userId es requerido" },
        { status: 400 }
      )
    }

    let sql = `SELECT id, data_type, description, created_at FROM sensitive_data WHERE user_id = ?`
    const params = [userId]

    if (dataType) {
      sql += ` AND data_type = ?`
      params.push(dataType)
    }

    const dataList = await executeQuery(sql, params)

    return NextResponse.json({
      success: true,
      data: dataList || []
    })

  } catch (error) {
    console.error("Error obteniendo datos sensibles:", error)
    return NextResponse.json(
      { error: "Error al obtener datos sensibles" },
      { status: 500 }
    )
  }
}