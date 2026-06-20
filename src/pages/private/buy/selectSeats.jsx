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


export default function SelectSeats() {
  const { movieId, showtimeId } = useParams()
  const navigate = useNavigate()

  // ============================
  // 0) Obtener cinemaId desde navegación
  // ============================
  const locationState = useLocation().state || {}
  const cinemaId = locationState.cinemaId || null

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

  const { clearCart } = useCart()

  const [showtime, setShowtime] = useState(null)
  const [seats, setSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [quoteReady, setQuoteReady] = useState(false)
  const [quoteError, setQuoteError] = useState(null)

  // ============================
  // 1) Cargar showtime + mapa
  // ============================
  useEffect(() => {
    async function load() {
      try {
        const st = await getShowtimeById(cinemaId, showtimeId)
        const map = await getSeatMap(cinemaId, showtimeId)

        setShowtime(st)
        setSeats(map.seats || [])
      } catch (err) {
        console.error('Error cargando SelectSeats:', err)
      } finally {
        setLoading(false)
      }
    }

    if (cinemaId) load()
  }, [cinemaId, showtimeId])

  // ============================
  // 2) Inicializar Quote + Socket
  // ============================
  useEffect(() => {
    if (!cinemaId || !showtimeId) return

    let mounted = true

    const initPurchaseSession = async () => {
      try {
        setQuoteReady(false)
        setQuoteError(null)

        // Sincronizar estados base de forma síncrona
        setIsSeatFlow(true)
        setPurchaseCinema(cinemaId)
        setPurchaseShowtime(showtimeId)

        // Ejecutar y esperar la cotización del Backend
        const res = await startQuote(cinemaId)
        if (!mounted) return

        if (!res) {
          setQuoteError('No se pudo iniciar la sesión de compra')
          return
        }

        // Si la cotización fue exitosa, levantamos el canal físico
        connectSocket()
        setQuoteReady(true)
      } catch (err) {
        console.error('Error en proceso initPurchaseSession:', err)
        if (mounted) setQuoteError('Error crítico al preparar la orden')
      }
    }

    initPurchaseSession()

    return () => {
      mounted = false
    }
  }, [cinemaId, showtimeId])

  // ============================
  // 3) Unirse a la sala y escuchar eventos
  // ============================
  useEffect(() => {
    if (!quoteReady || !showtimeId) return

    const socket = socketService.getSocket()
    if (!socket) {
      console.warn(
        'SelectSeats: No se detectó un socket instanciado para colgar listeners',
      )
      return
    }

    console.log('--- COLGANDO LISTENERS DEL SOCKET ---')
    // Definición de handlers de eventos
    const onJoinSuccess = () => console.log('Entraste a la sala correctamente')

    const onJoinError = ({ message }) => {
      alert(message)
      navigate('/')
    }

    const onSeatLockSuccess = ({ seatId }) => {
      console.log('✅ [Socket] Asiento bloqueado con éxito:', seatId)
      setSeats((prev) =>
        prev.map((s) => (s.id === seatId ? { ...s, status: 'selected' } : s)),
      )
      addSeat(seatId)
    }

    const onSeatLockError = ({ seatId, message }) => {
      console.error('❌ [Socket] Error bloqueando asiento:', message)
      alert(message)
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
      console.log('🔓 [Socket] Asiento liberado:', seatId)
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
      navigate('/')
    }

    // Enlace en caliente si el canal físico parpadea y se reconecta de golpe
    const handleReconnectedEmit = () => {
      console.log(
        '[Socket] Reactivación de red detectada, re-uniéndose a la sala...',
      )
      socketService.joinShowtime(showtimeId)
    }

    // 1. Acoplar receptores
    socketService.on('connect', handleReconnectedEmit)

    socketService.on('join_success', onJoinSuccess)
    socketService.on('join_error', onJoinError)
    socketService.on('seat_lock_success', onSeatLockSuccess)
    socketService.on('seat_lock_error', onSeatLockError)
    socketService.on('seat_locked_by_other', onSeatLockedByOther)
    socketService.on('seat_unlocked', onSeatUnlocked)
    socketService.on('seats_unlocked', onSeatsUnlockedBulk)
    socketService.on('seats_sold_final', onSeatsSoldFinal)
    socketService.on('quote_expired', onQuoteExpired)

    // Emitir la entrada
    console.log(' Emitiendo joinShowtime para:', showtimeId)
    socketService.joinShowtime(showtimeId)

    // 3. Desacoplamiento estructural al salir de la pantalla
    return () => {
      console.log(' Limpiando listeners del showtime:', showtimeId)
      socketService.leaveShowtime(showtimeId)
      socketService.off('connect', handleReconnectedEmit)
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

  // filtrar boletos para el ordersummary
  const fullSelectedSeatsObjects = useMemo(() => {
    return seats.filter((s) => selectedSeats.includes(s.id))
  }, [seats, selectedSeats])

  // ============================
  // 5) Toggle asiento
  // ============================
  const toggleSeat = (seatId) => {
    const seat = seats.find((s) => s.id === seatId)
    if (!seat) return

    if (seat.status === 'sold' || seat.status === 'locked') return

    if (seat.status === 'available') {
      socketService.emit('lock_seat', { seatId })
    } else if (seat.status === 'selected') {
      socketService.emit('unlock_seat', { seatId })
    }
  }

  // ============================
  // 6) Navegar a confitería
  // ============================
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
        <button
          onClick={() => navigate('/')}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-5 py-3 rounded-xl font-semibold transition"
        >
          Volver al inicio
        </button>
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
                onClick={() => cancelPurchase('manual')}
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
            onNext={handleNext}
            currentShowtime={showtime}
            selectedSeatsList={fullSelectedSeatsObjects}
          />
        </div>
      </div>
    </div>
  )
}
