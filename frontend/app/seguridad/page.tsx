"use client"

import { useState } from "react"

export default function SeguridadPage() {
  const [qr, setQr] = useState<string | null>(null)
  const [codigo, setCodigo] = useState("")
  const [mensaje, setMensaje] = useState("")

  // Generar QR
  const generarMFA = async () => {
    const res = await fetch("/api/auth/mfa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario: 1 }), // cambia este valor según el usuario logueado
    })
    const data = await res.json()
    if (data.qr) {
      setQr(data.qr)
      setMensaje("Escanea el código con Google Authenticator 📱")
    } else {
      setMensaje(data.message || "Error generando el código.")
    }
  }

  // Validar código ingresado
  const validarCodigo = async () => {
    const res = await fetch("/api/auth/mfa", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_usuario: 1, token: codigo }),
    })
    const data = await res.json()
    setMensaje(data.message)
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold text-[#005f73] mb-6">Seguridad de tu cuenta</h1>

      {!qr ? (
        <div className="text-center space-y-4">
          <button
            onClick={generarMFA}
            className="bg-[#005f73] text-white px-6 py-3 rounded hover:bg-[#003d4d]"
          >
            Activar verificación MFA
          </button>

          {/* ✅ Siempre visible, incluso sin código */}
          <button
            onClick={() => (window.location.href = "/")}
            className="block mx-auto bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 mt-6"
          >
            Volver al inicio
          </button>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <img src={qr} alt="Código QR MFA" className="mx-auto border rounded-lg p-2" />
          <p className="text-gray-700">{mensaje}</p>
          <input
            type="text"
            placeholder="Ingresa el código de 6 dígitos"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="border px-3 py-2 rounded w-full max-w-xs text-center"
          />
          <button
            onClick={validarCodigo}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Validar Código
          </button>

          {/* ✅ Siempre visible */}
          <button
            onClick={() => (window.location.href = "/")}
            className="block mx-auto bg-[#005f73] text-white px-6 py-2 rounded hover:bg-[#003d4d] mt-4"
          >
            Volver al inicio
          </button>
        </div>
      )}
    </main>
  )
}