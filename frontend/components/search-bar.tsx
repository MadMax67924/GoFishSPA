"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function SearchBar() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="container mx-auto px-4 my-8">
      <form onSubmit={handleSearch} className="flex max-w-xl mx-auto">
        <Input
          type="text"
          placeholder="Buscar productos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded-r-none"
        />
        <Button type="submit" className="bg-[#2a9d8f] hover:bg-[#21867a] rounded-l-none">
          <Search className="h-5 w-5" />
          <span className="ml-2 hidden sm:inline">Buscar</span>
        </Button>
      </form>
    </div>
  )
}
