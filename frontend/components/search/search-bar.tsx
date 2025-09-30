"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search, X, Clock, TrendingUp, Tag, ArrowRight } from "lucide-react"

// Datos de ejemplo basados en tu base de datos
const PRODUCTS = [
  { id: 1, name: "Salmón Fresco", category: "pescados", price: 8990, image: "/images/salmon.jpg" },
  { id: 2, name: "Salmón Ahumado", category: "pescados", price: 10990, image: "/images/salmon-ahumado.jpg" },
  { id: 3, name: "Salmón Congelado", category: "pescados", price: 7990, image: "/images/salmon-congelado.jpg" },
  { id: 4, name: "Merluza Austral", category: "pescados", price: 5990, image: "/images/merluza.jpg" },
  { id: 5, name: "Reineta", category: "pescados", price: 6490, image: "/images/reineta.jpg" },
  { id: 6, name: "Camarones Grandes", category: "mariscos", price: 12990, image: "/images/camarones.jpg" },
  { id: 7, name: "Camarones Medianos", category: "mariscos", price: 8990, image: "/images/camarones-medianos.jpg" },
  { id: 8, name: "Congrio Dorado", category: "pescados", price: 9990, image: "/images/congrio.jpg" },
  { id: 9, name: "Choritos Frescos", category: "mariscos", price: 4990, image: "/images/choritos.jpg" },
  { id: 10, name: "Pulpo Fresco", category: "mariscos", price: 15990, image: "/images/pulpo.jpg" },
  { id: 11, name: "Atún Fresco", category: "pescados", price: 11990, image: "/images/atun.jpg" },
  { id: 12, name: "Almejas", category: "mariscos", price: 7990, image: "/images/almejas.jpg" },
  { id: 13, name: "Ostras Frescas", category: "mariscos", price: 12990, image: "/images/ostras.jpg" },
  { id: 14, name: "Machas", category: "mariscos", price: 8990, image: "/images/machas.jpg" },
  { id: 15, name: "Langostinos", category: "mariscos", price: 14990, image: "/images/langostinos.jpg" }
]

const POPULAR_SEARCHES = [
  "Salmón Fresco",
  "Pescado Fresco", 
  "Mariscos",
  "Camarones",
  "Merluza Austral",
  "Congrio",
  "Reineta",
  "Pulpo"
]

const CATEGORIES = [
  { name: "Pescados", count: 8, icon: "🐟" },
  { name: "Mariscos", count: 7, icon: "🦐" }
]

interface SearchSuggestion {
  type: 'product' | 'category' | 'popular'
  id: number
  name: string
  category?: string
  price?: number
  image?: string
}

export default function AdvancedSearchBar() {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Cargar historial
  useEffect(() => {
    const saved = localStorage.getItem("searchHistory")
    if (saved) setSearchHistory(JSON.parse(saved).slice(0, 8))
  }, [])

  // Generar sugerencias en tiempo real
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      setSelectedIndex(0)
      return
    }

    const allSuggestions: SearchSuggestion[] = []

    // 1. Productos que coinciden exactamente
    const exactProducts = PRODUCTS.filter(p => 
      p.name.toLowerCase().startsWith(query.toLowerCase())
    ).slice(0, 3)

    // 2. Productos que contienen la query
    const containsProducts = PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) && 
      !exactProducts.includes(p)
    ).slice(0, 3)

    // 3. Categorías que coinciden
    const categoryMatches = CATEGORIES.filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 2)

    // Combinar todas las sugerencias
    allSuggestions.push(
      ...exactProducts.map(p => ({ 
        type: 'product' as const, 
        id: p.id, 
        name: p.name, 
        category: p.category,
        price: p.price,
        image: p.image
      })),
      ...containsProducts.map(p => ({ 
        type: 'product' as const, 
        id: p.id, 
        name: p.name, 
        category: p.category,
        price: p.price,
        image: p.image
      })),
      ...categoryMatches.map(c => ({ 
        type: 'category' as const, 
        id: -1, 
        name: c.name 
      }))
    )

    // Si hay pocos resultados, agregar búsquedas populares relevantes
    if (allSuggestions.length < 5) {
      const relevantPopular = POPULAR_SEARCHES.filter(p => 
        p.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3 - allSuggestions.length)
      
      allSuggestions.push(
        ...relevantPopular.map(p => ({ 
          type: 'popular' as const, 
          id: -2, 
          name: p 
        }))
      )
    }

    setSuggestions(allSuggestions.slice(0, 8))
    setSelectedIndex(0)
  }, [query])

  const saveToHistory = (term: string) => {
    const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 8)
    setSearchHistory(newHistory)
    localStorage.setItem("searchHistory", JSON.stringify(newHistory))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    const selectedSuggestion = suggestions[selectedIndex]
    const searchTerm = selectedSuggestion?.name || query
    
    saveToHistory(searchTerm)
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`)
    setShowSuggestions(false)
    setQuery("")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setShowSuggestions(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev + 1) % suggestions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length)
        break
      case 'Enter':
        if (suggestions.length > 0) {
          e.preventDefault()
          const selected = suggestions[selectedIndex]
          handleSuggestionSelect(selected.name)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        break
    }
  }

  const handleSuggestionSelect = (term: string) => {
    setQuery(term)
    saveToHistory(term)
    router.push(`/search?q=${encodeURIComponent(term)}`)
    setShowSuggestions(false)
  }

  const clearSearch = () => {
    setQuery("")
    setSuggestions([])
    inputRef.current?.focus()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price)
  }

  const getCategoryIcon = (category: string) => {
    return category === 'pescados' ? '🐟' : '🦐'
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Search Bar Principal */}
      <div className="relative">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Buscar productos de mar..."
              className="w-full pl-12 pr-10 py-3 text-lg border-2 border-gray-300 rounded-full focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f] transition-all duration-200"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </form>

        {/* Panel de Sugerencias */}
        {showSuggestions && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
            
            {/* Sugerencias en Tiempo Real */}
            {query && suggestions.length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                  <Search className="h-4 w-4 mr-2" />
                  Sugerencias
                </h3>
                <div className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`${suggestion.type}-${suggestion.id}`}
                      onClick={() => handleSuggestionSelect(suggestion.name)}
                      className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                        index === selectedIndex 
                          ? 'bg-[#2a9d8f] text-white' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {suggestion.type === 'product' && suggestion.image && (
                          <img 
                            src={suggestion.image} 
                            alt={suggestion.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        {suggestion.type === 'category' && (
                          <span className="text-lg">{getCategoryIcon(suggestion.name)}</span>
                        )}
                        {suggestion.type === 'popular' && (
                          <TrendingUp className={`h-4 w-4 ${index === selectedIndex ? 'text-white' : 'text-gray-400'}`} />
                        )}
                        
                        <div className="text-left">
                          <div className={`font-medium ${index === selectedIndex ? 'text-white' : 'text-gray-900'}`}>
                            {suggestion.name}
                          </div>
                          {suggestion.type === 'product' && (
                            <div className={`text-sm ${index === selectedIndex ? 'text-blue-100' : 'text-gray-500'}`}>
                              {suggestion.category} • {formatPrice(suggestion.price!)}
                            </div>
                          )}
                          {suggestion.type === 'category' && (
                            <div className={`text-sm ${index === selectedIndex ? 'text-blue-100' : 'text-gray-500'}`}>
                              Categoría
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <ArrowRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${
                        index === selectedIndex ? 'text-white' : 'text-gray-400'
                      }`} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Historial de Búsquedas */}
            {!query && searchHistory.length > 0 && (
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Búsquedas recientes
                </h3>
                <div className="space-y-1">
                  {searchHistory.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionSelect(item)}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-3">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{item}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Categorías Populares */}
            {!query && (
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                  <Tag className="h-4 w-4 mr-2" />
                  Categorías populares
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((category) => (
                    <button
                      key={category.name}
                      onClick={() => handleSuggestionSelect(category.name)}
                      className="p-3 border border-gray-200 rounded-lg hover:border-[#2a9d8f] hover:bg-blue-50 transition-all duration-200 text-left group"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{category.count} productos</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Búsquedas Populares */}
            {!query && (
              <div className="p-4">
                <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Búsquedas populares
                </h3>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((search) => (
                    <button
                      key={search}
                      onClick={() => handleSuggestionSelect(search)}
                      className="px-3 py-2 bg-gray-100 hover:bg-[#2a9d8f] hover:text-white text-gray-700 rounded-full text-sm transition-all duration-200 flex items-center space-x-1 group"
                    >
                      <TrendingUp className="h-3 w-3" />
                      <span>{search}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Estado vacío */}
            {query && suggestions.length === 0 && (
              <div className="p-8 text-center">
                <div className="text-gray-400 mb-2">🔍</div>
                <p className="text-gray-600 font-medium">No se encontraron resultados</p>
                <p className="text-gray-500 text-sm mt-1">Intenta con otros términos de búsqueda</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Búsquedas Populares (Footer) */}
      {!query && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">También puedes buscar:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {POPULAR_SEARCHES.slice(0, 6).map((term) => (
              <button
                key={term}
                onClick={() => handleSuggestionSelect(term)}
                className="text-sm bg-gray-100 hover:bg-[#2a9d8f] hover:text-white text-gray-700 px-3 py-2 rounded-full transition-all duration-200 border border-gray-200 hover:border-[#2a9d8f]"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}