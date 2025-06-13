"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"

export default function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [priceRange, setPriceRange] = useState([0, 20000])
  const [categories, setCategories] = useState({
    pescados: searchParams.get("category") === "pescados",
    mariscos: searchParams.get("category") === "mariscos",
  })

  const handleCategoryChange = (category: string, checked: boolean) => {
    setCategories({ ...categories, [category]: checked })
  }

  const applyFilters = () => {
    const params = new URLSearchParams()

    // Añadir categorías seleccionadas
    const selectedCategories = Object.entries(categories)
      .filter(([_, selected]) => selected)
      .map(([category]) => category)

    if (selectedCategories.length === 1) {
      params.set("category", selectedCategories[0])
    }

    // Añadir rango de precios
    params.set("minPrice", priceRange[0].toString())
    params.set("maxPrice", priceRange[1].toString())

    // Mantener el término de búsqueda si existe
    const query = searchParams.get("q")
    if (query) {
      params.set("q", query)
    }

    router.push(`/productos?${params.toString()}`)
  }

  const clearFilters = () => {
    setCategories({ pescados: false, mariscos: false })
    setPriceRange([0, 20000])
    router.push("/productos")
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Filtros</h2>

      <div className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">Categorías</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="pescados"
                checked={categories.pescados}
                onCheckedChange={(checked) => handleCategoryChange("pescados", checked as boolean)}
              />
              <Label htmlFor="pescados">Pescados</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mariscos"
                checked={categories.mariscos}
                onCheckedChange={(checked) => handleCategoryChange("mariscos", checked as boolean)}
              />
              <Label htmlFor="mariscos">Mariscos</Label>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-3">Precio</h3>
          <Slider
            defaultValue={priceRange}
            min={0}
            max={20000}
            step={500}
            value={priceRange}
            onValueChange={setPriceRange}
            className="my-4"
          />
          <div className="flex justify-between text-sm">
            <span>${priceRange[0].toLocaleString()}</span>
            <span>${priceRange[1].toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-2 pt-4">
          <Button onClick={applyFilters} className="w-full bg-[#005f73] hover:bg-[#003d4d]">
            Aplicar Filtros
          </Button>
          <Button onClick={clearFilters} variant="outline" className="w-full">
            Limpiar Filtros
          </Button>
        </div>
      </div>
    </div>
  )
}
