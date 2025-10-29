import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendDocumentEmail(
  to: string, 
  customerName: string, 
  documentType: string, 
  orderNumber: string,
  pdfBuffer: Buffer
) {
  const documentName = documentType === 'boleta' ? 'Boleta Electrónica' : 'Factura Electrónica'
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'GoFish SpA <documentos@gofish.cl>',
      to: to,
      subject: `${documentName} - Orden ${orderNumber}`,
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
              background: #005f73; 
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
            .document-info {
              background: white;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #2a9d8f;
              margin: 20px 0;
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
            <h1>GoFish SpA</h1>
            <p>Distribuidora de Productos Marinos</p>
          </div>
          <div class="content">
            <h2>Hola ${customerName},</h2>
            <p>Tu ${documentName.toLowerCase()} para la orden <strong>${orderNumber}</strong> ha sido generada exitosamente.</p>
            
            <div class="document-info">
              <h3>📄 ${documentName}</h3>
              <p><strong>Número de orden:</strong> ${orderNumber}</p>
              <p><strong>Fecha de emisión:</strong> ${new Date().toLocaleDateString('es-CL')}</p>
              <p><strong>Tipo de documento:</strong> ${documentName}</p>
            </div>

            <p>El documento PDF se encuentra adjunto en este correo. También puedes descargarlo desde tu cuenta en nuestro sitio web.</p>

            <p><strong>Importante:</strong> Conserva este documento para cualquier consulta o reclamo.</p>

            <div class="footer">
              <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
              <p>📞 +56 32 234 5678 | 📧 ventas@gofish.cl</p>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `${documentType}-${orderNumber}.pdf`,
          content: pdfBuffer.toString('base64'),
        },
      ],
    })

    if (error) {
      console.error('Error enviando email con documento:', error)
      throw error
    }

    console.log('✅ Email con documento enviado, ID:', data?.id)
    return data
  } catch (error) {
    console.error('❌ Error en sendDocumentEmail:', error)
    throw error
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