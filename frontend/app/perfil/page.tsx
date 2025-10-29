"use client"

import { useEffect, useState } from "react"

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<any>(null)
  const [mfaActivo, setMfaActivo] = useState<boolean | null>(null)

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Obtener info básica del usuario logueado
        const userRes = await fetch("/api/auth/me")
        const userData = await userRes.json()
        setUsuario(userData.user)

        // Verificar si el MFA está activo
        const mfaRes = await fetch("/api/auth/mfa/status")
        const mfaData = await mfaRes.json()
        setMfaActivo(mfaData.activo)
      } catch (error) {
        console.error("Error cargando datos del perfil:", error)
      }
    }

    cargarDatos()
  }, [])

  if (!usuario) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando información del perfil...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-[#005f73] mb-6">Perfil de Usuario</h1>

      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md space-y-4 text-center border">
        <p className="text-lg">
          <strong>Nombre:</strong> {usuario.name}
        </p>
        <p className="text-lg">
          <strong>Correo:</strong> {usuario.email}
        </p>
        <p className="text-lg">
          <strong>Rol:</strong> {usuario.role}
        </p>
        <p className="text-lg">
          <strong>Autenticación MFA:</strong>{" "}
          {mfaActivo ? (
            <span className="text-green-600 font-semibold">Activada ✅</span>
          ) : (
            <span className="text-red-600 font-semibold">No activada ❌</span>
          )}
        </p>

        <button
          onClick={() => (window.location.href = "/seguridad")}
          className="bg-[#005f73] text-white px-6 py-3 rounded hover:bg-[#003d4d] w-full"
        >
          Configurar verificación en dos pasos 🔐
        </button>
      </div>

      <button
        onClick={() => (window.location.href = "/")}
        className="mt-6 bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-700"
      >
        Volver al inicio
      </button>
    </main>
  )
}
