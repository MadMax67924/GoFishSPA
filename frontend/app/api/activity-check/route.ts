import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    // Verificar conectividad con base de datos
    const healthCheck = await executeQuery('SELECT 1 as status, NOW() as timestamp') as any[]
    
    // Verificar que las tablas críticas existen
    const tablesCheck = await executeQuery(`
      SELECT COUNT(*) as table_count 
      FROM information_schema.tables 
      WHERE table_schema = 'gofish' 
      AND table_name IN ('products', 'users', 'user_wishlist', 'reviews')
    `) as any[]

    // Verificar que hay datos básicos
    const productsCount = await executeQuery('SELECT COUNT(*) as count FROM products') as any[]
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      timestamp: healthCheck[0]?.timestamp,
      tables_available: tablesCheck[0]?.table_count,
      products_count: productsCount[0]?.count,
      deployment_ready: true
    })
    
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      deployment_ready: false
    }, { status: 503 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { deployment_id, environment } = await req.json()
    
    // Log del nuevo despliegue
    await executeQuery(`
      INSERT INTO deployment_logs (deployment_id, environment, status, timestamp) 
      VALUES (?, ?, 'started', NOW())
    `, [deployment_id, environment])
    
    return NextResponse.json({ 
      logged: true, 
      deployment_id,
      message: 'Deployment started and logged'
    })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to log deployment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}