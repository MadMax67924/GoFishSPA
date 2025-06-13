"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // En una implementación real, aquí se enviaría una solicitud a la API
      // para enviar un correo de restablecimiento de contraseña

      // Simulamos una respuesta exitosa
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsSubmitted(true)
      toast({
        title: "Correo enviado",
        description: "Revisa tu bandeja de entrada para restablecer tu contraseña",
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: "No se pudo enviar el correo de restablecimiento",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Recuperar contraseña</h1>
          <p className="mt-2 text-gray-600">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <Button type="submit" className="w-full bg-[#005f73] hover:bg-[#003d4d]" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Enviar enlace de recuperación"}
            </Button>

            <div className="text-center mt-4">
              <Link href="/" className="text-[#005f73] hover:underline">
                Volver al inicio de sesión
              </Link>
            </div>
          </form>
        ) : (
          <div className="mt-8 text-center">
            <div className="mb-4 text-green-600 text-lg">¡Correo enviado con éxito!</div>
            <p className="mb-6">
              Hemos enviado un enlace de recuperación a <strong>{email}</strong>. Por favor, revisa tu bandeja de
              entrada y sigue las instrucciones.
            </p>
            <Link href="/">
              <Button className="bg-[#005f73] hover:bg-[#003d4d]">Volver al inicio</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
