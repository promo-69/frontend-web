import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'

export const CartContext = createContext()

export function CartProvider({ children }) {
  // 🛒 Estado global del carrito
  const [cart, setCart] = useState({
    tickets: [],
    products: [],
    movie: null,
    showtime: null,
    cinema: null,
  })

  const setCinema = useCallback((cinema) => {
    setCart((prev) => ({ ...prev, cinema }))
  }, [])

  // 🧊 Persistencia: cargar carrito desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cine_cart')
    if (saved) {
      setCart(JSON.parse(saved))
    }
  }, [])

  // 💾 Guardar carrito cada vez que cambie
  useEffect(() => {
    localStorage.setItem('cine_cart', JSON.stringify(cart))
  }, [cart])

  // Agregar boletos
  const addTicket = (ticket) => {
    setCart((prev) => {
      const exists = prev.tickets.find((t) => t.seatId === ticket.seatId)
      if (exists) return prev

      return {
        ...prev,
        tickets: [...prev.tickets, ticket],
      }
    })
  }


  // ❌ Quitar boleto
  const removeTicket = (seatId) => {
    setCart((prev) => ({
      ...prev,
      tickets: prev.tickets.filter((t) => t.seatId !== seatId),
    }))
  }

  // 🍿 Agregar producto de confitería
  const addProduct = (product) => {
    setCart((prev) => {
      const exists = prev.products.find(
        (p) =>
          p.productId === product.productId && p.type === product.type,
      )

      if (exists) {
        const updatedQuantity = exists.quantity + product.quantity

        if (updatedQuantity <= 0) {
          return {
            ...prev,
            products: prev.products.filter(
              (p) =>
                !(p.productId === product.productId && p.type === product.type),
            ),
          }
        }

        return {
          ...prev,
          products: prev.products.map((p) =>
            p.productId === product.productId && p.type === product.type
              ? { ...p, quantity: updatedQuantity }
              : p,
          ),
        }
      }

      if (product.quantity <= 0) {
        return prev
      }

      return {
        ...prev,
        products: [...prev.products, product],
      }
    })
  }

  const updateProductQuantity = (productId, type, quantity) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return {
          ...prev,
          products: prev.products.filter(
            (p) => !(p.productId === productId && p.type === type),
          ),
        }
      }

      return {
        ...prev,
        products: prev.products.map((p) =>
          p.productId === productId && p.type === type
            ? { ...p, quantity }
            : p,
        ),
      }
    })
  }

  // ❌ Quitar producto
  const removeProduct = (productId, type) => {
    setCart((prev) => ({
      ...prev,
      products: prev.products.filter(
        (p) => !(p.productId === productId && p.type === type),
      ),
    }))
  }

  // 🎬 Guardar película
  const setMovie = (movie) => {
    setCart((prev) => ({ ...prev, movie }))
  }

  // 🕒 Guardar showtime
  const setShowtime = useCallback((showtime) => {
    setCart((prev) => ({ ...prev, showtime }))
  }, [])

  // 🧮 Totales
  const getTotals = useCallback(() => {
    const ticketTotal = cart.tickets.reduce((acc, t) => acc + t.price, 0)
    const productTotal = cart.products.reduce(
      (acc, p) => acc + p.price * p.quantity,
      0,
    )

    const subtotal = ticketTotal + productTotal
    const iva = subtotal * 0.16
    const total = subtotal + iva

    return { ticketTotal, productTotal, subtotal, iva, total }
  }, [cart])

  // 🧹 Limpiar carrito
  const clearCart = useCallback(() => {
    setCart({
      tickets: [],
      products: [],
      movie: null,
      showtime: null,
      cinema: null,
    })
    localStorage.removeItem('cine_cart')
  }, [])

  const contextValue = useMemo(
    () => ({
      cart,
      setCinema,
      addTicket,
      removeTicket,
      addProduct,
      updateQuantity: updateProductQuantity,
      removeProduct,
      setMovie,
      setShowtime,
      getTotals,
      clearCart,
    }),
    [
      cart,
      setCinema,
      addTicket,
      removeTicket,
      addProduct,
      updateProductQuantity,
      removeProduct,
      setMovie,
      setShowtime,
      getTotals,
      clearCart,
    ],
  )

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
