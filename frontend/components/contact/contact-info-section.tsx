'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

interface ContactInfo {
  id: number
  type: 'address' | 'phone' | 'email' | 'hours'
  title: string
  primary_text: string
  secondary_text?: string
  icon: string
  is_active: boolean
}

export default function ContactInfoSection() {
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchContactInfo()
  }, [])

  const fetchContactInfo = async () => {
    try {
      const response = await fetch('/api/contact-info')
      const data = await response.json()
      setContactInfo(data.contactInfo || [])
    } catch (error) {
      console.error('Error fetching contact info:', error)
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'map': return <MapPin className="h-8 w-8 text-white" />
      case 'phone': return <Phone className="h-8 w-8 text-white" />
      case 'mail': return <Mail className="h-8 w-8 text-white" />
      case 'clock': return <Clock className="h-8 w-8 text-white" />
      default: return <Mail className="h-8 w-8 text-white" />
    }
  }

  if (loading) {
    return <div className="text-center py-8">Cargando información de contacto...</div>
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {contactInfo.map((info) => (
            <Card key={info.id} className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="w-16 h-16 bg-[#005f73] rounded-full flex items-center justify-center mx-auto mb-4">
                  {getIcon(info.icon)}
                </div>
                <h3 className="text-lg font-semibold mb-2 text-[#005f73]">{info.title}</h3>
                <p className="text-gray-600">{info.primary_text}</p>
                {info.secondary_text && (
                  <p className="text-sm text-gray-500">{info.secondary_text}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}