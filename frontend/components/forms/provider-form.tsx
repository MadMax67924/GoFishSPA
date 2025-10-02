"use client"

import { useState } from "react"
import { toast } from "sonner"

export default function ProviderForm() {
  const [formData, setFormData] = useState({
    company: "",
    representative: "",
    rut: "",
    address: "",
    products: "",
    email: "",
    phone: "",
    capacity: "",
    certifications: "",
    website: "",
    notes: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const currentProviders = JSON.parse(localStorage.getItem("providers") || "[]")
    currentProviders.push({ ...formData, status: "pendiente" })
    localStorage.setItem("providers", JSON.stringify(currentProviders))

    toast.success("Proveedor registrado en espera de validación ✅")
    setFormData({
      company: "",
      representative: "",
      rut: "",
      address: "",
      products: "",
      email: "",
      phone: "",
      capacity: "",
      certifications: "",
      website: "",
      notes: "",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label className="block text-sm font-medium">Nombre de la empresa *</label>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Representante legal *</label>
        <input
          type="text"
          name="representative"
          value={formData.representative}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">RUT / Identificación tributaria *</label>
        <input
          type="text"
          name="rut"
          value={formData.rut}
          onChange={handleChange}
          required
          placeholder="12.345.678-9"
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Dirección *</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Productos que ofrece *</label>
        <input
          type="text"
          name="products"
          value={formData.products}
          onChange={handleChange}
          required
          placeholder="Ej: Salmón, camarones, reineta..."
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Correo electrónico *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Teléfono *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="+56 9 1234 5678"
            className="w-full border px-3 py-2 rounded"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Capacidad de producción mensual</label>
        <input
          type="text"
          name="capacity"
          value={formData.capacity}
          onChange={handleChange}
          placeholder="Ej: 500 kg"
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Certificaciones</label>
        <input
          type="text"
          name="certifications"
          value={formData.certifications}
          onChange={handleChange}
          placeholder="Ej: HACCP, ISO 9001"
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Página web o redes sociales</label>
        <input
          type="url"
          name="website"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://www.miempresa.com"
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Notas adicionales</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          placeholder="Escriba aquí cualquier información adicional..."
          className="w-full border px-3 py-2 rounded"
        />
      </div>

      <button
        type="submit"
        className="bg-[#005f73] text-white px-6 py-3 rounded hover:bg-[#003d4d] w-full transition"
      >
        Registrar Proveedor
      </button>
    </form>
  )
}
