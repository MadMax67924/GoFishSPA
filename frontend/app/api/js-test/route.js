import { NextResponse } from "next/server"

export async function GET() {
  console.log('✅ JS test funciona')
  return NextResponse.json({ status: 'ok', from: 'javascript' })
}