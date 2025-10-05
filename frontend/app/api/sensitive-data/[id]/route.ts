import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/mysql"
import { decryptData } from "@/lib/encryption"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: "userId es requerido para autorización" },
        { status: 400 }
      )
    }

    // Obtener datos cifrados
    const sql = `
      SELECT * FROM sensitive_data 
      WHERE id = ? AND user_id = ?
    `
    
    const results = await executeQuery(sql, [params.id, userId])
    
    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: "Datos no encontrados o no autorizado" },
        { status: 404 }
      )
    }

    const encryptedData = results[0] as any

    // Descifrar datos
    const decryptedData = decryptData({
      encrypted: encryptedData.encrypted_data,
      iv: encryptedData.encryption_iv,
      authTag: encryptedData.encryption_auth_tag
    })

    return NextResponse.json({
      success: true,
      data: {
        id: encryptedData.id,
        dataType: encryptedData.data_type,
        sensitiveData: decryptedData,
        description: encryptedData.description,
        createdAt: encryptedData.created_at
      }
    })

  } catch (error) {
    console.error("Error recuperando datos sensibles:", error)
    return NextResponse.json(
      { error: "Error al recuperar datos sensibles" },
      { status: 500 }
    )
  }
}