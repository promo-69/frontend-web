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
  const extractSession = (sessionResponse) => {
    if (!sessionResponse) return null
    if (sessionResponse.data?.session) return sessionResponse.data.session
    if (sessionResponse.data) return sessionResponse.data
    return sessionResponse
  }

  const normalizeSessionExpires = (session) => {
    if (!session) return null
    if (session.expires_in) return Number(session.expires_in)
    if (session.expires_at) {
      const parsed = Date.parse(session.expires_at)
      if (!Number.isNaN(parsed)) {
        return Math.max(0, Math.floor((parsed - Date.now()) / 1000))
      }
    }
    return null
  }

  const extractSessionCinemaId = (session) => {
    if (!session) return null
    if (typeof session.cinema === 'number') return session.cinema
    if (session.cinema?.id) return session.cinema.id
    if (session.cinema?.cinema_id) return session.cinema.cinema_id
    if (typeof session.cinemaId === 'number' || typeof session.cinemaId === 'string') return session.cinemaId
    if (typeof session._Cinemas?.id === 'number') return session._Cinemas.id
    return null
  }

  const startQuote = async (cinemaId) => {
    console.log('PurchaseContext.startQuote called', { cinemaId, quoteInitialized: quoteInitializedRef.current })
    if (!cinemaId) {
      console.warn('PurchaseContext.startQuote missing cinemaId', { cinemaId })
      return false
    }
    if (quoteInitializedRef.current) return true

    const payload = { cinema: cinemaId }

    try {
      const resp = await initializeOrderQuote(payload)
      console.log('PurchaseContext.startQuote response', resp)

      const expires = resp?.data?.expires_in || 300
      setExpiresAt(Date.now() + expires * 1000)
      setTimeLeft(expires)
      quoteInitializedRef.current = true
      return true
    } catch (err) {
      const status = err?.response?.status
      console.warn('PurchaseContext.startQuote failed', { status, error: err })

      if (status === 409) {
        console.log('PurchaseContext.startQuote conflict: intentando recuperar sesión existente')
        try {
          const existing = await getOrderSessionDetails()
          const session = extractSession(existing)
          const existingCinema = extractSessionCinemaId(session)

          if (existing && Number(existingCinema) === Number(cinemaId)) {
            const expires = normalizeSessionExpires(session)
            if (expires) {
              setExpiresAt(Date.now() + expires * 1000)
              setTimeLeft(expires)
            }
            quoteInitializedRef.current = true
            console.log('PurchaseContext.startQuote: reutilizando sesión existente', { existingCinema, cinemaId })
            return true
          }

          console.warn('PurchaseContext.startQuote: sesión existente no válida para esta sucursal, eliminando y reintentando', {
            existingCinema,
            cinemaId,
          })
          await deleteOrderSessionWithRetries()
          const retryResp = await initializeOrderQuote(payload)
          const retryExpires = retryResp?.data?.expires_in || 300
          setExpiresAt(Date.now() + retryExpires * 1000)
          setTimeLeft(retryExpires)
          quoteInitializedRef.current = true
          return true
        } catch (recoverErr) {
          console.error('PurchaseContext.startQuote recovery failed:', recoverErr)
          quoteInitializedRef.current = false
          return false
        }
      }

      console.error('Error iniciando quote:', err)
      quoteInitializedRef.current = false
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
  const connectSocket = () => {
    socketService.connect()

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
