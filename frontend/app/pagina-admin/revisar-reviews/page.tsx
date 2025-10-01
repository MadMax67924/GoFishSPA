"use client"

import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { useEffect, useState } from "react"
import { Check, X, AlertTriangle, Shield, Flag, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ContentModerator } from "@/utils/contentModeration"

interface ReviewAnalysis {
  profanityCount: number
  racistTerms: string[]
  threats: string[]
  inappropriate: boolean
  score: number
  reasons: string[]
}

interface Review {
  id: string
  texto: string
  imagen?: string
  fecha: string
}

//Maneja el funcionamiento de la pagina
export default function AdminReview() {
    const [reviews, setReviews] = useState<Review[]>([])
    const [analyses, setAnalyses] = useState<{[key: string]: ReviewAnalysis}>({})
    const [loading, setLoading] = useState<{[key: string]: boolean}>({})
    
    const [moderator] = useState(() => new ContentModerator())
    
    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/revisar-admin`)
            if (!res.ok) throw new Error('Error fetching reviews')
            const data = await res.json()
            setReviews(data)
            
            data.forEach((review: Review) => {
                analyzeReview(review.id, review.texto)
            })
        } catch (error) {
            console.error('Error fetching reviews:', error)
        }
    }
        
    useEffect(() => {
        fetchReviews()
    }, [])

    const analyzeReview = async (reviewId: string, text: string) => {
        setLoading(prev => ({...prev, [reviewId]: true}))
        
        try {
            const analysis = moderator.analyzeText(text)
            setAnalyses(prev => ({...prev, [reviewId]: analysis}))
        } catch (error) {
            console.error('Error analizando reseña:', error)
            const fallbackAnalysis = getFallbackAnalysis(text)
            setAnalyses(prev => ({...prev, [reviewId]: fallbackAnalysis}))
        } finally {
            setLoading(prev => ({...prev, [reviewId]: false}))
        }
    }

    const getFallbackAnalysis = (text: string): ReviewAnalysis => {
        const lowerText = text.toLowerCase()
        const hasCommonProfanity = /mierda|coño|puta|carajo|joder|cabrón/i.test(lowerText)
        const hasThreats = /matar|golpear|juro que te|arrepentirás/i.test(lowerText)
        
        return {
            profanityCount: hasCommonProfanity ? 1 : 0,
            racistTerms: [],
            threats: hasThreats ? ['Amenaza detectada'] : [],
            inappropriate: hasCommonProfanity || hasThreats,
            score: hasThreats ? 0.7 : hasCommonProfanity ? 0.4 : 0,
            reasons: [
                ...(hasCommonProfanity ? ['Lenguaje inapropiado'] : []),
                ...(hasThreats ? ['Posible amenaza'] : [])
            ]
        }
    }

    const getRiskLevel = (analysis: ReviewAnalysis) => {
        if (!analysis) return "unknown"
        if (analysis.score >= 0.7) return "high"
        if (analysis.score >= 0.4) return "medium"
        if (analysis.score >= 0.1) return "low"
        return "none"
    }

    const getRiskColor = (level: string) => {
        switch (level) {
            case "high": return "bg-red-100 border-red-300 text-red-800"
            case "medium": return "bg-orange-100 border-orange-300 text-orange-800"
            case "low": return "bg-yellow-100 border-yellow-300 text-yellow-800"
            case "none": return "bg-green-100 border-green-300 text-green-800"
            default: return "bg-gray-100 border-gray-300 text-gray-800"
        }
    }

    const getRiskIcon = (level: string) => {
        switch (level) {
            case "high": return AlertTriangle
            case "medium": return Shield
            case "low": return Flag
            case "none": return CheckCircle
            default: return Clock
        }
    }

    const handleSuccess = async (id: string) => {
        const state = 1
        try {
            const reviewRes = await fetch("/api/revisar-admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, state }),
            })
            
            if (!reviewRes.ok) throw new Error("Error aprobando reseña")
            
            alert("La reseña fue aprobada")
            window.location.reload()
        } catch (error) {
            console.error('Error:', error)
            alert("Error al aprobar la reseña")
        }
    }

    const handleFailure = async (id: string) => {
        const state = 0
        try {
            const reviewRes = await fetch("/api/revisar-admin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, state }),
            })
            
            if (!reviewRes.ok) throw new Error("Error rechazando reseña")
            
            alert("La reseña fue rechazada")
            window.location.reload()
        } catch (error) {
            console.error('Error:', error)
            alert("Error al rechazar la reseña")
        }
    }

    const getModerationStats = () => {
        const total = reviews.length
        const analyzed = Object.keys(analyses).length
        const highRisk = Object.values(analyses).filter(a => getRiskLevel(a) === 'high').length
        const mediumRisk = Object.values(analyses).filter(a => getRiskLevel(a) === 'medium').length
        const clean = Object.values(analyses).filter(a => getRiskLevel(a) === 'none').length
        const pending = total - analyzed

        return { total, analyzed, highRisk, mediumRisk, clean, pending }
    }

    const stats = getModerationStats()

    if (!reviews || reviews.length === 0) {
        return (
            <>
                <Header/>
                <main className="min-h-screen pt-24 pb-16 bg-gray-50">
                    <div className="container mx-auto px-4">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 text-center border border-green-100 shadow-sm">
                            <h3 className="text-3xl font-bold text-green-800 mb-4">
                                No hay reseñas que moderar
                            </h3>
                            <p className="text-green-600 text-lg">
                                Todas las reseñas han sido revisadas y moderadas.
                            </p>
                        </div>
                    </div>
                </main>
                <Footer/>
            </>
        )
    }

    return (
        <>
            <Header/>
            <main className="min-h-screen pt-24 pb-16 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 text-center border border-green-100 mb-8">
                        <h2 className="text-3xl font-bold text-green-800 mb-2">
                            Panel de Moderación
                        </h2>
                        <p className="text-green-600 mb-4">
                            Sistema de análisis basado en reglas personalizadas
                        </p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            <div className="bg-white rounded-lg p-4 border border-green-200">
                                <div className="text-2xl font-bold text-green-800">{stats.total}</div>
                                <div className="text-sm text-green-600">Total reseñas</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-blue-200">
                                <div className="text-2xl font-bold text-blue-800">{stats.analyzed}</div>
                                <div className="text-sm text-blue-600">Analizadas</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-red-200">
                                <div className="text-2xl font-bold text-red-800">{stats.highRisk + stats.mediumRisk}</div>
                                <div className="text-sm text-red-600">Con alertas</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-green-200">
                                <div className="text-2xl font-bold text-green-800">{stats.clean}</div>
                                <div className="text-sm text-green-600">Limpias</div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 mt-6 text-sm">
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-1">
                                <CheckCircle className="h-4 w-4" />
                                Contenido seguro
                            </div>
                            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center gap-1">
                                <Flag className="h-4 w-4" />
                                Riesgo bajo
                            </div>
                            <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full flex items-center gap-1">
                                <Shield className="h-4 w-4" />
                                Riesgo medio
                            </div>
                            <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4" />
                                Riesgo alto
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {reviews.map((review) => {
                            const analysis = analyses[review.id]
                            const riskLevel = getRiskLevel(analysis)
                            const riskColor = getRiskColor(riskLevel)
                            const RiskIcon = getRiskIcon(riskLevel)
                            
                            return (
                                <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${riskColor}`}>
                                                <RiskIcon className="h-4 w-4" />
                                                <span className="text-sm font-medium capitalize">
                                                    {loading[review.id] ? "Analizando..." : 
                                                     riskLevel === "unknown" ? "Pendiente" : 
                                                     `Riesgo ${riskLevel}`}
                                                </span>
                                            </div>
                                            
                                            {analysis && (
                                                <div className="text-sm text-gray-600">
                                                    Puntuación: <span className="font-semibold">{(analysis.score * 100).toFixed(0)}%</span>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-sm text-gray-500">
                                            {new Date(review.fecha).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    <div className="mb-4">
                                        <p className="text-gray-700 leading-relaxed text-lg">{review.texto}</p>
                                    </div>

                                    {analysis && analysis.reasons.length > 0 && (
                                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                                                <AlertTriangle className="h-4 w-4" />
                                                Alertas detectadas:
                                            </h4>
                                            <div className="space-y-1">
                                                {analysis.reasons.map((reason, index) => (
                                                    <div key={index} className="text-sm text-red-700 flex items-center gap-2">
                                                        • {reason}
                                                        {reason.includes('Lenguaje vulgar') && analysis.profanityCount > 0 && (
                                                            <span className="text-xs bg-red-200 px-2 py-1 rounded">
                                                                {analysis.profanityCount} palabra(s)
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {analysis && analysis.reasons.length === 0 && !loading[review.id] && (
                                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4" />
                                                Análisis completado
                                            </h4>
                                            <p className="text-sm text-green-700">
                                                No se detectó contenido inapropiado en esta reseña.
                                            </p>
                                        </div>
                                    )}

                                    {review.imagen && (
                                        <div className="mb-4">
                                            <img
                                                src={review.imagen}
                                                alt="Imagen de la reseña"
                                                className="w-48 h-48 object-cover rounded-lg border border-gray-200 shadow-sm"
                                            />
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                                        <div className="text-xs text-gray-500">
                                            ID: {review.id}
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <Button
                                                onClick={() => handleSuccess(review.id)}
                                                className="inline-flex items-center gap-3 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg transition-colors text-lg font-medium shadow-sm"
                                            >
                                                <Check className="h-6 w-6" />
                                                Aprobar
                                            </Button>
                                            <Button 
                                                onClick={() => handleFailure(review.id)}
                                                className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg transition-colors text-lg font-medium shadow-sm"
                                            >
                                                <X className="h-6 w-6" />
                                                Rechazar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </main>
            <Footer/>
        </>
    )
}