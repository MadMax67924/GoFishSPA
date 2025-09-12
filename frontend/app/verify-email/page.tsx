"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Mail, CheckCircle, XCircle, RefreshCw } from "lucide-react"

export default function VerifyEmailPage() {
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "success" | "error">("pending")
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const email = searchParams.get("email")
  const token = searchParams.get("token")

  useEffect(() => {
    if (token) {
      verifyEmail(token)
    }
  }, [token])

  const verifyEmail = async (verificationToken: string) => {
    setIsVerifying(true)
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: verificationToken }),
      })

      const data = await response.json()

      if (response.ok) {
        setVerificationStatus("success")
        toast({
          title: "Email verificado",
          description: data.message,
        })

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push("/")
        }, 3000)
      } else {
        setVerificationStatus("error")
        toast({
          title: "Error de verificación",
          description: data.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      setVerificationStatus("error")
      toast({
        title: "Error",
        description: "Error al verificar el correo electrónico",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  const resendVerification = async () => {
    if (!email) return

    setIsResending(true)
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
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
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {verificationStatus === "success" ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : verificationStatus === "error" ? (
              <XCircle className="h-16 w-16 text-red-500" />
            ) : (
              <Mail className="h-16 w-16 text-blue-500" />
            )}
          </div>
          <CardTitle>
            {verificationStatus === "success"
              ? "¡Email Verificado!"
              : verificationStatus === "error"
                ? "Error de Verificación"
                : "Verifica tu Email"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {verificationStatus === "pending" && !token && (
            <>
              <p className="text-gray-600">Hemos enviado un enlace de verificación a:</p>
              <p className="font-medium text-[#005f73]">{email}</p>
              <p className="text-sm text-gray-500">
                Revisa tu bandeja de entrada y haz clic en el enlace para verificar tu cuenta.
              </p>
              <div className="pt-4">
                <Button
                  onClick={resendVerification}
                  disabled={isResending || !email}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Reenviando...
                    </>
                  ) : (
                    "Reenviar correo de verificación"
                  )}
                </Button>
              </div>
            </>
          )}

          {verificationStatus === "pending" && token && (
            <>
              <p className="text-gray-600">Verificando tu correo electrónico...</p>
              {isVerifying && (
                <div className="flex justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              )}
            </>
          )}

          {verificationStatus === "success" && (
            <>
              <p className="text-green-600">Tu correo electrónico ha sido verificado exitosamente.</p>
              <p className="text-sm text-gray-500">Serás redirigido al inicio de sesión en unos segundos...</p>
              <Button onClick={() => router.push("/")} className="w-full bg-[#005f73] hover:bg-[#003d4d]">
                Ir al inicio de sesión
              </Button>
            </>
          )}

          {verificationStatus === "error" && (
            <>
              <p className="text-red-600">No se pudo verificar tu correo electrónico.</p>
              <div className="space-y-2">
                <Button
                  onClick={resendVerification}
                  disabled={isResending || !email}
                  variant="outline"
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Reenviando...
                    </>
                  ) : (
                    "Solicitar nuevo enlace"
                  )}
                </Button>
                <Button onClick={() => router.push("/")} variant="ghost" className="w-full">
                  Volver al inicio
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
