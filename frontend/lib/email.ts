import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string, name: string) {
  const verificationUrl = `${process.env.APP_URL}/auth/verify-email?token=${token}`
  
  console.log('🔍 Enviando email de verificación a:', email)
  console.log('🔍 URL de verificación:', verificationUrl)
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Verifica tu cuenta - GoFish',
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
              background: #2563eb; 
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
              background: #2563eb; 
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
            .token {
              background: #f3f4f6;
              padding: 10px;
              border-radius: 5px;
              font-family: monospace;
              word-break: break-all;
              margin: 15px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>¡Bienvenido a GoFish!</h1>
          </div>
          <div class="content">
            <h2>Hola ${name},</h2>
            <p>Gracias por registrarte en GoFish. Para activar tu cuenta, por favor verifica tu dirección de email haciendo clic en el siguiente botón:</p>
            
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verificar mi email</a>
            </p>
            
            <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            
            <p><strong>Este enlace expirará en 24 horas.</strong></p>
            
            <div class="footer">
              <p>Si no creaste esta cuenta, puedes ignorar este mensaje.</p>
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

    console.log('✅ Email de verificación enviado, ID:', data?.id)
    return data
  } catch (error) {
    console.error('❌ Error en sendVerificationEmail:', error)
    throw error
  }
}