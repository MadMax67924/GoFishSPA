'use client'
import { useState, useEffect } from 'react'

interface DeploymentLog {
  id: number
  deployment_id: string
  environment: string
  status: 'started' | 'success' | 'failed' | 'rollback'
  timestamp: string
  error_message?: string
  user_activity_during_deploy: number
  database_health_check: boolean
  api_tests_passed: boolean
  deployment_duration_seconds?: number
}

interface DeploymentStats {
  total_deployments: number
  successful: number
  failed: number
  avg_duration: number
}

export default function DeploymentsPage() {
  const [logs, setLogs] = useState<DeploymentLog[]>([])
  const [stats, setStats] = useState<DeploymentStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchDeploymentLogs()
  }, [])

  const fetchDeploymentLogs = async () => {
    try {
      const response = await fetch('/api/admin/deployment-logs')
      const data = await response.json()
      
      if (data.success) {
        setLogs(data.logs || [])
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching deployment logs:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const refreshLogs = () => {
    setRefreshing(true)
    fetchDeploymentLogs()
  }

  const simulateDeployment = async () => {
    try {
      const response = await fetch('/api/admin/deployment-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ environment: 'production' })
      })
      
      if (response.ok) {
        // Refrescar logs después de 3 segundos
        setTimeout(() => {
          fetchDeploymentLogs()
        }, 3000)
      }
    } catch (error) {
      console.error('Error simulating deployment:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800 border-green-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      case 'rollback': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'started': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando logs de despliegue...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Despliegues</h1>
              <p className="text-gray-600 mt-1">Monitoreo de despliegues automáticos - GoFish SpA</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={refreshLogs}
                disabled={refreshing}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                {refreshing ? '🔄 Actualizando...' : '🔄 Actualizar'}
              </button>
              <button
                onClick={simulateDeployment}
                className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                🚀 Probar Despliegue
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total_deployments}</div>
                <div className="ml-auto text-blue-600">📊</div>
              </div>
              <p className="text-gray-600">Total Despliegues</p>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-green-600">{stats.successful}</div>
                <div className="ml-auto text-green-600">✅</div>
              </div>
              <p className="text-gray-600">Exitosos</p>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="ml-auto text-red-600">❌</div>
              </div>
              <p className="text-gray-600">Fallidos</p>
            </div>
            
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats.avg_duration ? Math.round(stats.avg_duration) : 'N/A'}s
                </div>
                <div className="ml-auto text-purple-600">⏱️</div>
              </div>
              <p className="text-gray-600">Duración Promedio</p>
            </div>
          </div>
        )}

        {/* Logs Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Logs de Despliegues Recientes</h2>
          </div>
          
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <p className="text-gray-500">No hay logs de despliegue disponibles</p>
              <button
                onClick={simulateDeployment}
                className="mt-4 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Crear primer despliegue
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deployment ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ambiente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health Checks</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {log.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {log.deployment_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(log.status)}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.environment}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.deployment_duration_seconds ? `${log.deployment_duration_seconds}s` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs rounded ${log.database_health_check ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            DB: {log.database_health_check ? '✅' : '❌'}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs rounded ${log.api_tests_passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            API: {log.api_tests_passed ? '✅' : '❌'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}