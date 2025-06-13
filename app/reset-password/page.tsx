"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { validatePassword } from "@/lib/validation"
import { Eye, EyeOff, CheckCircle, XCircle, Key } from "lucide-react"

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isValidToken, setIsValidToken] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState<any>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const token = searchParams.get("token")

  useEffect(() => {
    if (token) {
      validateToken(token)
    } else {
      setIsValidating(false)
    }
  }, [token])

  useEffect(() => {
    if (formData.newPassword) {
      const validation = validatePassword(formData.newPassword)
      setPasswordStrength(validation)
    } else {
      setPasswordStrength(null)
    }
  }, [formData.newPassword])

  const validateToken = async (resetToken: string) => {
    try {
      const response = await fetch(`/api/auth/reset-password?token=${resetToken}`)
      const data = await response.json()

      setIsValidToken(data.valid)
      if (!data.valid) {
        toast({
          title: "Token inválido",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      setIsValidToken(false)
      toast({
        title: "Error",
        description: "Error al validar el token",
        variant: "destructive",
      })
    } finally {
      setIsValidating(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setValidationErrors({})

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Contraseña actualizada",
          description: data.message,
        })
        router.push("/")
      } else {
        if (data.field) {
          setValidationErrors({ [data.field]: data.error })
        } else {
          toast({
            title: "Error",
            description: data.error,
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al actualizar la contraseña",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005f73] mb-4"></div>
            <p>Validando enlace de recuperación...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!token || !isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle>Enlace inválido</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">El enlace de recuperación es inválido o ha expirado.</p>
            <Button onClick={() => router.push("/forgot-password")} className="w-full bg-[#005f73] hover:bg-[#003d4d]">
              Solicitar nuevo enlace
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Key className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <CardTitle>Nueva contraseña</CardTitle>
          <p className="text-gray-600">Ingresa tu nueva contraseña</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nueva contraseña */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={validationErrors.newPassword ? "border-red-500 pr-10" : "pr-10"}
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

              {/* Indicador de fuerza */}
              {passwordStrength && (
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.score <= 2
                          ? "bg-red-500"
                          : passwordStrength.score <= 3
                            ? "bg-yellow-500"
                            : passwordStrength.score <= 4
                              ? "bg-blue-500"
                              : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min((passwordStrength.score / 6) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p
                    className={`text-sm ${
                      passwordStrength.score <= 2
                        ? "text-red-500"
                        : passwordStrength.score <= 3
                          ? "text-yellow-500"
                          : passwordStrength.score <= 4
                            ? "text-blue-500"
                            : "text-green-500"
                    }`}
                  >
                    {passwordStrength.message}
                  </p>
                </div>
              )}

              {validationErrors.newPassword && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {validationErrors.newPassword}
                </p>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={
                    validationErrors.confirmPassword
                      ? "border-red-500 pr-10"
                      : formData.confirmPassword && formData.newPassword === formData.confirmPassword
                        ? "border-green-500 pr-10"
                        : "pr-10"
                  }
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  Las contraseñas no coinciden
                </p>
              )}
              {formData.confirmPassword && formData.newPassword === formData.confirmPassword && (
                <p className="text-sm text-green-500 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  Las contraseñas coinciden
                </p>
              )}

              {validationErrors.confirmPassword && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {validationErrors.confirmPassword}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-[#005f73] hover:bg-[#003d4d]"
              disabled={isSubmitting || !passwordStrength?.isValid || formData.newPassword !== formData.confirmPassword}
            >
              {isSubmitting ? "Actualizando..." : "Actualizar contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
