import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string, name: string) {
  console.log('🎯 FUNCIÓN sendVerificationEmail EJECUTADA')
  console.log('🔍 Resend API Key length:', process.env.RESEND_API_KEY?.length)
  
  const verificationUrl = `${process.env.APP_URL}/auth/verify-email?token=${token}`
  
  try {
    console.log('🔍 Enviando email a:', email)
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Verifica tu cuenta - GoFish',
      html: `<h1>Verifica tu cuenta</h1><p>Hola ${name}, usa este token: ${token}</p>`
    })

    if (error) {
      console.error('❌ Error de Resend:', error)
      throw error
    }

    console.log('✅ Email enviado, ID:', data?.id)
    return data
  } catch (error) {
    console.error('❌ Error completo en sendVerificationEmail:', error)
    throw error
  }
}