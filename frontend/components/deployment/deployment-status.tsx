'use client'
import { useDeploymentStatus } from '@/hooks/use-deployment-status'

export function DeploymentStatusIndicator() {
  const { isHealthy, lastCheck, deploymentReady, loading } = useDeploymentStatus()

  if (loading && !lastCheck) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span>Verificando estado del sistema...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-2 text-sm">
      {/* Indicador visual */}
      <div className={`w-2 h-2 rounded-full ${
        isHealthy && deploymentReady 
          ? 'bg-green-500' 
          : 'bg-red-500'
      }`}></div>
      
      {/* Estado del sistema */}
      <span className={`${
        isHealthy && deploymentReady 
          ? 'text-green-700' 
          : 'text-red-700'
      }`}>
        {isHealthy && deploymentReady 
          ? 'Sistema operativo' 
          : 'Sistema en mantenimiento'
        }
      </span>
      
      {/* Última verificación */}
      {lastCheck && (
        <span className="text-gray-500">
          • Última verificación: {lastCheck.toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}