import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

export async function POST(req: NextRequest) {
  try {
    const { type = 'deployment.created' } = await req.json()
    
    // Simular un webhook de Vercel
    const mockPayload = {
      type,
      deployment: {
        id: `test-${Date.now()}`,
        meta: {
          environment: 'development'
        },
        errorMessage: type === 'deployment.error' ? 'Test error message' : undefined
      }
    }

    // Llamar a nuestro webhook internamente
    const webhookResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/vercel-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-signature': `sha1=${process.env.VERCEL_WEBHOOK_SECRET}`
      },
      body: JSON.stringify(mockPayload)
    })

    const result = await webhookResponse.json()

    return NextResponse.json({
      message: 'Test deployment webhook triggered',
      webhook_result: result,
      mock_payload: mockPayload
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET para mostrar opciones de testing
export async function GET() {
  return NextResponse.json({
    message: 'Test Deployment Webhook',
    available_tests: [
      'POST con { "type": "deployment.created" }',
      'POST con { "type": "deployment.ready" }',
      'POST con { "type": "deployment.error" }'
    ],
    example: {
      method: 'POST',
      body: { type: 'deployment.created' }
    }
  })
}