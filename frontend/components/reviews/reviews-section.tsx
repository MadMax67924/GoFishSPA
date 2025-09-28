"use client"
import React, { useState, useEffect } from "react"
import ReviewForm from "./review-form"
import ReviewList from "./review-list"

interface Review {
  id: string
  texto: string
  imagen?: string
  fecha: string
}

export default function ReviewsSection({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews/upload?productId=${productId}`)
      if (res.ok) {
        const data = await res.json()
        setReviews(data)
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [productId])

  if (loading) return <div>Cargando reseñas...</div>

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Reseñas del Producto</h2>
      <ReviewForm productId={productId} onNewReview={fetchReviews} />
      <ReviewList reviews={reviews} />
    </div>
  )
}

// En tu página de producto
import ReviewsSection from "@/components/reviews/reviews-section"

export default function ProductPage({ params }: { params: { id: string } }) {
  return (
    <div>
      {/* ...otros contenidos del producto... */}
      <ReviewsSection productId={params.id} />
    </div>
  )
}