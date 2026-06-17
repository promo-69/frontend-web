import { createContext, useContext, useState, useRef, useEffect } from 'react'
import {
  initializeOrderQuote,
  deleteOrderSessionWithRetries,
  getOrderSessionDetails,
} from '../services/orders.service'
import socketService from '../services/socket.service'

const PurchaseContext = createContext()
export const usePurchase = () => useContext(PurchaseContext)

export function PurchaseProvider({ children }) {
  // --- Estado principal de la sesión de compra ---
  const [orderId, setOrderId] = useState(null)
  const [expiresAt, setExpiresAt] = useState(null)
  const [cinemaId, setCinemaId] = useState(null)
  const [showtimeId, setShowtimeId] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [isSeatFlow, setIsSeatFlow] = useState(false)

  const quoteInitializedRef = useRef(false)

  // --- Timer sincronizado con backend ---
  const [timeLeft, setTimeLeft] = useState(0)

  // =====================================================
  // 1) Inicializar sesión de compra (quote)
  // =====================================================
  const startQuote = async (cinemaId, customerId) => {
    if (!cinemaId || !customerId) return
    if (quoteInitializedRef.current) return
    quoteInitializedRef.current = true

    try {
      const resp = await initializeOrderQuote({
        cinema: cinemaId,
      })

      const expires = resp?.data?.expires_in || 300
      setExpiresAt(Date.now() + expires * 1000)
      setTimeLeft(expires)

      return true
    } catch (err) {
      console.error('Error iniciando quote:', err)
      return false
    }
  }

  // =====================================================
  // 2) Timer sincronizado con expiresAt
  // =====================================================
  useEffect(() => {
    if (!expiresAt) return

    const interval = setInterval(() => {
      const diff = Math.floor((expiresAt - Date.now()) / 1000)
      setTimeLeft(diff)

      if (diff <= 0) {
        clearInterval(interval)
        handleQuoteExpired()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt])

  const handleQuoteExpired = () => {
    console.warn('Quote expirado')
    cancelPurchase('ttl_expired')
  }

  // =====================================================
  // 3) Manejo de asientos
  // =====================================================
  const addSeat = (seatId) => {
    setSelectedSeats((prev) => [...prev, seatId])
  }

  const removeSeat = (seatId) => {
    setSelectedSeats((prev) => prev.filter((id) => id !== seatId))
  }

  const clearSeats = () => setSelectedSeats([])

  // =====================================================
  // 4) Cancelar compra
  // =====================================================
  const cancelPurchase = async () => {
    try {
      await deleteOrderSessionWithRetries()
    } catch (err) {
      if (err?.response?.status === 404) {
        console.warn('No había sesión activa, continuar cancelación')
      } else {
        console.error('Error cancelando compra:', err)
      }
    }

    clearSeats()
    setOrderId(null)
    setExpiresAt(null)
    setShowtimeId(null)
    setCinemaId(null)
    quoteInitializedRef.current = false
  }

  // =====================================================
  // 5) Manejo de WebSocket global
  // =====================================================
  const connectSocket = (token) => {
    socketService.connect(token)

    socketService.on('quote_expired', handleQuoteExpired)

    socketService.on('payment_success', ({ orderId, qrCode }) => {
      window.location.href = `/success?order=${orderId}&qr=${qrCode}`
    })
  }

  const disconnectSocket = () => {
    socketService.disconnect()
  }

  // =====================================================
  // 6) Exponer API del contexto
  // =====================================================
  return (
    <PurchaseContext.Provider
      value={{
        orderId,
        expiresAt,
        timeLeft,
        cinemaId,
        showtimeId,
        selectedSeats,
        isSeatFlow,

        setCinemaId,
        setShowtimeId,
        setIsSeatFlow,

        startQuote,
        addSeat,
        removeSeat,
        clearSeats,
        cancelPurchase,

        connectSocket,
        disconnectSocket,
      }}
    >
      {children}
    </PurchaseContext.Provider>
  )
}
