import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import { headers } from 'next/headers'

// Función para verificar el webhook de Vercel
function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.VERCEL_WEBHOOK_SECRET
  if (!secret) return false
  
  // Verificación básica - en producción usar crypto para HMAC
  return signature.includes(secret)
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text()
    const headersList = headers()
    const signature = headersList.get('x-vercel-signature') || ''
    
    // Verificar que viene de Vercel
    if (!verifyWebhookSignature(payload, signature)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = JSON.parse(payload)
    const deploymentId = data.deployment?.id || `manual-${Date.now()}`
    const environment = data.deployment?.meta?.environment || 'production'
    
    console.log('Vercel webhook recibido:', data.type, deploymentId)

    // Manejar diferentes tipos de eventos
    switch (data.type) {
      case 'deployment.created':
        // Log inicio de despliegue
        await executeQuery(`
          INSERT INTO deployment_logs (deployment_id, environment, status, timestamp, database_health_check) 
          VALUES (?, ?, 'started', NOW(), FALSE)
        `, [deploymentId, environment])
        
        console.log('✅ Deployment started logged:', deploymentId)
        break

      case 'deployment.ready':
        // Verificar salud del sistema antes del switch
        try {
          // 1. Verificar conectividad BD
          const healthCheck = await executeQuery('SELECT 1 as status, NOW() as timestamp') as any[]
          
          // 2. Verificar tablas críticas
          const tablesCheck = await executeQuery(`
            SELECT COUNT(*) as table_count 
            FROM information_schema.tables 
            WHERE table_schema = 'gofish' 
            AND table_name IN ('products', 'users', 'user_wishlist', 'reviews')
          `) as any[]

          const isHealthy = healthCheck.length > 0 && tablesCheck[0]?.table_count >= 4
          
          // 3. Actualizar log con resultado
          await executeQuery(`
            UPDATE deployment_logs 
            SET status = ?, database_health_check = ?, api_tests_passed = ?
            WHERE deployment_id = ?
          `, [
            isHealthy ? 'success' : 'failed',
            isHealthy,
            isHealthy,
            deploymentId
          ])
          
          console.log('✅ Deployment health check:', isHealthy ? 'PASSED' : 'FAILED')
          
        } catch (error) {
          // Error en verificación - marcar como fallido
          await executeQuery(`
            UPDATE deployment_logs 
            SET status = 'failed', error_message = ?, database_health_check = FALSE
            WHERE deployment_id = ?
          `, [
            error instanceof Error ? error.message : 'Health check failed',
            deploymentId
          ])
          
          console.error('❌ Deployment health check failed:', error)
        }
        break

      case 'deployment.error':
        // Deployment falló
        await executeQuery(`
          UPDATE deployment_logs 
          SET status = 'failed', error_message = ?
          WHERE deployment_id = ?
        `, [
          data.deployment?.errorMessage || 'Deployment failed',
          deploymentId
        ])
        
        console.log('❌ Deployment failed:', deploymentId)
        break
    }

    return NextResponse.json({ 
      received: true, 
      type: data.type,
      deployment_id: deploymentId,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET para verificar que el endpoint funciona
export async function GET() {
  return NextResponse.json({ 
    message: 'Vercel webhook endpoint ready',
    timestamp: new Date().toISOString()
  })
}