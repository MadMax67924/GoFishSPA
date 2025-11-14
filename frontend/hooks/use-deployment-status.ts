import { useState, useEffect } from 'react'

interface DeploymentStatus {
  isHealthy: boolean
  lastCheck: Date | null
  deploymentReady: boolean
  loading: boolean
}

export function useDeploymentStatus() {
  const [status, setStatus] = useState<DeploymentStatus>({
    isHealthy: true,
    lastCheck: null,
    deploymentReady: true,
    loading: false
  })

  useEffect(() => {
    const checkStatus = async () => {
      setStatus(prev => ({ ...prev, loading: true }))
      
      try {
        const response = await fetch('/api/activity-check')
        const data = await response.json()
        
        setStatus({
          isHealthy: response.ok,
          lastCheck: new Date(),
          deploymentReady: data.deployment_ready,
          loading: false
        })
      } catch (error) {
        setStatus({
          isHealthy: false,
          lastCheck: new Date(),
          deploymentReady: false,
          loading: false
        })
      }
    }

    // Verificar estado cada 30 segundos
    checkStatus()
    const interval = setInterval(checkStatus, 30000)

    return () => clearInterval(interval)
  }, [])

  return status
}