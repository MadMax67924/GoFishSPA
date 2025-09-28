import { useState, useEffect } from 'react'

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

export function useSearchSuggestions(query: string) {
  const [suggestions, setSuggestions] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}&limit=5`)
        
        if (response.ok) {
          const products = await response.json()
          setSuggestions(products)
        } else {
          setSuggestions([])
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    const debounceTimer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  return { suggestions, isLoading }
}