"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error("Credenciales inválidas")
      }

      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido a GoFish SpA",
      })

      onClose()
      router.refresh()
    } catch (error) {
      console.error("Error de inicio de sesión:", error)
      toast({
        title: "Error de inicio de sesión",
        description: "Credenciales inválidas. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Iniciar Sesión</DialogTitle>
          <DialogDescription>Ingresa tus credenciales para acceder a tu cuenta</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Link href="/forgot-password" className="text-sm text-[#005f73] hover:underline" onClick={onClose}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-[#005f73] hover:bg-[#003d4d]" disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Ingresar"}
          </Button>

          <div className="text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/register" className="text-[#005f73] hover:underline" onClick={onClose}>
              Regístrate
            </Link>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
