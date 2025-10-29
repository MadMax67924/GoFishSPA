// Versión segura sin dependencia de Resend - SOLO PARA DESARROLLO
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
    // En producción, aquí integrarías con tu servicio de email
    if (process.env.NODE_ENV === 'production') {
      console.log('🚨 En producción, configurar servicio de email real')
      console.log('💡 Opciones: Resend, SendGrid, NodeMailer, etc.')
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

// Función adicional para enviar confirmación de orden
export async function sendOrderConfirmationEmail(
  to: string,
  customerName: string,
  orderNumber: string,
  orderDetails: any
): Promise<boolean> {
  try {
    console.log(`📧 Simulando envío de confirmación para orden ${orderNumber} a ${to}`)
    console.log(`   - Cliente: ${customerName}`)
    console.log(`   - Total: $${orderDetails.total}`)
    
    if (process.env.NODE_ENV === 'production') {
      console.log('🚨 En producción, enviar email real de confirmación')
      return false
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Confirmación de orden simulada correctamente')
    return true
  } catch (error) {
    console.error('❌ Error en envío de confirmación:', error)
    return false
  }
}
export async function sendPasswordResetEmail(email: string, token: string, name: string) {
  const resetUrl = `${process.env.APP_URL}/reset-password?token=${token}`
  
  console.log('🔐 Enviando email de recuperación a:', email)
  console.log('🔐 URL de recuperación:', resetUrl)
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Recupera tu contraseña - GoFish',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header { 
              background: #dc2626; 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0;
            }
            .content { 
              padding: 30px; 
              background: #f9fafb; 
              border-radius: 0 0 10px 10px;
            }
            .button { 
              background: #dc2626; 
              color: white; 
              padding: 15px 30px; 
              text-decoration: none; 
              border-radius: 6px; 
              display: inline-block; 
              font-size: 16px;
              font-weight: bold;
            }
            .footer { 
              text-align: center; 
              padding: 20px; 
              color: #6b7280; 
              font-size: 14px; 
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Recupera tu contraseña</h1>
          </div>
          <div class="content">
            <h2>Hola ${name},</h2>
            <p>Recibimos una solicitud para restablecer tu contraseña en GoFish.</p>
            
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer contraseña</a>
            </p>
            
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            
            <p><strong>Este enlace expirará en 1 hora.</strong></p>
            <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
            
            <div class="footer">
              <p>Equipo GoFish</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (error) {
      console.error('❌ Error de Resend:', error)
      throw error
    }

    console.log('✅ Email de recuperación enviado, ID:', data?.id)
    return data
  } catch (error) {
    console.error('❌ Error en sendPasswordResetEmail:', error)
    throw error
  }
}