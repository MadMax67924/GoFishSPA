'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    } else {
      setStatus('error')
      setMessage('Enlace de verificación inválido. Por favor, solicita un nuevo enlace.')
    }
  }, [token])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`/api/auth/verify-email?token=${token}`)
      
      if (response.ok) {
        setStatus('success')
        setMessage('¡Email verificado exitosamente! Ya puedes iniciar sesión.')
        
        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } else {
        const data = await response.json()
        setStatus('error')
        setMessage(data.error || 'Error al verificar el email. Por favor, intenta nuevamente.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Error de conexión. Por favor, verifica tu internet e intenta nuevamente.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verificando tu email</h2>
            <p className="text-gray-600">Estamos confirmando tu dirección de correo electrónico...</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Email Verificado!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">Serás redirigido automáticamente al login...</p>
            </div>
            <button 
              onClick={() => router.push('/login')}
              className="mt-6 w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Ir al Login
            </button>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">✗</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Error de Verificación</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/register')}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Volver al Registro
              </button>
              <button 
                onClick={() => router.push('/login')}
                className="w-full bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 font-medium"
              >
                Ir al Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}