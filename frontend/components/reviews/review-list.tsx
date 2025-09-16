"use client"
import React from "react"

interface Review {
  id: string
  texto: string
  imagen?: string
  fecha: string
}

export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (!reviews || reviews.length === 0) return <p>No hay reseñas aún.</p>
  return (
    <div>
      <h3 className="font-bold mb-2">Reseñas</h3>
      {reviews.map((review) => (
        <div key={review.id} className="mb-4 p-2 border rounded">
          <p>{review.texto}</p>
          {review.imagen && (
            <img
              src={review.imagen}
              alt="Imagen reseña"
              className="w-32 h-32 object-cover my-2"
            />
          )}
          <small className="text-gray-500">{review.fecha}</small>
        </div>
      ))}
    </div>
  )
}