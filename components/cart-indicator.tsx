"use client"

import { useEffect, useState } from "react"

const CartIndicator = () => {
  const [itemCount, setItemCount] = useState(0)

  const fetchCartCount = async () => {
    // Obtener el carrito del localStorage
    const cart = localStorage.getItem("cart")
    if (cart) {
      const cartItems = JSON.parse(cart)
      // Calcular el número total de elementos en el carrito
      const totalItems = cartItems.reduce((total: number, item: { quantity: number }) => total + item.quantity, 0)
      setItemCount(totalItems)
    } else {
      setItemCount(0)
    }
  }

  // Escuchar eventos de actualización del carrito
  useEffect(() => {
    fetchCartCount()

    const handleCartUpdate = () => {
      fetchCartCount()
    }

    window.addEventListener("cartUpdated", handleCartUpdate)

    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate)
    }
  }, [])

  return <div>Carrito: {itemCount} items</div>
}

export default CartIndicator
