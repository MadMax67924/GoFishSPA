import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    stripeKey: process.env.STRIPE_SECRET_KEY ? "✅ Configurada" : "❌ No configurada",
    appUrl: process.env.APP_URL || "❌ No configurada",
    nodeEnv: process.env.NODE_ENV,
    allEnvVars: Object.keys(process.env).filter(key => 
      key.includes('STRIPE') || key.includes('APP') || key.includes('NODE')
    )
  })
}