import type React from "react"

export interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  featured: boolean
}

interface SearchSuggestionsProps {
  suggestions: Product[]
  isLoading: boolean
  onSelect: (product: Product) => void
  visible: boolean
}

export default function SearchSuggestions({
  suggestions,
  isLoading,
  onSelect,
  visible
}: SearchSuggestionsProps) {
  if (!visible) return null

  // Función para formatear el precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(price)
  }

  // Función para formatear la categoría
  const formatCategory = (category: string) => {
    return category === 'pescados' ? 'Pescados' : 'Mariscos'
  }

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
      {isLoading ? (
        <div className="p-4 text-center text-gray-500">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Buscando productos...</p>
        </div>
      ) : suggestions.length > 0 ? (
        <ul className="py-2">
          {suggestions.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                onClick={() => onSelect(product)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-150 flex items-start space-x-3 border-b border-gray-100 last:border-b-0"
              >
                {product.image && (
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-10 h-10 rounded object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-medium text-gray-900 text-sm block truncate">
                        {product.name}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                        {formatCategory(product.category)}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-green-600 ml-2 flex-shrink-0">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                  {product.featured && (
                    <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mt-1">
                      Destacado
                    </span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-4 text-center text-gray-500">
          <p>No se encontraron productos</p>
          <p className="text-sm mt-1">Intenta con otros términos como "salmón" o "mariscos"</p>
        </div>
      )}
    </div>
  )
}