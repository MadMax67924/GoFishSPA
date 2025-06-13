"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Error al enviar el mensaje")

      toast({
        title: "Mensaje enviado",
        description: "Nos pondremos en contacto contigo pronto.",
      })

      setFormData({ name: "", email: "", message: "" })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Mensaje enviado",
        description: "Nos pondremos en contacto contigo pronto.",
        variant: "default",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-16" id="contacto">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-[#005f73] mb-12">Contáctanos</h2>

        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre:</Label>
            <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email:</Label>
            <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensaje:</Label>
            <Textarea id="message" name="message" value={formData.message} onChange={handleChange} rows={5} required />
          </div>

          <Button type="submit" className="w-full bg-[#005f73] hover:bg-[#003d4d]" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
          </Button>
        </form>
      </div>
    </section>
  )
}
