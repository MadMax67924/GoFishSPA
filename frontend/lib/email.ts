// Versión segura sin Resend - SOLO PARA DESARROLLO
export async function sendDocumentEmail(
  to: string,
  customerName: string,
  documentType: string,
  orderNumber: string,
  pdfBuffer: Buffer
): Promise<boolean> {
  try {
    console.log(`📧 Simulando envío de email para orden ${orderNumber} a ${to}`)
    console.log(`   - Tipo documento: ${documentType}`)
    console.log(`   - Cliente: ${customerName}`)
    console.log(`   - Archivo PDF: ${pdfBuffer.length} bytes`)
    
    // En desarrollo, solo logueamos el intento de envío
    if (process.env.NODE_ENV === 'production') {
      console.log('🚨 En producción, configurar servicio de email real')
      return false
    }
    
    // Simular delay de envío
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ Email simulado correctamente (en desarrollo)')
    console.log('📧 Contenido del email simulado:')
    console.log('=========================================')
    console.log(`De: GoFish SpA <documentos@gofish.cl>`)
    console.log(`Para: ${to}`)
    console.log(`Asunto: ${documentType === 'boleta' ? 'Boleta Electrónica' : 'Factura Electrónica'} - Orden ${orderNumber}`)
    console.log(`Mensaje: Hola ${customerName}, tu documento ha sido generado exitosamente.`)
    console.log('=========================================')
    
    return true
  } catch (error) {
    console.error('❌ Error en envío de email simulado:', error)
    return false
  }
}

export async function sendPasswordResetEmail(email: string, token: string, name: string): Promise<boolean> {
  const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`
  
  console.log('🔐 Simulando envío de email de recuperación a:', email)
  console.log('🔐 URL de recuperación:', resetUrl)
  
  try {
    if (process.env.NODE_ENV === 'production') {
      console.log('🚨 En producción, enviar email real de recuperación')
      return false
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Email de recuperación simulado correctamente')
    console.log('📧 Contenido del email simulado:')
    console.log('=========================================')
    console.log(`De: GoFish SpA <soporte@gofish.cl>`)
    console.log(`Para: ${email}`)
    console.log(`Asunto: Recupera tu contraseña - GoFish`)
    console.log(`Mensaje: Hola ${name}, haz clic aquí para recuperar tu contraseña: ${resetUrl}`)
    console.log('=========================================')
    
    return true
  } catch (error) {
    console.error('❌ Error en envío de email de recuperación:', error)
    return false
  }
}