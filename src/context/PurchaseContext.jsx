import { createContext, useContext, useState, useRef, useEffect } from 'react'
import {
  initializeOrderQuote,
  getOrderSessionDetails,
  deleteOrderSessionWithRetries
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
  const startQuote = async (targetCinemaId) => {
    if (!targetCinemaId) return false

    // Si ya fue inicializada con éxito por este contexto en este ciclo, evitamos re-peticiones
    if (quoteInitializedRef.current) return true
    quoteInitializedRef.current = true

    try {
      console.log('[PurchaseContext] Intentando crear la cotización primero en el servidor...')
      
      const resp = await initializeOrderQuote({
        cinema: Number(targetCinemaId)
      })

      // Si se crea con éxito, extraemos y configuramos los tiempos de Redis
      const expires = resp?.data?.expires_in || resp?.expires_in || 300
      setExpiresAt(Date.now() + expires * 1000)
      setTimeLeft(expires)
      setCinemaId(targetCinemaId)

      return true
    } catch (err) {
      const status = err?.response?.status
      console.warn(`[PurchaseContext] Error al crear cotización (Status: ${status}). Intentando rescatar sesión existente...`)

      if (status === 409) {
        try {
          const existingSession = await getOrderSessionDetails()
          if (!existingSession?.data?.session) {
            throw err
          }

          const activeSession = existingSession.data.session
          console.log('[PurchaseContext] Sesión concurrente (409) recuperada exitosamente:', activeSession)

          setCinemaId(activeSession.cinemaId || targetCinemaId)
          
          const expires = existingSession.data.expires_in || 300
          setExpiresAt(Date.now() + expires * 1000)
          setTimeLeft(expires)

          return true
        } catch (innerErr) {
          console.error('[PurchaseContext] No se pudo reutilizar la sesión tras el conflicto 409:', innerErr)
          quoteInitializedRef.current = false
          return false
        }
      } else {
        try {
          const existingSession = await getOrderSessionDetails()
          if (!existingSession?.data?.session) {
            throw err
          }

          const activeSession = existingSession.data.session
          console.log('[PurchaseContext] Sesión alternativa recuperada exitosamente tras error:', activeSession)

          setCinemaId(activeSession.cinemaId || targetCinemaId)
          
          const expires = existingSession.data.expires_in || 300
          setExpiresAt(Date.now() + expires * 1000)
          setTimeLeft(expires)

          return true
        } catch (innerErr) {
          console.error('[PurchaseContext] Error absoluto: No se pudo crear ni recuperar ninguna sesión activa:', innerErr)
          quoteInitializedRef.current = false
          return false
        }
      }
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
