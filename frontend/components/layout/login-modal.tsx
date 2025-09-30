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
import { Eye, EyeOff, AlertTriangle, Mail } from "lucide-react"



interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [accountStatus, setAccountStatus] = useState<{
    needsVerification?: boolean
    accountLocked?: boolean
    lockoutEnd?: string
    remainingAttempts?: number
  }>({})

  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar errores cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})
    setAccountStatus({})

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Inicio de sesión exitoso",
          description: data.message || "Bienvenido a GoFish SpA",
        })
        onClose()
        router.refresh()
        if(data.user.email == "admin@gofish.cl") {
          router.push('/pagina-admin')
        }
      } else {
        // Caso 6: Mostrar Error al Usuario en Login Fallido
        if (data.field) {
          setErrors({ [data.field]: data.error })
        }

        // Manejar estados especiales de la cuenta
        if (data.needsVerification) {
          setAccountStatus({ needsVerification: true })
        } else if (data.accountLocked) {
          setAccountStatus({
            accountLocked: true,
            lockoutEnd: data.lockoutEnd,
          })
        } else if (data.remainingAttempts !== undefined) {
          setAccountStatus({ remainingAttempts: data.remainingAttempts })
        }

        if (!data.field) {
          toast({
            title: "Error de inicio de sesión",
            description: data.error,
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error de inicio de sesión:", error)
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servidor. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resendVerification = async () => {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Correo reenviado",
          description: data.message,
        })
      } else {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al reenviar el correo de verificación",
        variant: "destructive",
      })
    }
  }

  const formatLockoutTime = (lockoutEnd: string) => {
    const end = new Date(lockoutEnd)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    const minutes = Math.ceil(diff / (1000 * 60))
    return minutes > 0 ? `${minutes} minutos` : "unos momentos"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Iniciar Sesión</DialogTitle>
          <DialogDescription>Ingresa tus credenciales para acceder a tu cuenta</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Campo Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              className={errors.email ? "border-red-500" : ""}
              required
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          {/* Campo Contraseña */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <Link href="/forgot-password" className="text-sm text-[#005f73] hover:underline" onClick={onClose}>
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "border-red-500 pr-10" : "pr-10"}
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>

          {/* Alertas especiales */}
          {accountStatus.needsVerification && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex items-start">
                <Mail className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" />
                <div className="flex-1">
                  <p className="text-sm text-yellow-800">
                    Debes verificar tu correo electrónico antes de iniciar sesión.
                  </p>
                  <Button
                    type="button"
                    variant="link"
                    className="p-0 h-auto text-yellow-700 hover:text-yellow-900"
                    onClick={resendVerification}
                  >
                    Reenviar correo de verificación
                  </Button>
                </div>
              </div>
            </div>
          )}

          {accountStatus.accountLocked && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
                <div>
                  <p className="text-sm text-red-800">Tu cuenta está temporalmente bloqueada por seguridad.</p>
                  {accountStatus.lockoutEnd && (
                    <p className="text-xs text-red-600 mt-1">
                      Podrás intentar de nuevo en {formatLockoutTime(accountStatus.lockoutEnd)}.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {accountStatus.remainingAttempts !== undefined && (
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-orange-400 mt-0.5 mr-2" />
                <p className="text-sm text-orange-800">
                  Te quedan {accountStatus.remainingAttempts} intentos antes de que tu cuenta sea bloqueada.
                </p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#005f73] hover:bg-[#003d4d]"
            disabled={isLoading || accountStatus.accountLocked}
          >
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
