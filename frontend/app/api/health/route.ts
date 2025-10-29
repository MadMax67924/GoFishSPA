import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      services: {
        frontend: 'operational',
        api: 'operational',
        database: 'checking...'
      },
      features: {
        cicd: 'active',
        autoDeployment: 'pending-vercel-setup',
        healthMonitoring: 'active'
      }
    }
    
    return NextResponse.json(healthCheck, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      }, 
      { status: 503 }
    )
  }
}