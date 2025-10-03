import { NextResponse } from "next/server"

export async function POST(request: Request) {
  console.log('🔍 Test básico funcionando')
  return NextResponse.json({ success: true, message: 'Test básico funciona' })
}