'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null)
  const [lockoutEnd, setLockoutEnd] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setRemainingAttempts(null)
    setLockoutEnd(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Login exitoso
        router.push('/')
      } else {
        // Mostrar mensajes específicos del backend
        setError(data.error || 'Error al iniciar sesión')
        
        // Mostrar intentos restantes si existen
        if (data.remainingAttempts !== undefined) {
          setRemainingAttempts(data.remainingAttempts)
        }
        
        // Mostrar información de bloqueo si existe
        if (data.accountLocked && data.lockoutEnd) {
          setLockoutEnd(data.lockoutEnd)
        }
        
        // Redirigir a verificación si el email no está verificado
        if (data.needsVerification) {
          router.push('/auth/verify-email?message=verify_required')
        }
      }
    } catch (error) {
      setError('Error de conexión. Por favor, intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const formatLockoutTime = (lockoutEnd: string) => {
    const endTime = new Date(lockoutEnd)
    const now = new Date()
    const minutesLeft = Math.ceil((endTime.getTime() - now.getTime()) / (1000 * 60))
    return minutesLeft
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Mensajes de error */}
          {error && (
            <div className={`p-4 rounded-md ${
              lockoutEnd ? 'bg-red-100 border border-red-300' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="text-red-700 font-medium">{error}</div>
              
              {/* Intentos restantes */}
              {remainingAttempts !== null && remainingAttempts > 0 && (
                <div className="mt-2 text-red-600 text-sm">
                  Intentos restantes: <strong>{remainingAttempts}</strong>
                </div>
              )}
              
              {/* Tiempo de bloqueo */}
              {lockoutEnd && (
                <div className="mt-2 text-red-600 text-sm">
                  La cuenta estará bloqueada por {formatLockoutTime(lockoutEnd)} minutos
                </div>
              )}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !!lockoutEnd}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>

          <div className="text-center">
            <a href="/register" className="text-blue-600 hover:text-blue-500 text-sm">
              ¿No tienes cuenta? Regístrate
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}