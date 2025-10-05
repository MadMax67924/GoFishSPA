'use client'

import { useState } from 'react'

interface SensitiveDataFormProps {
  userId: number
}

export default function SensitiveDataForm({ userId }: SensitiveDataFormProps) {
  const [dataType, setDataType] = useState('credit_card')
  const [sensitiveData, setSensitiveData] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/sensitive-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          dataType,
          sensitiveData,
          description
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage('✅ Datos almacenados de forma segura')
        setSensitiveData('')
        setDescription('')
      } else {
        setMessage(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      setMessage('❌ Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Almacenar Datos Sensibles</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Dato
          </label>
          <select
            value={dataType}
            onChange={(e) => setDataType(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            <option value="credit_card">Tarjeta de Crédito</option>
            <option value="bank_account">Cuenta Bancaria</option>
            <option value="personal_document">Documento Personal</option>
            <option value="medical_info">Información Médica</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Datos Sensibles
          </label>
          <textarea
            value={sensitiveData}
            onChange={(e) => setSensitiveData(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="Ingresa los datos sensibles aquí..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción (opcional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Ej: Tarjeta principal, Cuenta de ahorros..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Cifrando y Guardando...' : '🔒 Guardar de Forma Segura'}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>🔐 Los datos se cifran con AES-256-GCM antes de almacenarse</p>
      </div>
    </div>
  )
}