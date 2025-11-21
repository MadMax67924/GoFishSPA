import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

export async function GET(req: NextRequest) {
  try {
    // Obtener todos los logs de despliegue ordenados por fecha
    const logs = await executeQuery(`
      SELECT 
        id,
        deployment_id,
        environment,
        status,
        timestamp,
        error_message,
        user_activity_during_deploy,
        database_health_check,
        api_tests_passed,
        deployment_duration_seconds
      FROM deployment_logs 
      ORDER BY timestamp DESC 
      LIMIT 50
    `) as any[]

    // Obtener estadísticas
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_deployments,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        AVG(deployment_duration_seconds) as avg_duration
      FROM deployment_logs 
      WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `) as any[]

    return NextResponse.json({
      logs,
      stats: stats[0],
      success: true
    })

  } catch (error) {
    console.error('Error fetching deployment logs:', error)
    return NextResponse.json({
      error: 'Failed to fetch deployment logs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Simular un nuevo despliegue (para testing)
export async function POST(req: NextRequest) {
  try {
    const { environment = 'production' } = await req.json()
    const deployment_id = `dep_${Date.now()}`
    
    // Registrar inicio de despliegue
    await executeQuery(`
      INSERT INTO deployment_logs 
      (deployment_id, environment, status, database_health_check, api_tests_passed) 
      VALUES (?, ?, 'started', TRUE, TRUE)
    `, [deployment_id, environment])

    // Simular proceso de despliegue
    setTimeout(async () => {
      try {
        await executeQuery(`
          UPDATE deployment_logs 
          SET status = 'success', deployment_duration_seconds = 45
          WHERE deployment_id = ?
        `, [deployment_id])
      } catch (error) {
        console.error('Error updating deployment status:', error)
      }
    }, 2000)

    return NextResponse.json({
      deployment_id,
      status: 'started',
      message: 'Deployment simulation started'
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Failed to simulate deployment',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}