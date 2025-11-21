'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Sugerencia {
  id: string
  texto: string
  imagen?: string
  fecha: string
  estado: 'pendiente' | 'revisar_despues' | 'aprobada' | 'rechazada'  // ← Actualizado
}

export default function GestionarSugerenciasPage() {
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('todas')

  useEffect(() => {
    fetchSugerencias()
  }, [])

  const fetchSugerencias = async () => {
    try {
      const response = await fetch('/api/admin/sugerencias')
      if (response.ok) {
        const data = await response.json()
        setSugerencias(data)
      }
    } catch (error) {
      console.error('Error al cargar sugerencias:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEstadoChange = async (id: string, nuevoEstado: string) => {
    try {
      const response = await fetch('/api/admin/sugerencias/estado', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, estado: nuevoEstado })
      })

      if (response.ok) {
        fetchSugerencias()
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'aprobada': return 'bg-green-100 text-green-800 border-green-200'
      case 'rechazada': return 'bg-red-100 text-red-800 border-red-200'
      case 'revisar_despues': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatEstado = (estado: string) => {
    switch (estado) {
      case 'revisar_despues': return 'Ver más tarde'
      case 'aprobada': return 'Aprobada'
      case 'rechazada': return 'Rechazada'
      case 'pendiente': return 'Pendiente'
      default: return estado
    }
  }

  const filteredSugerencias = sugerencias.filter(s => 
    filter === 'todas' || s.estado === filter
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando sugerencias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/pagina-admin">
                <button className="mr-4 p-2 hover:bg-gray-100 rounded-lg">
                  <ArrowLeft className="h-5 w-5" />
                </button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Sugerencias</h1>
                <p className="text-gray-600 mt-1">Revisa y gestiona las sugerencias de los usuarios</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Total: {sugerencias.length}
            </div>
          </div>
        </div>

        {/* Filtros actualizados */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex space-x-2">
            {['todas', 'pendiente', 'revisar_despues', 'aprobada', 'rechazada'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {/* Cambiar la lógica de visualización aquí */}
                {status === 'revisar_despues' ? 'Ver más tarde' : 
                 status === 'todas' ? 'Todas' :
                 status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="ml-2 text-xs">
                  ({status === 'todas' ? sugerencias.length : sugerencias.filter(s => s.estado === status).length})
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredSugerencias.length === 0 ? (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <p className="text-gray-500">No hay sugerencias en esta categoría</p>
            </div>
          ) : (
            filteredSugerencias.map((sugerencia) => (
              <div key={sugerencia.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Sugerencia #{sugerencia.id.slice(-8)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(sugerencia.fecha).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(sugerencia.estado)}`}>
                    {formatEstado(sugerencia.estado)}  {/* ← Cambio aquí */}
                  </span>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-gray-700">{sugerencia.texto}</p>
                </div>

                {sugerencia.imagen && (
                  <div className="mb-4">
                    <img
                      src={sugerencia.imagen}
                      alt="Imagen de la sugerencia"
                      className="max-w-xs rounded-lg shadow-sm"
                    />
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEstadoChange(sugerencia.id, 'aprobada')}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleEstadoChange(sugerencia.id, 'rechazada')}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => handleEstadoChange(sugerencia.id, 'revisar_despues')}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
                  >
                    Ver más tarde
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}