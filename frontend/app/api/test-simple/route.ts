import { NextResponse } from 'next/server'

export async function GET() {
  console.log('🎯 test-simple endpoint funcionando')
  console.log('🔍 RESEND_API_KEY existe?:', !!process.env.RESEND_API_KEY)
  console.log('🔍 RESEND_API_KEY longitud:', process.env.RESEND_API_KEY?.length)
  
  return NextResponse.json({ 
    message: 'Endpoint simple funciona',
    resendKeyExists: !!process.env.RESEND_API_KEY,
    resendKeyLength: process.env.RESEND_API_KEY?.length
  })
}