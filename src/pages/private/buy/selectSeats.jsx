import { useEffect, useState, useRef } from 'react'
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
  const { cinemaId } = useLocation().state
  const navigate = useNavigate()


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

  const user = JSON.parse(localStorage.getItem('user'))
  const token = localStorage.getItem('token')

  // ============================
  // 1) Cargar showtime + mapa (HTTP)
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

    load()
  }, [showtimeId, cinemaId])

  // ============================
  // 2) Inicializar Orden de Compra + Socket
  // ============================
  useEffect(() => {
    setPurchaseCinema(cinemaId)
    setPurchaseShowtime(showtimeId)
    setIsSeatFlow(true)

    startQuote(cinemaId, user?.id)
    connectSocket(token)

    return () => {
      socketService.leaveShowtime(showtimeId)
      socketService.disconnect()
    }
  }, [])

  // ============================
  // 3) Conectar / Desconectar Socket
  // ============================
  useEffect(() => {
    socketService.joinShowtime(showtimeId)
  }, [showtimeId])

  // ============================
  // 4) Escuchar Eventos del Servidor
  // ============================
  useEffect(() => {
    const onJoinSuccess = () => console.log('Entraste a la sala correctamente')

    const onJoinError = ({ message }) => {
      alert(message)
      navigate('/')
    }

    const onSeatLockSuccess = ({ seatId }) => {
      setSeats((prev) =>
        prev.map((s) => (s.id === seatId ? { ...s, status: 'selected' } : s)),
      )
      addSeat(seatId)
    }

    const onSeatLockError = ({ seatId, message }) => {
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
  }, [showtimeId])

  // ============================
  // 5) Lógica de Selección (Toggle Asiento)
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

          <OrderSummary onNext={handleNext} />
        </div>
      </div>
    </div>
  )
}
