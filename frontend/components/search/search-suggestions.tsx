"use client"

import type React from "react"
import { Search, Clock, TrendingUp, Tag, ArrowRight, X } from "lucide-react"
import { Product } from "@/hooks/use-search-suggestions"

interface SearchSuggestion {
  type: 'product' | 'category' | 'popular' | 'history'
  id: number
  name: string
  category?: string
  price?: number
  image?: string
}

interface SearchSuggestionsProps {
  query: string
  suggestions: SearchSuggestion[]
  searchHistory: string[]
  selectedIndex: number
  showSuggestions: boolean
  onSuggestionSelect: (term: string) => void
  onClearHistory?: () => void
  isLoading?: boolean
}

// Datos de ejemplo (deberían venir de la API)
const POPULAR_SEARCHES = [
  "Salmón Fresco", "Pescado Fresco", "Mariscos", "Camarones", 
  "Merluza Austral", "Congrio", "Reineta", "Pulpo"
]

const CATEGORIES = [
  { name: "Pescados", count: 8, icon: "🐟" },
  { name: "Mariscos", count: 7, icon: "🦐" }
]

export default function SearchSuggestions({
  query,
  suggestions,
  searchHistory,
  selectedIndex,
  showSuggestions,
  onSuggestionSelect,
  onClearHistory,
  isLoading = false
}: SearchSuggestionsProps) {
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price)
  }

  const getCategoryIcon = (category: string) => {
    return category === 'pescados' ? '🐟' : '🦐'
  }

  if (!showSuggestions) return null

  return (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto">
      
      {/* Loading State */}
      {isLoading && (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2a9d8f] mx-auto"></div>
          <p className="text-gray-600 mt-2">Buscando...</p>
        </div>
      )}

      {/* Sugerencias en Tiempo Real */}
      {query && suggestions.length > 0 && !isLoading && (
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
            <Search className="h-4 w-4 mr-2" />
            Sugerencias para "{query}"
          </h3>
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.id}`}
                onClick={() => onSuggestionSelect(suggestion.name)}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                  index === selectedIndex 
                    ? 'bg-[#2a9d8f] text-white' 
                    : 'hover:bg-gray-50 text-gray-900' // ← AGREGADO text-gray-900
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

      {/* Estado vacío para búsqueda con resultados */}
      {query && suggestions.length === 0 && !isLoading && (
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center">
            <Search className="h-4 w-4 mr-2" />
            Sugerencias para "{query}"
          </h3>
          <div className="text-center py-4">
            <div className="text-gray-400 mb-2">🔍</div>
            <p className="text-gray-600 font-medium">No se encontraron resultados</p>
            <p className="text-gray-500 text-sm mt-1">Intenta con otros términos de búsqueda</p>
          </div>
        </div>
      )}

      {/* Historial de Búsquedas */}
      {!query && searchHistory.length > 0 && (
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Búsquedas recientes
            </h3>
            {onClearHistory && (
              <button
                onClick={onClearHistory}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center"
              >
                <X className="h-3 w-3 mr-1" />
                Borrar todo
              </button>
            )}
          </div>
          <div className="space-y-1">
            {searchHistory.map((item, index) => (
              <button
                key={index}
                onClick={() => onSuggestionSelect(item)}
                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center justify-between group text-gray-900" // ← AGREGADO text-gray-900
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
                onClick={() => onSuggestionSelect(category.name)}
                className="p-3 border border-gray-200 rounded-lg hover:border-[#2a9d8f] hover:bg-blue-50 transition-all duration-200 text-left group text-gray-900" // ← AGREGADO text-gray-900
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
                onClick={() => onSuggestionSelect(search)}
                className="px-3 py-2 bg-gray-100 hover:bg-[#2a9d8f] hover:text-white text-gray-700 rounded-full text-sm transition-all duration-200 flex items-center space-x-1 group"
              >
                <TrendingUp className="h-3 w-3" />
                <span>{search}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}