"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Filter, X } from "lucide-react"

export default function ProductFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get("minPrice") || 0),
    Number(searchParams.get("maxPrice") || 20000),
  ])

  const [categories, setCategories] = useState({
    pescados: searchParams.get("category") === "pescados" || searchParams.getAll("category").includes("pescados"),
    mariscos: searchParams.get("category") === "mariscos" || searchParams.getAll("category").includes("mariscos"),
  })

  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "name")
  const [sortOrder, setSortOrder] = useState(searchParams.get("sortOrder") || "asc")

  const handleCategoryChange = (category: string, checked: boolean) => {
    setCategories({ ...categories, [category]: checked })
  }

  const applyFilters = () => {
    const params = new URLSearchParams()

    // Añadir categorías seleccionadas
    const selectedCategories = Object.entries(categories)
      .filter(([_, selected]) => selected)
      .map(([category]) => category)

    selectedCategories.forEach((category) => {
      params.append("category", category)
    })

    // Añadir rango de precios
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString())
    if (priceRange[1] < 20000) params.set("maxPrice", priceRange[1].toString())

    // Añadir ordenamiento
    if (sortBy !== "name") params.set("sortBy", sortBy)
    if (sortOrder !== "asc") params.set("sortOrder", sortOrder)

    // Mantener el término de búsqueda si existe
    const query = searchParams.get("q")
    if (query) params.set("q", query)

    router.push(`/productos?${params.toString()}`)
  }

  const clearFilters = () => {
    setCategories({ pescados: false, mariscos: false })
    setPriceRange([0, 20000])
    setSortBy("name")
    setSortOrder("asc")

    // Mantener solo el término de búsqueda si existe
    const query = searchParams.get("q")
    if (query) {
      router.push(`/productos?q=${query}`)
    } else {
      router.push("/productos")
    }
  }

  const hasActiveFilters = () => {
    return (
      categories.pescados ||
      categories.mariscos ||
      priceRange[0] > 0 ||
      priceRange[1] < 20000 ||
      sortBy !== "name" ||
      sortOrder !== "asc"
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros y Ordenamiento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CU17: Filtrar productos por categoría */}
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

        {/* Filtro por precio */}
        <div>
          <h3 className="font-medium mb-3">Rango de Precio</h3>
          <Slider
            defaultValue={priceRange}
            min={0}
            max={20000}
            step={500}
            value={priceRange}
            onValueChange={setPriceRange}
            className="my-4"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>${priceRange[0].toLocaleString()}</span>
            <span>${priceRange[1].toLocaleString()}</span>
          </div>
        </div>

        {/* CU23: Ordenar productos */}
        <div>
          <h3 className="font-medium mb-3">Ordenar por</h3>
          <div className="space-y-3">
            <div>
              <Label htmlFor="sortBy" className="text-sm">
                Campo
              </Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar campo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nombre</SelectItem>
                  <SelectItem value="price">Precio</SelectItem>
                  <SelectItem value="category">Categoría</SelectItem>
                  <SelectItem value="stock">Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sortOrder" className="text-sm">
                Orden
              </Label>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar orden" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascendente (A-Z, menor a mayor)</SelectItem>
                  <SelectItem value="desc">Descendente (Z-A, mayor a menor)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="space-y-2 pt-4">
          <Button onClick={applyFilters} className="w-full bg-[#005f73] hover:bg-[#003d4d]">
            <Filter className="mr-2 h-4 w-4" />
            Aplicar Filtros
          </Button>

          {/* CU24: Limpiar Filtros */}
          {hasActiveFilters() && (
            <Button onClick={clearFilters} variant="outline" className="w-full">
              <X className="mr-2 h-4 w-4" />
              Limpiar Filtros
            </Button>
          )}
        </div>

        {/* Indicador de filtros activos */}
        {hasActiveFilters() && (
          <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
            <strong>Filtros activos:</strong>
            <ul className="mt-1 space-y-1">
              {categories.pescados && <li>• Pescados</li>}
              {categories.mariscos && <li>• Mariscos</li>}
              {(priceRange[0] > 0 || priceRange[1] < 20000) && (
                <li>
                  • Precio: ${priceRange[0].toLocaleString()} - ${priceRange[1].toLocaleString()}
                </li>
              )}
              {sortBy !== "name" && <li>• Ordenado por: {sortBy}</li>}
              {sortOrder !== "asc" && <li>• Orden: {sortOrder === "desc" ? "Descendente" : "Ascendente"}</li>}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
