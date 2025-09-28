"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X, Clock, TrendingUp, Tag } from "lucide-react"

// Datos basados en tu base de datos
const POPULAR_SEARCHES = [
  "Salmón Fresco",
  "Pescado Fresco", 
  "Mariscos",
  "Camarones",
  "Merluza Austral",
  "Congrio",
  "Reineta",
  "Pulpo",
  "Atún",
  "Choritos"
]

const CATEGORIES = [
  { name: "Pescados", count: 6 },
  { name: "Mariscos", count: 4 }
]

// Productos para autocomplete
const PRODUCTS = [
  "Salmón Fresco",
  "Salmón Ahumado", 
  "Salmón Congelado",
  "Merluza Austral",
  "Reineta",
  "Camarones Grandes",
  "Camarones Medianos",
  "Congrio Dorado", 
  "Choritos Frescos",
  "Pulpo Fresco",
  "Atún Fresco",
  "Pescado Fresco del Día",
  "Mariscos Frescos",
  "Ostras Frescas",
  "Almejas",
  "Machas"
]

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const [suggestion, setSuggestion] = useState("")
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Cargar historial desde localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem("searchHistory")
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory).slice(0, 5))
    }
  }, [])

  // Encontrar sugerencia para autocomplete
  useEffect(() => {
    if (query.length < 2) {
      setSuggestion("")
      return
    }

    const found = PRODUCTS.find(product => 
      product.toLowerCase().startsWith(query.toLowerCase())
    )
    
    setSuggestion(found || "")
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const searchTerm = suggestion || query
    if (searchTerm.trim()) {
      // Guardar en historial
      const newHistory = [searchTerm, ...searchHistory.filter(item => item !== searchTerm)].slice(0, 5)
      setSearchHistory(newHistory)
      localStorage.setItem("searchHistory", JSON.stringify(newHistory))
      
      // Navegar a resultados
      router.push(`/search?q=${encodeURIComponent(searchTerm)}`)
      setShowSuggestionsPanel(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab' && suggestion) {
      e.preventDefault()
      setQuery(suggestion)
      setSuggestion("")
    }
    
    if (e.key === 'Escape') {
      setShowSuggestionsPanel(false)
      inputRef.current?.blur()
    }
  }

  const clearSearch = () => {
    setQuery("")
    setSuggestion("")
    inputRef.current?.focus()
  }

  const handleSearchClick = (searchTerm: string) => {
    setQuery(searchTerm)
    const newHistory = [searchTerm, ...searchHistory.filter(item => item !== searchTerm)].slice(0, 5)
    setSearchHistory(newHistory)
    localStorage.setItem("searchHistory", JSON.stringify(newHistory))
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`)
    setShowSuggestionsPanel(false)
  }

  const clearHistory = () => {
    setSearchHistory([])
    localStorage.removeItem("searchHistory")
  }

  const autocompleteText = suggestion ? suggestion.slice(query.length) : ""

  return (
    <div className="container mx-auto px-4 my-8">
      <div className="relative max-w-xl mx-auto">
        {/* Barra de búsqueda */}
        <form onSubmit={handleSubmit} className="flex relative">
          <div className="relative flex-1">
            {/* Input principal */}
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setShowSuggestionsPanel(true)
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestionsPanel(true)}
              placeholder="Buscar productos de mar..."
              className="rounded-r-none pr-10 relative z-20 bg-white text-black placeholder-gray-500"
            />
            
            {/* Texto de autocomplete */}
            {autocompleteText && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                <span className="text-transparent">{query}</span>
                <span className="text-gray-400 absolute left-0 top-0">
                  {query}
                  {autocompleteText}
                </span>
              </div>
            )}

            {/* Botón limpiar */}
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-30"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="bg-[#2a9d8f] hover:bg-[#21867a] rounded-l-none z-20"
          >
            <Search className="h-5 w-5" />
          </Button>
        </form>

        {/* Panel de sugerencias */}
        {showSuggestionsPanel && (query.length > 0 || searchHistory.length > 0) && (
          <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-xl z-50 mt-1 max-h-96 overflow-y-auto">
            
            {/* Historial de búsquedas */}
            {searchHistory.length > 0 && query.length === 0 && (
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">Búsquedas recientes</span>
                  </div>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Limpiar
                  </button>
                </div>
                <div className="space-y-1">
                  {searchHistory.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchClick(item)}
                      className="w-full text-left p-2 hover:bg-gray-50 rounded flex items-center space-x-3"
                    >
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sugerencias de autocomplete */}
            {query.length >= 2 && (
              <div className="p-4 border-b border-gray-100">
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-900">Sugerencias</span>
                </div>
                <div className="space-y-1">
                  {PRODUCTS
                    .filter(product => 
                      product.toLowerCase().includes(query.toLowerCase())
                    )
                    .slice(0, 5)
                    .map((product, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearchClick(product)}
                        className="w-full text-left p-2 hover:bg-gray-50 rounded flex items-center justify-between"
                      >
                        <span className="text-gray-700">{product}</span>
                        <Search className="h-4 w-4 text-gray-400" />
                      </button>
                    ))
                  }
                </div>
              </div>
            )}

            {/* Categorías */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-2 mb-3">
                <Tag className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">Categorías</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchClick(category.name)}
                    className="px-3 py-1 bg-gray-100 hover:bg-[#2a9d8f] hover:text-white text-gray-700 rounded-full text-sm transition-colors"
                  >
                    {category.name} ({category.count})
                  </button>
                ))}
              </div>
            </div>

            {/* Búsquedas populares */}
            <div className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <TrendingUp className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">Búsquedas populares</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchClick(search)}
                    className="px-3 py-1 bg-gray-100 hover:bg-[#2a9d8f] hover:text-white text-gray-700 rounded-full text-sm transition-colors"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Búsquedas populares (siempre visibles) */}
      <div className="max-w-xl mx-auto mt-6">
        <p className="text-sm text-gray-600 text-center mb-3">Búsquedas populares</p>
        <div className="flex flex-wrap justify-center gap-2">
          {POPULAR_SEARCHES.slice(0, 8).map((term) => (
            <button
              key={term}
              onClick={() => handleSearchClick(term)}
              className="text-sm bg-gray-100 hover:bg-[#2a9d8f] hover:text-white text-gray-700 px-3 py-1 rounded-full transition-colors duration-200"
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}