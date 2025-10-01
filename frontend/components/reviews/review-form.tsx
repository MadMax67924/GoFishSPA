"use client"
import React, { useState } from "react"

export default function ReviewForm({ productId, onNewReview }: { productId: string, onNewReview: () => void }) {
  const [texto, setTexto] = useState("")
  const [imagen, setImagen] = useState<File | null>(null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState("")

  //Si se ingresa una imagen esta es mandada por post a reviews para que se guarde en los archivos locales retornando su url
  //Despues de eso ingresa todos los datos necesarios como POST a upload para ser ingresados a la base de datos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      setError("Por favor selecciona una calificación con estrellas")
      return
    }
    
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
        body: JSON.stringify({ 
          productId, 
          texto, 
          imagen: imagenUrl,
          rating 
        }),
        headers: { "Content-Type": "application/json" },
      })
      
      if (!reviewRes.ok) throw new Error("Error creando reseña")
      
      setTexto("")
      setImagen(null)
      setRating(0)
      onNewReview()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-3">Escribe tu reseña</h3>
      
      {error && (
        <div className="text-red-500 mb-3 p-2 bg-red-50 rounded border border-red-200">
          {error}
        </div>
      )}
      
      <div className="flex items-center space-x-1 mb-3">
        <span className="text-sm font-medium text-gray-700 mr-2">Calificación:</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-2xl ${
              star <= (hoverRating || rating)
                ? "text-yellow-400"
                : "text-gray-300"
            } transition-colors duration-150 focus:outline-none`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            disabled={subiendo}
          >
            ★
          </button>
        ))}
        <span className="text-sm text-gray-500 ml-2">
          {rating > 0 ? `(${rating} estrella${rating > 1 ? 's' : ''})` : ""}
        </span>
      </div>
      
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Comparte tu experiencia con este producto..."
        className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        rows={4}
        required
        disabled={subiendo}
      />
      
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Agregar imagen (opcional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImagen(e.target.files?.[0] || null)}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          disabled={subiendo}
        />
      </div>
      
      <button 
        type="submit" 
        className="bg-blue-600 hover  :bg-blue-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200" 
        disabled={subiendo || rating === 0}
      >
        {subiendo ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Enviando...
          </span>
        ) : (
          "Enviar reseña"
        )}
      </button>
    </form>
  )
}