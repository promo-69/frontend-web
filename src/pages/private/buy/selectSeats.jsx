import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  getShowtimeById,
  getSeatMap,
} from '../../../services/showtimes.service'

import socketService from '../../../services/socket.service'

import ShowtimeHeader from '../../../components/selectSeats/ShowtimeHeader'
import SeatMap from '../../../components/selectSeats/SeatMap'
import SeatLegend from '../../../components/selectSeats/SeatLegend'
import OrderSummary from '../../../components/selectSeats/OrderSummary'

import { usePurchase } from '../../../context/PurchaseContext'
import { useCart } from '../../../context/CartContext'
import TicketSelector from '../../../components/selectSeats/TicketSelector'


export default function SelectSeats() {
  const { movieId, showtimeId } = useParams()
  const navigate = useNavigate()

  // ============================
  // Obtener cinemaId desde navegación
  // ============================
  const locationState = useLocation().state || {}
  const [resolvedCinemaId, setResolvedCinemaId] = useState(
    locationState.cinemaId || null,
  )

  const {
    setCinemaId: setPurchaseCinema,
    setShowtimeId: setPurchaseShowtime,
    setIsSeatFlow,
    startQuote,
    connectSocket,
    addSeat,
    removeSeat,
    selectedSeats,
    timeLeft,
    cancelPurchase,
  } = usePurchase()

  const { cart, clearCart, addTicket, removeTicket } = useCart()

  const [showtime, setShowtime] = useState(null)
  const [seats, setSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [quoteReady, setQuoteReady] = useState(false)
  const [quoteError, setQuoteError] = useState(null)
  const [retryingQuote, setRetryingQuote] = useState(false)

  // ========================================================
  // Contadores independientes para tipos de boletos
  // ========================================================
  const [ticketCounts, setTicketCounts] = useState({
    1: 0, // Adulto
    2: 0, // Niño
    3: 0, // Tercera Edad
  })
  // Obtener el límite total permitido configurado por el usuario arriba
  const totalTicketsAllowed = useMemo(() => {
    return Object.values(ticketCounts).reduce((a, b) => a + b, 0)
  }, [ticketCounts])
  const handleIncrementTicket = (categoryId) => {
    setTicketCounts((prev) => ({ ...prev, [categoryId]: prev[categoryId] + 1 }))
  }
  const handleDecrementTicket = (categoryId) => {
    setTicketCounts((prev) => {
      const current = prev[categoryId]
      if (current === 0) return prev

      const nextCounts = { ...prev, [categoryId]: current - 1 }
      const newTotal = Object.values(nextCounts).reduce((a, b) => a + b, 0)
      
      if (selectedSeats.length > newTotal) {
        const lastSeatId = selectedSeats[selectedSeats.length - 1]
        if (lastSeatId) {
          socketService.emit('unlock_seat', { seatId: lastSeatId })
        }
      }
      return nextCounts
    })
  }

  // ============================
  // Cargar showtime + mapa
  // ============================
  useEffect(() => {
    async function load() {
      try {
        const st = await getShowtimeById(
          resolvedCinemaId || showtimeId,
          resolvedCinemaId ? showtimeId : undefined,
        )
        const map = await getSeatMap(
          resolvedCinemaId || showtimeId,
          resolvedCinemaId ? showtimeId : undefined,
        )

        setShowtime(st)
        setSeats(map.seats || [])

        if (!resolvedCinemaId) {
          const inferredCinemaId =
            st?.cinema?.id || st?.cinemaId || st?.cinema_id || null
          if (inferredCinemaId) {
            setResolvedCinemaId(inferredCinemaId)
          }
        }
      } catch (err) {
        console.error('Error cargando SelectSeats:', err)
      } finally {
        setLoading(false)
      }
    }

    if (showtimeId) load()
  }, [resolvedCinemaId, showtimeId])

  // ============================
  // Inicializar Quote + Socket
  // ============================
  // Exponer función reusable para iniciar la cotización.
  const initPurchaseSession = async () => {
    try {
      setQuoteReady(false)
      setQuoteError(null)

      // Sincronizar estados base de forma síncrona
      setIsSeatFlow(true)
      setPurchaseCinema(resolvedCinemaId)
      setPurchaseShowtime(showtimeId)

      // Ejecutar y esperar la cotización del Backend.
      const res = await startQuote(resolvedCinemaId, showtimeId)
      if (!res) {
        setQuoteError('No se pudo iniciar la sesión de compra')
        return false
      }

      connectSocket()
      setQuoteReady(true)
      return true
    } catch (err) {
      console.error('Error en proceso initPurchaseSession:', err)
      setQuoteError('Error crítico al preparar la orden')
      return false
    }
  }

  useEffect(() => {
    if (!resolvedCinemaId || !showtimeId) return
    let mounted = true
    initPurchaseSession().then(() => mounted && null)
    return () => {
      mounted = false
    }
  }, [resolvedCinemaId, showtimeId])

  // ============================
  // Unirse a la sala y escuchar eventos
  // ============================
  useEffect(() => {
    if (!quoteReady || !showtimeId) return

    let socket = socketService.getSocket()
    if (!socket) {
      console.warn(
        'SelectSeats: No se detectó un socket instanciado, conectando ahora...',
      )
      socketService.connect()
      socket = socketService.getSocket()
    }

    let joinErrorTimers = []
    let mounted = true

    const onJoinSuccess = ({ showtimeId: joinedId }) => {
      if (Number(joinedId) === Number(showtimeId)) {
        setQuoteError(null)
      }
    }

    const onJoinError = ({ message }) => {
      console.warn('[Socket] join_error:', message)
      if (!message || !mounted) return
      joinErrorTimers.forEach(clearTimeout)
      joinErrorTimers = []
      joinErrorTimers.push(setTimeout(() => {
        if (!mounted) return
        if (socketService.getSocket()?.connected) {

          socketService.joinShowtime(showtimeId, true)
        }
      }, 800))
      joinErrorTimers.push(setTimeout(() => {
        if (!mounted) return
        if (quoteError) return
        setQuoteError(message)
        cancelPurchase('join_error')
      }, 2500))
      socketService.on('join_success', () => {
        joinErrorTimers.forEach(clearTimeout)
        joinErrorTimers = []
        setQuoteError(null)
      })
    }

    const onSeatLockSuccess = ({ seatId }) => {
      setSeats((prev) =>
        prev.map((s) => (s.id === seatId ? { ...s, status: 'selected' } : s)),
      )
      addSeat(seatId)
    }

    const onSeatLockError = ({ seatId, message }) => {
      if (message) setQuoteError(message)
      setSeats((prev) =>
        prev.map((s) => (s.id === seatId ? { ...s, status: 'available' } : s)),
      )
      removeSeat(seatId)
    }

    const onSeatLockedByOther = ({ seatId }) => {
      setSeats((prev) =>
        prev.map((s) => (s.id === seatId ? { ...s, status: 'locked' } : s)),
      )
    }

    const onSeatUnlocked = ({ seatId }) => {
      setSeats((prev) =>
        prev.map((s) => (s.id === seatId ? { ...s, status: 'available' } : s)),
      )
      removeSeat(seatId)
    }

    const onSeatsUnlockedBulk = ({ seatIds }) => {
      setSeats((prev) =>
        prev.map((s) =>
          seatIds.includes(s.id) ? { ...s, status: 'available' } : s,
        ),
      )
      seatIds.forEach((id) => removeSeat(id))
    }

    const onSeatsSoldFinal = ({ seatIds }) => {
      setSeats((prev) =>
        prev.map((s) =>
          seatIds.includes(s.id) ? { ...s, status: 'sold' } : s,
        ),
      )
    }

    const onQuoteExpired = () => {
      alert('Tu tiempo de compra expiró')
      cancelPurchase('ttl_expired')
      clearCart()
      navigate('/')
    }

    // Acoplar receptores
    socketService.on('join_success', onJoinSuccess)
    socketService.on('join_error', onJoinError)
    socketService.on('seat_lock_success', onSeatLockSuccess)
    socketService.on('seat_lock_error', onSeatLockError)
    socketService.on('seat_locked_by_other', onSeatLockedByOther)
    socketService.on('seat_unlocked', onSeatUnlocked)
    socketService.on('seats_unlocked', onSeatsUnlockedBulk)
    socketService.on('seats_sold_final', onSeatsSoldFinal)
    socketService.on('quote_expired', onQuoteExpired)

    socketService.joinShowtime(showtimeId)

    return () => {
      mounted = false
      joinErrorTimers.forEach(clearTimeout)
      joinErrorTimers = []
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
  }, [quoteReady, showtimeId])

  // ========================================================
  //  Filtrar boletos enriquecidos secuencialmente con audiencias
  // ========================================================
  const fullSelectedSeatsObjects = useMemo(() => {
    const filteredSeats = seats.filter((s) => selectedSeats.includes(s.id))
    // Construir una cola plana basada en las selecciones superiores
    const audienceQueue = []
    Object.entries(ticketCounts).forEach(([categoryId, count]) => {
      for (let i = 0; i < count; i++) {
        audienceQueue.push(Number(categoryId))
      }
    })

    const categoryNames = {
      1: 'Adulto',
      2: 'Niño',
      3: 'Tercera Edad',
    }
    // Inyectamos secuencialmente a cada asiento el tipo de boleto correspondiente
    return filteredSeats.map((seat, index) => {
      const categoryId = audienceQueue[index] || 1
      return {
        ...seat,
        seatId: seat.id, // coincida con lo que espera el carrito
        bookingId:
          showtime?.booking?.id ||
          showtime?.booking?.booking_id ||
          showtime?.booking?.bookingId ||
          null,
        label: seat.label || `${seat.row}${seat.column}`,
        price: seat.price || 6.0, // Fallback si el mapa no trae costo base
        assignedAudienceId: categoryId,
        categoryName: categoryNames[categoryId],
      }
    })
  }, [seats, selectedSeats, ticketCounts])

  // ========================================================
  // Sincronización Automática con el CartContext
  // ========================================================
  useEffect(() => {
    if (fullSelectedSeatsObjects.length === 0) {
      if (cart.tickets.length > 0) {
        cart.tickets.forEach((cartTicket) => removeTicket(cartTicket.seatId))
      }
      return
    }

    fullSelectedSeatsObjects.forEach((ticket) => {
      addTicket(ticket)
    })

    cart.tickets.forEach((cartTicket) => {
      const remainsSelected = fullSelectedSeatsObjects.some(
        (t) => t.seatId === cartTicket.seatId,
      )
      if (!remainsSelected) {
        removeTicket(cartTicket.seatId)
      }
    })
  }, [fullSelectedSeatsObjects, cart.tickets, addTicket, removeTicket])

  // ============================
  // Toggle asiento
  // ============================
  const toggleSeat = (seatId) => {
    const seat = seats.find((s) => s.id === seatId)
    if (!seat) return

    if (seat.status === 'sold' || seat.status === 'locked') return

    if (seat.status === 'available') {
      //  VALIDACIONES PREVENTIVAS DE SEGURIDAD INTERNA:
      if (totalTicketsAllowed === 0) {
        alert(
          'Por favor, indica primero cuántos boletos deseas comprar en la sección superior.',
        )
        return
      }
      if (selectedSeats.length >= totalTicketsAllowed) {
        alert(
          `Ya has seleccionado la cantidad máxima de asientos permitida por tus boletos (${totalTicketsAllowed}).`,
        )
        return
      }
      // ✅ Solo si pasa la validación emite el bloqueo seguro al socket
      socketService.emit('lock_seat', { seatId })
    } else if (seat.status === 'selected') {
      socketService.emit('unlock_seat', { seatId })
    }
  }

  // ============================
  // Cancelación Manual
  // ============================
  const handleCancelPurchase = () => {
    cancelPurchase('manual')
    clearCart() 
    navigate('/')
  }

  // ========================================================
  // Lógicas de Navegación (confiteria vs pagar)
  // ========================================================
  const handleNext = () => {
    navigate(`/buy/${movieId}/${showtimeId}/confectionery`, {
      state: { cinemaId: resolvedCinemaId },
    })
  }

  const handleDirectCheckout = () => {
    navigate(`/buy/${movieId}/${showtimeId}/checkout`, {
      state: { cinemaId: resolvedCinemaId },
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p className="animate-pulse">Cargando mapa de asientos…</p>
      </div>
    )
  }

  if (quoteError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white px-6">
        <h1 className="text-2xl font-bold mb-4">
          No se pudo iniciar la sesión de compra
        </h1>
        <p className="text-center max-w-xl mb-6">
          Ocurrió un problema al preparar tu compra. Intenta recargar la página
          o regresa al listado de funciones.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-3 rounded-xl font-semibold transition"
          >
            Volver al inicio
          </button>
          <button
            onClick={async () => {
              setRetryingQuote(true)
              await initPurchaseSession()
              setRetryingQuote(false)
            }}
            disabled={retryingQuote}
            className={`px-5 py-3 rounded-xl font-semibold transition ${retryingQuote ? 'bg-gray-600 text-gray-300' : 'bg-green-500 hover:bg-green-600 text-black'}`}
          >
            {retryingQuote ? 'Reintentando...' : 'Reintentar cotización'}
          </button>
        </div>
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

        <TicketSelector
          counts={ticketCounts}
          onIncrement={handleIncrementTicket}
          onDecrement={handleDecrementTicket}
          maxAllowed={10} // Límite máximo general por transacción
        />

        {selectedSeats.length > 0 && (
          <div className="space-y-4">
            <p className="text-center text-yellow-300 font-bold text-xl">
              Tiempo restante: {Math.floor(timeLeft / 60)}:
              {String(timeLeft % 60).padStart(2, '0')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleCancelPurchase}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl font-semibold transition"
              >
                Cancelar compra
              </button>
              <button
                onClick={handleNext}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-3 rounded-xl font-semibold transition"
              >
                Continuar confitería
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <SeatMap seats={seats} onToggle={toggleSeat} />
            <SeatLegend />
          </div>

          <OrderSummary
            mode="seats"
            onNext={handleNext}
            onDirectCheckout={handleDirectCheckout}
            currentShowtime={showtime}
            selectedSeatsList={fullSelectedSeatsObjects}
          />
        </div>
      </div>
    </div>
  )
}
