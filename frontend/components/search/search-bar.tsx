"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import SearchSuggestions from "./search-suggestions"
import { useSearchSuggestions } from "@/hooks/use-search-suggestions"

export default function AdvancedSearchBar() {
  const [query, setQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const { suggestions, isLoading } = useSearchSuggestions(query)

  // Cargar historial
  useEffect(() => {
    const saved = localStorage.getItem("searchHistory")
    if (saved) setSearchHistory(JSON.parse(saved).slice(0, 8))
  }, [])

  const saveToHistory = (term: string) => {
    const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 8)
    setSearchHistory(newHistory)
    localStorage.setItem("searchHistory", JSON.stringify(newHistory))
  }

  const clearHistory = () => {
    setSearchHistory([])
    localStorage.removeItem("searchHistory")
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
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  // Convertir productos de la API a sugerencias
  const apiSuggestions = suggestions.map(product => ({
    type: 'product' as const,
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    image: product.image
  }))

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
              className="w-full pl-12 pr-10 py-3 text-lg border-2 border-gray-300 rounded-full focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f] transition-all duration-200 bg-white text-gray-900" // ← AGREGADO bg-white text-gray-900
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
        <SearchSuggestions
          query={query}
          suggestions={apiSuggestions}
          searchHistory={searchHistory}
          selectedIndex={selectedIndex}
          showSuggestions={showSuggestions}
          onSuggestionSelect={handleSuggestionSelect}
          onClearHistory={clearHistory}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}