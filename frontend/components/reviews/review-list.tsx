"use client"
import React from "react"

interface Review {
  id: string
  texto: string
  imagen?: string
  fecha: string
  rating: number
}

//Maneja la logica para mostrar el tipo de estrella correcta, por ejemplo, maneja que si hay decimales en el promedio
//se muestre una estrella a la mitad
function StarDisplay({ rating, size = "md", showNumber = false }: { 
  rating: number, 
  size?: "sm" | "md" | "lg",
  showNumber?: boolean 
}) {
  const sizeClasses = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-2xl"
  }

  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: fullStars }).map((_, i) => (
        <span key={`full-${i}`} className={`${sizeClasses[size]} text-yellow-400`}>
          ★
        </span>
      ))}
      
      {hasHalfStar && (
        <span className={`${sizeClasses[size]} text-yellow-400`}>
          ★
        </span>
      )}
  
      {Array.from({ length: emptyStars }).map((_, i) => (
        <span key={`empty-${i}`} className={`${sizeClasses[size]} text-gray-300`}>
          ★
        </span>
      ))}
      
      {showNumber && (
        <span className={`text-gray-700 font-medium ml-2 ${
          size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base"
        }`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}


//Muestra las reviews que le entregan
export default function ReviewList({ reviews }: { reviews: Review[] }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <StarDisplay rating={0} size="lg" showNumber={true} />
        <p className="text-gray-500 text-lg mt-2">No hay reseñas aún</p>
      </div>
    )
  }

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 text-center border border-green-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Valoración del producto</h2>
        <div className="flex items-center justify-center space-x-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-green-800 mb-2">{averageRating.toFixed(1)}</div>
            <StarDisplay rating={averageRating} size="lg" />
            <div className="text-sm text-green-600 mt-2">
              Basado en {reviews.length} opinión{reviews.length !== 1 ? 'es' : ''}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800">Opiniones de clientes</h3>
        {reviews.map((review) => (
          <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-3">
                <StarDisplay rating={review.rating} size="sm" showNumber={true} />
              </div>
              <span className="text-sm text-gray-500">
                {new Date(review.fecha).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            <p className="text-gray-700 leading-relaxed">{review.texto}</p>
            {review.imagen && (
              <img
                src={review.imagen}
                alt="Reseña"
                className="w-32 h-32 object-cover rounded-lg mt-3 border"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}