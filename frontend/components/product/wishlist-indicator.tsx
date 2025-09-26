"use client"

import { useWishlist } from "@/contexts/wishlist-context"

export default function WishlistIndicator() {
  const { itemCount } = useWishlist()

  if (itemCount === 0) return null

  return (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
      {itemCount > 99 ? "99+" : itemCount}
    </span>
  )
}