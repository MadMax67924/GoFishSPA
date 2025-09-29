"use client"
import React, { useState } from "react"

export default function ReviewForm({ productId, onNewReview }: { productId: string, onNewReview: () => void }) {
  const [texto, setTexto] = useState("")
  const [imagen, setImagen] = useState<File | null>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState("")
  //Si se ingresa una imagen esta es mandada por post a reviews para que se guarde en los archivos locales retornando su url
  //Despues de eso ingresa todos los datos necesarios como POST a upload para ser ingresados a la base de datos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubiendo(true)
    setError("")
    
    try {
      let imagenUrl = ""
      
      if (imagen) {
        const formData = new FormData()
        formData.append("file", imagen)
        const res = await fetch("/api/reviews", { method: "POST", body: formData })
        
        if (!res.ok) throw new Error("Error subiendo imagen")
        
        const data = await res.json()
        imagenUrl = data.url
      }
      
      const reviewRes = await fetch("/api/reviews/upload", {
        method: "POST",
        body: JSON.stringify({ productId, texto, imagen: imagenUrl }),
        headers: { "Content-Type": "application/json" },
      })
      
      if (!reviewRes.ok) throw new Error("Error creando reseña")
      
      setTexto("")
      setImagen(null)
      onNewReview()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Escribe tu reseña"
        className="w-full border rounded p-2 mb-2"
        required
        disabled={subiendo}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImagen(e.target.files?.[0] || null)}
        className="mb-2"
        disabled={subiendo}
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50" disabled={subiendo}>
        {subiendo ? "Enviando..." : "Enviar reseña"}
      </button>
    </form>
  )
}