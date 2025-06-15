"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"

export default function CartIndicator() {
  const { itemCount, total } = useCart()

  return (
    <Link href="/carrito">
      <Button variant="ghost" className="relative p-2">
        <ShoppingCart className="h-6 w-6" />
        {itemCount > 0 && (
          <>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
            <span className="hidden md:block ml-2 text-sm font-medium">${total.toLocaleString()}</span>
          </>
        )}
      </Button>
    </Link>
  )
}
