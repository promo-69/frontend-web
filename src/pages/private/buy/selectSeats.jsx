import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getShowtimeById,
  getSeatMap,
} from '../../../services/showtimes.service'
import {
  initializeOrderQuote,
  deleteOrderSessionWithRetries,
  getOrderSession,
  getOrderSessionDetails,
} from '../../../services/orders.service'

// ⭐ Usamos exclusivamente el servicio unificado
import socketService from '../../../services/socket.service'

import ShowtimeHeader from '../../../components/selectSeats/ShowtimeHeader'
import SeatMap from '../../../components/selectSeats/SeatMap'
import SeatLegend from '../../../components/selectSeats/SeatLegend'
import OrderSummary from '../../../components/selectSeats/OrderSummary'
import { useCart } from '../../../context/CartContext'

export default function SelectSeats() {
  const { movieId, showtimeId } = useParams()
  const navigate = useNavigate()

  const {
    addTicket,
    removeTicket,
    setMovie,
    setShowtime: setShowtimeCart,
    clearCart,
    cart,
  } = useCart()

  const [showtime, setShowtime] = useState(null)
  const [seats, setSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [ticketsNeeded, setTicketsNeeded] = useState(1)
  const [timeLeft, setTimeLeft] = useState(300)

  // Estados de manejo de cancelación 
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState(null)
  const [cancelAttempts, setCancelAttempts] = useState(0)
  const [hasCancelled, setHasCancelled] = useState(false)

  const quoteInitializedRef = useRef(false)
  const user = JSON.parse(localStorage.getItem('user'))

  // ============================
  // 1) Cargar showtime + mapa (HTTP)
  // ============================
  useEffect(() => {
    async function load() {
      try {
        console.log('→ Cargando showtime:', {
          cinemaId: cart.cinema?.id,
          showtimeId,
        })

        const st = await getShowtimeById(cart.cinema.id, showtimeId)
        console.log('→ Showtime cargado:', st)

        const map = await getSeatMap(cart.cinema.id, showtimeId)
        console.log('→ Seats recibidos:', map.seats)

        setShowtime(st)
        setShowtimeCart(st)
        setMovie(st.movie)
        setSeats(map.seats || [])
      } catch (err) {
        console.error('Error cargando SelectSeats:', err)
      } finally {
        setLoading(false)
      }
    }

    if (cart.cinema?.id) load()
  }, [showtimeId, cart.cinema])

  // ============================
  // 2) Inicializar Orden de Compra 
  // ============================
  useEffect(() => {
    const initQuote = async () => {
      if (!cart.cinema?.id || quoteInitializedRef.current) return
      quoteInitializedRef.current = true

      try {
        const existingSession = await getOrderSession()
        const sessionStatus = existingSession?.data?.session?.status

        if (sessionStatus === 'pending_payment') {
          const expires =
            existingSession?.data?.session?.expires_in ||
            existingSession?.data?.session?.expires ||
            300
          setTimeLeft(expires)
          return
        }

        const resp = await initializeOrderQuote({
          cinema: cart.cinema.id,
          customerId: user?.id,
        })

        const expires = resp?.data?.expires_in || resp?.data?.expires || 300
        setTimeLeft(expires)
      } catch (err) {
        console.warn('No se pudo iniciar la cotización:', err)
      }
    }

    initQuote()
  }, [cart.cinema])

  // ============================
  // 3) Conectar / Desconectar Socket mediante socketService
  // ============================
  useEffect(() => {
    if (!showtimeId) return

    const token = localStorage.getItem('token')
    socketService.connect(token)

    const onConnect = () => {
      console.log('Socket conectado exitosamente')
      // Unirse a la sala usando el método estructural de tu servicio
      socketService.joinShowtime(showtimeId)
    }

    const onDisconnect = () => {
      console.log('Socket desconectado')
    }

    socketService.on('connect', onConnect)
    socketService.on('disconnect', onDisconnect)

    return () => {
      socketService.off('connect', onConnect)
      socketService.off('disconnect', onDisconnect)
      socketService.leaveShowtime(showtimeId)
      socketService.disconnect()
    }
  }, [showtimeId])

  // ============================
  // 4) Escuchar Eventos del Servidor 
  // ============================
  useEffect(() => {
    if (!showtimeId) return

    const onJoinSuccess = () => console.log('Entraste a la sala correctamente')

    const onJoinError = ({ message }) => {
      console.error('❌ Error al unirse a la sala:', message)
      alert(message)
      navigate('/')
    }

    // El backend confirma que bloqueaste el asiento con éxito
    const onSeatLockSuccess = ({ seatId }) => {
      setSeats((prev) =>
        prev.map((s) => (s.id === seatId ? { ...s, status: 'selected' } : s)),
      )
    }

    // Error al intentar bloquear (ej. alguien ganó el asiento)
    const onSeatLockError = ({ seatId, message }) => {
      alert(message)
      setSeats((prev) =>
        prev.map((s) => (s.id === seatId ? { ...s, status: 'available' } : s)),
      )
      try {
        removeTicket(seatId)
      } catch (e) {
        /* ignore */
      }
    }

    // Otro usuario bloqueó un asiento en tiempo real
    const onSeatLockedByOther = ({ seatId }) => {
      setSeats((prev) =>
        prev.map((s) => (s.id === seatId ? { ...s, status: 'locked' } : s)),
      )
    }

    // Un asiento se liberó 
    const onSeatUnlocked = ({ seatId }) => {
      setSeats((prev) =>
        prev.map((s) => (s.id === seatId ? { ...s, status: 'available' } : s)),
      )
    }

    // Lote de asientos liberados de golpe (ej: por expiración masiva)
    const onSeatsUnlockedBulk = ({ seatIds }) => {
      setSeats((prev) =>
        prev.map((s) =>
          seatIds.includes(s.id) ? { ...s, status: 'available' } : s,
        ),
      )
      try {
        seatIds.forEach((id) => removeTicket(id))
      } catch (e) {
        /* ignore */
      }
    }

    // El asiento cambió a vendido permanentemente
    const onSeatsSoldFinal = ({ seatIds }) => {
      setSeats((prev) =>
        prev.map((s) =>
          seatIds.includes(s.id) ? { ...s, status: 'sold' } : s,
        ),
      )
    }

    // Expiró la cotización desde el backend
    const onQuoteExpired = () => {
      alert('Tu tiempo de compra expiró')
      handleCancelOrder('ttl_expired')
    }

    // Registro de listeners en el servicio unificado
    socketService.on('join_success', onJoinSuccess)
    socketService.on('join_error', onJoinError)
    socketService.on('seat_lock_success', onSeatLockSuccess)
    socketService.on('seat_lock_error', onSeatLockError)
    socketService.on('seat_locked_by_other', onSeatLockedByOther)
    socketService.on('seat_unlocked', onSeatUnlocked)
    socketService.on('seats_unlocked', onSeatsUnlockedBulk)
    socketService.on('seats_sold_final', onSeatsSoldFinal)
    socketService.on('quote_expired', onQuoteExpired)

    return () => {
      socketService.off('join_success', onJoinSuccess)
      socketService.off('join_error', onJoinError)
      socketService.off('seat_lock_success', onSeatLockSuccess)
      socketService.off('seat_lock_error', onSeatLockError)
      socketService.off('seat_locked_by_other', onSeatLockedByOther)
      socketService.off('seat_unlocked', onSeatUnlocked)
      socketService.off('seats_unlocked', onSeatsUnlockedBulk)
      socketService.off('seats_sold_final', onSeatsSoldFinal)
      socketService.off('quote_expired', onQuoteExpired)
    }
  }, [showtimeId, navigate])

  // ============================
  // 5) Lógica de Selección (Toggle Asiento)
  // ============================
  const selectedSeats = seats.filter((s) => s.status === 'selected')

  const toggleSeat = (seatId) => {
    const seat = seats.find((s) => s.id === seatId)
    if (!seat) return

    if (seat.status === 'sold' || seat.status === 'locked') return

    // Validar límite de entradas solicitadas
    if (seat.status === 'available' && selectedSeats.length >= ticketsNeeded) {
      return
    }

    if (seat.status === 'available') {
      // Agregamos localmente al carrito primero para dar feedback rápido
      try {
        addTicket({
          seatId: seat.id,
          id: seat.id,
          originalId: seat.id,
          price: showtime?.price || 0,
        })
      } catch (e) {
        /* ignore */
      }

      // Emitir bloqueo al backend por medio de socketService
      socketService.emit('lock_seat', { seatId })
    } else if (seat.status === 'selected') {
      // Emitir liberación al backend
      socketService.emit('unlock_seat', { seatId })
      try {
        removeTicket(seat.id)
      } catch (e) {
        /* ignore */
      }
    }
  }

  // ============================
  // 6) Temporizador del lado del Cliente
  // ============================
  useEffect(() => {
    if (selectedSeats.length === 0 || hasCancelled) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          handleTimeExpired()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [selectedSeats, hasCancelled])

  const handleTimeExpired = () => {
    if (hasCancelled) return
    handleCancelOrder('ttl_expired')
  }

  // ============================
  // 7) Lógica de Cancelación e Infraestructura HTTP
  // ============================
  const releaseLocksAndLeave = () => {
    selectedSeats.forEach((s) => {
      socketService.emit('unlock_seat', { seatId: s.id })
    })
    socketService.leaveShowtime(showtimeId)
  }

  const resetLockedSeatsLocal = () => {
    setSeats((prev) =>
      prev.map((s) =>
        s.status === 'selected' ? { ...s, status: 'available' } : s,
      ),
    )
  }

  const confirmCancellationSuccess = async () => {
    try {
      const details = await getOrderSessionDetails()
      const session = details?.data?.session
      return !session || session?.status !== 'pending_payment'
    } catch (err) {
      console.warn('No se pudo verificar la sesión después de cancelar:', err)
      return false
    }
  }

  const handleCancelOrder = async (reason = 'manual') => {
    if (hasCancelled) return

    setIsCancelling(true)
    setCancelError(null)
    setCancelAttempts((prev) => prev + 1)

    try {
      // 1. Desbloquear via WebSockets primero
      releaseLocksAndLeave()
      resetLockedSeatsLocal()
      setTimeLeft(0)

      const details = await getOrderSessionDetails()
      const orderId = details?.data?.order?.id
      const orderStatus = details?.data?.order?.order_status

      if (orderId && orderStatus !== null) {
        console.log('Cancelación: orden existente pendiente', {
          orderId,
          orderStatus,
          reason,
        })
      }

      // 2. Destruir sesión en base de datos vía API REST
      await deleteOrderSessionWithRetries()
      const cancelled = await confirmCancellationSuccess()

      if (!cancelled) {
        throw new Error(
          'No fue posible confirmar la cancelación en el servidor',
        )
      }

      setHasCancelled(true)
      clearCart()
      navigate('/')
    } catch (err) {
      console.error('Error cancelando orden:', err)
      setCancelError(
        'No fue posible cancelar automáticamente. Pulsa Forzar cancelación o contacta soporte.',
      )
    } finally {
      setIsCancelling(false)
    }
  }

  const handleNext = () => {
    navigate(`/buy/${movieId}/${showtimeId}/confectionery`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p className="animate-pulse">Cargando mapa de asientos…</p>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen text-white pb-20"
      style={{
        background:
          'linear-gradient(to bottom,#231640 0%,#7B1A82 50%,#231640 100%)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <ShowtimeHeader showtime={showtime} />

        {selectedSeats.length > 0 && (
          <div className="space-y-4">
            <p className="text-center text-yellow-300 font-bold text-xl">
              Tiempo restante: {Math.floor(timeLeft / 60)}:
              {String(timeLeft % 60).padStart(2, '0')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => handleCancelOrder('manual')}
                disabled={isCancelling}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl font-semibold transition"
              >
                {isCancelling ? 'Cancelando...' : 'Cancelar compra'}
              </button>
              <button
                onClick={handleNext}
                disabled={isCancelling}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-3 rounded-xl font-semibold transition"
              >
                Continuar confitería
              </button>
            </div>

            {cancelError && (
              <p className="text-center text-red-400 text-sm">{cancelError}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <SeatMap seats={seats} onToggle={toggleSeat} />
            <SeatLegend />
          </div>

          <OrderSummary onNext={handleNext} />
        </div>
      </div>
    </div>
  )
}
