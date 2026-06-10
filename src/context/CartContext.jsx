import { createContext, useContext, useState, useEffect } from 'react'

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

  const setCinema = (cinema) => {
    setCart((prev) => ({ ...prev, cinema }))
  }

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
        (p) => p.productId === product.productId,
      )

      if (exists) {
        return {
          ...prev,
          products: prev.products.map((p) =>
            p.productId === product.productId
              ? { ...p, quantity: p.quantity + product.quantity }
              : p,
          ),
        }
      }

      return {
        ...prev,
        products: [...prev.products, product],
      }
    })
  }

  // ❌ Quitar producto
  const removeProduct = (productId) => {
    setCart((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.productId !== productId),
    }))
  }

  // 🎬 Guardar película
  const setMovie = (movie) => {
    setCart((prev) => ({ ...prev, movie }))
  }

  // 🕒 Guardar showtime
  const setShowtime = (showtime) => {
    setCart((prev) => ({ ...prev, showtime }))
  }

  // 🧮 Totales
  const getTotals = () => {
    const ticketTotal = cart.tickets.reduce((acc, t) => acc + t.price, 0)
    const productTotal = cart.products.reduce(
      (acc, p) => acc + p.price * p.quantity,
      0,
    )

    const subtotal = ticketTotal + productTotal
    const iva = subtotal * 0.16
    const total = subtotal + iva

    return { ticketTotal, productTotal, subtotal, iva, total }
  }

  // 🧹 Limpiar carrito
  const clearCart = () => {
    setCart({
      tickets: [],
      products: [],
      movie: null,
      showtime: null,
    })
    localStorage.removeItem('cine_cart')
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        setCinema,
        addTicket,
        removeTicket,
        addProduct,
        removeProduct,
        setMovie,
        setShowtime,
        getTotals,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
