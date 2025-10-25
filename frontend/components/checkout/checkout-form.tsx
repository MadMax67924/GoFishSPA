"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

export default function CheckoutForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    region: "",
    postalCode: "",
    paymentMethod: "transferencia",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const regions = [
    "Arica y Parinacota",
    "Tarapacá",
    "Antofagasta",
    "Atacama",
    "Coquimbo",
    "Valparaíso",
    "Metropolitana de Santiago",
    "Libertador General Bernardo O'Higgins",
    "Maule",
    "Ñuble",
    "Biobío",
    "La Araucanía",
    "Los Ríos",
    "Los Lagos",
    "Aysén del General Carlos Ibáñez del Campo",
    "Magallanes y de la Antártica Chilena"
  ]

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const userData = await res.json()
          setFormData(prev => ({
            ...prev,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
          }))
        }
      } catch (error) {
        console.error("Error cargando información del usuario:", error)
      }
    }

    fetchUserInfo()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRadioChange = (value: string) => {
    setFormData((prev) => ({ ...prev, paymentMethod: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/cart")
      if (!res.ok) throw new Error("Error al cargar el resumen del carrito")
      
      const cart = await res.json()
      const items = cart.items || []
      
      const subtotal = items.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0)
      const shipping = subtotal > 30000 ? 0 : 5000
      const total = subtotal + shipping

      const orderData = {
        ...formData,
        cartItems: items,
        subtotal,
        shipping,
        total,
        status: formData.paymentMethod === "webpay" ? "pending" : "confirmed"
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar el pedido")
      }

      if (formData.paymentMethod === "webpay" ) {
        toast({
          title: "Pedido creado",
          description: "Redirigiendo a la pasarela de pago...",
        })
        
        router.push(`/checkout/payment?orderId=${data.orderId}`)
        return
      }

      toast({
        title: "¡Pedido realizado con éxito!",
        description: `Número de pedido: ${data.orderNumber}`,
      })

      if (total < 30000 && formData.region !== "Valparaíso") {
        router.push(`/redireccion-whattsap?order=${data.orderId}`)
      } else {
        router.push(`/checkout/confirmacion?order=${data.orderNumber}`)
      }
    } catch (error: any) {
      console.error("Error al procesar el pedido:", error)
      toast({
        title: "Error",
        description: error.message || "Hubo un problema al procesar tu pedido. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Información de contacto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input 
                id="firstName" 
                name="firstName" 
                value={formData.firstName} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input 
                id="lastName" 
                name="lastName" 
                value={formData.lastName} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input 
                id="phone" 
                name="phone" 
                type="tel" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dirección de envío</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input 
              id="address" 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input 
                id="city" 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="region">Región</Label>
              <select
                id="region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecciona una región</option>
                {regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode">Código postal</Label>
            <Input 
              id="postalCode" 
              name="postalCode" 
              value={formData.postalCode} 
              onChange={handleChange} 
              required 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Método de pago</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup value={formData.paymentMethod} onValueChange={handleRadioChange} className="space-y-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="transferencia" id="transferencia" />
              <Label htmlFor="transferencia">Transferencia bancaria</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="webpay" id="webpay" />
              <Label htmlFor="webpay">WebPay (tarjeta de crédito/débito)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="efectivo" id="efectivo" />
              <Label htmlFor="efectivo">Efectivo contra entrega</Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notas adicionales</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="notes"
            name="notes"
            placeholder="Instrucciones especiales para la entrega, etc."
            value={formData.notes}
            onChange={handleChange}
            rows={3}
          />
        </CardContent>
      </Card>

      <Button 
        type="submit" 
        className="w-full bg-[#005f73] hover:bg-[#003d4d] h-12 text-lg" 
        disabled={isSubmitting}
      >
        {isSubmitting ? "Procesando..." : "Confirmar pedido"}
      </Button>
    </form>
  )
}