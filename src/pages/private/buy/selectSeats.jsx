import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getShowtimeById,
  getSeatMap,
} from '../../../services/showtimes.service'

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
    cart,
  } = useCart()

  const [showtime, setShowtime] = useState(null)
  const [seats, setSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [ticketsNeeded, setTicketsNeeded] = useState(1)

  const [timeLeft, setTimeLeft] = useState(300)

  // ⭐ Socket.IO 

  // ============================
  // 1) Cargar showtime + mapa
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
  // 2) Conectar Socket.IO 
  // ============================
  useEffect(() => {
    if (!showtimeId) return

    const token = localStorage.getItem('token')
    const socket = socketService.connect(token)

    const onConnect = () => {
      console.log('Socket conectado:', socket?.id)
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
  // 3) Escuchar eventos del backend (vía socketService)
  // ============================
  useEffect(() => {
    if (!showtimeId) return

    const onJoinSuccess = () => console.log('Entraste a la sala correctamente')
    const onJoinError = ({ message }) => {
      console.error('❌ Error al unirse a la sala:', message)
      alert(message)
      navigate('/')
    }
    const onSeatLockError = ({ seatId, message }) => {
      alert(message)
      setSeats((prev) =>
        prev.map((s) => (s.id === seatId ? { ...s, status: 'available' } : s)),
      )
    }
    const onSeatsUnlocked = ({ seatIds }) => {
      setSeats((prev) =>
        prev.map((s) =>
          seatIds.includes(s.id) ? { ...s, status: 'available' } : s,
        ),
      )
    }

    socketService.on('join_success', onJoinSuccess)
    socketService.on('join_error', onJoinError)
    socketService.on('seat_lock_error', onSeatLockError)
    socketService.on('seats_unlocked', onSeatsUnlocked)

    return () => {
      socketService.off('join_success', onJoinSuccess)
      socketService.off('join_error', onJoinError)
      socketService.off('seat_lock_error', onSeatLockError)
      socketService.off('seats_unlocked', onSeatsUnlocked)
    }
  }, [showtimeId, navigate])

  // ============================
  // 4) Seleccionar asiento
  // ============================
  const selectedSeats = seats.filter((s) => s.status === 'selected')

  const toggleSeat = (seatId) => {
    const seat = seats.find((s) => s.id === seatId)
    if (!seat) return

    if (seat.status === 'sold' || seat.status === 'locked') return

    if (seat.status === 'available' && selectedSeats.length >= ticketsNeeded) {
      return
    }

    if (seat.status === 'available') {
      setSeats((prev) =>
        prev.map((s) =>
          s.id === seatId ? { ...s, status: 'selected' } : s,
        ),
      )
      socketService.emit('lock_seat', { seatId })
    } else if (seat.status === 'selected') {
      setSeats((prev) =>
        prev.map((s) =>
          s.id === seatId ? { ...s, status: 'available' } : s,
        ),
      )
      socketService.emit('unlock_seat', { seatId })
      removeTicket(seat.id)
    }
  }

  // ============================
  // 5) Temporizador
  // ============================
  useEffect(() => {
    if (selectedSeats.length === 0) return

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
  }, [selectedSeats])

  const handleTimeExpired = () => {
    selectedSeats.forEach((s) => {
      socketService.emit('unlock_seat', { seatId: s.id })
    })

    setSeats((prev) =>
      prev.map((s) =>
        s.status === 'selected' ? { ...s, status: 'available' } : s,
      ),
    )

    setTimeLeft(300)
  }

  // ============================
  // 6) Continuar a confitería
  // ============================
  const handleNext = () => {
    navigate(`/buy/${movieId}/${showtimeId}/confectionery`)
  }

  // ============================
  // LOADING
  // ============================
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
          <p className="text-center text-yellow-300 font-bold text-xl">
            Tiempo restante: {Math.floor(timeLeft / 60)}:
            {String(timeLeft % 60).padStart(2, '0')}
          </p>
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
