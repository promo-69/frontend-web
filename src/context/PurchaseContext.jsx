import { createContext, useContext, useState, useRef, useEffect } from 'react'
import {
  initializeOrderQuote,
  deleteOrderSessionWithRetries,
} from '../services/orders.service'
import socketService from '../services/socket.service'

const PurchaseContext = createContext()
export const usePurchase = () => useContext(PurchaseContext)

export function PurchaseProvider({ children }) {
  const [expiresAt, setExpiresAt] = useState(null)
  const [cinemaId, setCinemaId] = useState(null)
  const [showtimeId, setShowtimeId] = useState(null)
  const [selectedSeats, setSelectedSeats] = useState([])
  const [isSeatFlow, setIsSeatFlow] = useState(false)

  const quoteInitializedRef = useRef(false)
  const [timeLeft, setTimeLeft] = useState(0)

  // =====================================================
  // 1) Inicializar o recuperar sesión de compra (quote)
  // =====================================================
  const startQuote = async (cinemaId) => {
    if (!cinemaId) return false

    try {
      console.log(
        '[PurchaseContext] Verificando existencia de sesión en el servidor...',
      )
      const sessionData = await getOrderSessionDetails()

      if (sessionData && sessionData.success && sessionData.data) {
        const activeSession = sessionData.data
        console.log(
          '[PurchaseContext] Sesión activa recuperada del servidor:',
          activeSession,
        )

        // Si el servidor ya tiene una sesion guardada en Redis, usamos ese, si no, el que viene por parámetro
        setCinemaId(activeSession.cinemaId || cinemaId)

        const expires = activeSession.expires_in || 300
        setExpiresAt(Date.now() + expires * 1000)
        setTimeLeft(expires)

        quoteInitializedRef.current = true
        return true
      }
    } catch (err) {
      console.log(
        '[PurchaseContext] No hay sesión activa previa. Procediendo a crear una nueva...',
      )
    }

    if (quoteInitializedRef.current) return true

    try {
      console.log(
        '[PurchaseContext] Creando una nueva cotización (Quote) para la sucursal:',
        cinemaId,
      )
      
      const resp = await initializeOrderQuote({ cinema: Number(cinemaId) })

      const expires = resp?.data?.expires_in || resp?.expires_in || 300
      setExpiresAt(Date.now() + expires * 1000)
      setTimeLeft(expires)
      setCinemaId(cinemaId) 

      quoteInitializedRef.current = true
      return true
    } catch (err) {
      console.error('Error iniciando quote en Context:', err)
      quoteInitializedRef.current = false
      return false
    }
  }

  // =====================================================
  // 2) Timer sincronizado
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
      if (err?.response?.status !== 404) {
        console.error('Error cancelando compra:', err)
      }
    }

    clearSeats()
    setExpiresAt(null)
    setShowtimeId(null)
    setCinemaId(null)
    quoteInitializedRef.current = false

    socketService.disconnect()
  }

  // =====================================================
  // 5) WebSocket global
  // =====================================================
  const connectSocket = () => {
    socketService.connect()

    socketService.off('quote_expired')
    socketService.off('payment_success')

    socketService.on('quote_expired', handleQuoteExpired)

    socketService.on('payment_success', ({ orderId, qrCode }) => {
      window.location.href = `/success?order=${orderId}&qr=${qrCode}`
    })
  }

  const disconnectSocket = () => {
    socketService.disconnect()
  }

  return (
    <PurchaseContext.Provider
      value={{
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
