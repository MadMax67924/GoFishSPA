import { NextResponse } from "next/server"
import { testEncryption, encryptData, decryptData } from "@/lib/encryption"

export async function GET() {
  try {
    const testResult = testEncryption()
    
    // Probar con datos reales
    const sensitiveData = "1234-5678-9012-3456" // tarjeta de ejemplo
    const encrypted = encryptData(sensitiveData)
    const decrypted = decryptData(encrypted)
    
    return NextResponse.json({
      success: testResult,
      test: {
        original: sensitiveData,
        encrypted: encrypted,
        decrypted: decrypted,
        matches: sensitiveData === decrypted
      },
      message: testResult ? 
        "✅ Cifrado funcionando correctamente" : 
        "❌ Error en el cifrado"
    })
    
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}