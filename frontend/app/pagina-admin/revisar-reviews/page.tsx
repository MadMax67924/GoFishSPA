"use client"

import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import { useEffect, useState } from "react"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"


//Maneja el funcionamiento de la pagina 
export default function AdminReview() {
    const [reviews, setReviews] = useState<any[]>([])
    const fetchReviews = async () => {
        const res = await fetch(`/api/revisar-admin`)
        const data = await res.json()
        setReviews(data)
    }
        
    useEffect(() => {
        fetchReviews()
    }, [])

    const handleSuccess = async (id: string) => {
        const state = 1
        
        const reviewRes = await fetch("/api/revisar-admin", {
        method: "POST",
        body: JSON.stringify({ id, state }),
        headers: { "Content-Type": "application/json" },
        })
        if (!reviewRes.ok) throw new Error("Error handle success")
        if (reviewRes.ok) {
            alert("La reseña fue aprovada");
            window.location.reload();
        }
        return
    }
    const handleFailure = async (id: string) => {
        const state  = 0
        const reviewRes = await fetch("/api/revisar-admin", {
        method: "POST",
        body: JSON.stringify({ id, state  }),
        headers: { "Content-Type": "application/json" },
        })
        if (!reviewRes.ok) throw new Error("Error handle failure")
        if (reviewRes.ok) {
            alert("La reseña fue rechazada");
            window.location.reload();
        }
        return
    }

    if (!reviews || reviews.length === 0) {return (
    <>
        <Header/>
            <main className="min-h-screen pt-24 pb-16">
                <div className="container mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <h3 className="text-3xl font-bold text-[#005f73] mb-2">
                            No hay reseñas que moderar.
                        </h3>
                    </div>
                </div>
            </main>
        <Footer/>
    </>)}
    return (
        <>
        <Header/>
            <main className="min-h-screen pt-24 pb-16">
                <div className="container mx-auto px-4">
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <h3 className="text-3xl font-bold text-[#005f73] mb-2">Reseñas</h3>
                {reviews.map((review) => (
                    <div key={review.id} className="mb-4 p-2 border rounded">
                        <p>{review.texto}</p>
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                {review.imagen && (
                                    <img
                                    src={review.imagen}
                                    alt="Imagen reseña"
                                    className="w-32 h-32 object-cover my-2"
                                    />
                                )}
                                <Button
                                variant="ghost"
                                className="inline-flex items-center gap-2 bg-[#01C009] text-white px-20 py-8 rounded-lg hover:bg-[#008A06] transition-colors text-xl"
                                onClick = {() => handleSuccess(review.id)}>
                                    <Check className="h-20 w-20 mr-2 "/>
                                </Button>
                                <Button variant="ghost"
                                    className="inline-flex items-center gap-2 bg-[#FF0A0A] text-white px-20 py-8 rounded-lg hover:bg-[#B70101] transition-colors text-xl"
                                    onClick = {() => handleFailure(review.id)}>
                                    <X className="h-20 w-20 mr-2 "/>
                                </Button>
                                </div>
                            </div>
                        </div>
                        <small className="text-gray-500">{review.fecha}</small>
                    </div>
                ))}
        </div>
        </div>
        </main>
        <Footer/>
        </>
    )
    }