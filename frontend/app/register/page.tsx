"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { validateEmail, validatePassword } from "@/lib/validation"
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react"

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [passwordStrength, setPasswordStrength] = useState<any>(null)
  const [emailValidation, setEmailValidation] = useState<any>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Caso 2 y 3: Validación en tiempo real
  useEffect(() => {
    if (formData.email) {
      const validation = validateEmail(formData.email)
      setEmailValidation(validation)
    } else {
      setEmailValidation(null)
    }
  }, [formData.email])

  useEffect(() => {
    if (formData.password) {
      const validation = validatePassword(formData.password)
      setPasswordStrength(validation)
    } else {
      setPasswordStrength(null)
    }
  }, [formData.password])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar errores cuando el usuario empiece a escribir
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setValidationErrors({})

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.field) {
          setValidationErrors({ [data.field]: data.error })
        } else {
          throw new Error(data.error || "Error al registrar usuario")
        }
        return
      }

      toast({
        title: "Registro exitoso",
        description: data.message,
      })

      // Redirigir a página de verificación o login
      router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
    } catch (error: any) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error.message || "Error al registrar usuario",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPasswordStrengthColor = (score: number) => {
    if (score <= 2) return "text-red-500"
    if (score <= 3) return "text-yellow-500"
    if (score <= 4) return "text-blue-500"
    return "text-green-500"
  }

  const getPasswordStrengthWidth = (score: number) => {
    return `${Math.min((score / 6) * 100, 100)}%`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Crear una cuenta</CardTitle>
          <p className="text-center text-gray-600">Regístrate para acceder a GoFish SpA</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campo Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className={validationErrors.name ? "border-red-500" : ""}
                required
              />
              {validationErrors.name && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {validationErrors.name}
                </p>
              )}
            </div>

            {/* Campo Email con validación */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <div className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={
                    validationErrors.email
                      ? "border-red-500 pr-10"
                      : emailValidation?.isValid
                        ? "border-green-500 pr-10"
                        : "pr-10"
                  }
                  required
                />
                {emailValidation && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {emailValidation.isValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {validationErrors.email && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {validationErrors.email}
                </p>
              )}
              {emailValidation && !emailValidation.isValid && !validationErrors.email && (
                <p className="text-sm text-red-500">{emailValidation.message}</p>
              )}
            </div>

            {/* Campo Contraseña con indicador de fuerza */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={validationErrors.password ? "border-red-500 pr-10" : "pr-10"}
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

              {/* Indicador de fuerza de contraseña */}
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
                      style={{ width: getPasswordStrengthWidth(passwordStrength.score) }}
                    ></div>
                  </div>
                  <p className={`text-sm ${getPasswordStrengthColor(passwordStrength.score)}`}>
                    {passwordStrength.message}
                  </p>
                </div>
              )}

              {validationErrors.password && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Campo Confirmar Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
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
                      : formData.confirmPassword && formData.password === formData.confirmPassword
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
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  Las contraseñas no coinciden
                </p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
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
              disabled={isSubmitting || !emailValidation?.isValid || !passwordStrength?.isValid}
            >
              {isSubmitting ? "Registrando..." : "Registrarse"}
            </Button>

            <div className="text-center text-sm">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/" className="text-[#005f73] hover:underline">
                Iniciar sesión
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
