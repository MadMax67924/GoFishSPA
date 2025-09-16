"use client"
import React, { useState } from "react"

export default function ReviewForm({ productId, onNewReview }: { productId: string, onNewReview: () => void }) {
  const [texto, setTexto] = useState("")
  const [imagen, setImagen] = useState<File | null>(null)
  const [subiendo, setSubiendo] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubiendo(true)
    let imagenUrl = ""
    if (imagen) {
      const formData = new FormData()
      formData.append("file", imagen)
      const res = await fetch("/api/reviews/upload", { method: "POST", body: formData })
      const data = await res.json()
      imagenUrl = data.url
    }
    await fetch("/api/reviews", {
      method: "POST",
      body: JSON.stringify({ productId, texto, imagen: imagenUrl }),
      headers: { "Content-Type": "application/json" },
    })
    setTexto("")
    setImagen(null)
    setSubiendo(false)
    onNewReview()
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Escribe tu reseña"
        className="w-full border rounded p-2 mb-2"
        required
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImagen(e.target.files?.[0] || null)}
        className="mb-2"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded" disabled={subiendo}>
        {subiendo ? "Enviando..." : "Enviar reseña"}
      </button>
    </form>
  )
}