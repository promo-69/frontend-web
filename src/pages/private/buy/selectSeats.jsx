import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getShowtimeById,
  getSeatMap,
} from '../../../services/showtimes.service'

import ShowtimeHeader from '../../../components/selectSeats/ShowtimeHeader'
import SeatMap from '../../../components/selectSeats/SeatMap'
import SeatLegend from '../../../components/selectSeats/SeatLegend'
import Summary from '../../../components/selectSeats/Sumary'

let user = null
try {
  const raw = localStorage.getItem('user')
  user = raw && raw !== 'undefined' ? JSON.parse(raw) : null
} catch {
  user = null
}


export default function SelectSeats() {
  const { movieId, showtimeId } = useParams()
  const navigate = useNavigate()

  const [showtime, setShowtime] = useState(null)
  const [seats, setSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [ticketsNeeded, setTicketsNeeded] = useState(1)

  // 🔥 WebSocket + temporizador
  const [socket, setSocket] = useState(null)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutos

  // 🔥 Usuario real
  const user = JSON.parse(localStorage.getItem('user'))

  // ============================
  // 1) Cargar showtime + mapa
  // ============================
  useEffect(() => {
    async function load() {
      try {
        const st = await getShowtimeById(showtimeId)
        const map = await getSeatMap(showtimeId)

        setShowtime(st)
        setSeats(map.seats || [])
      } catch (err) {
        console.error('Error cargando SelectSeats:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [showtimeId])

  // ============================
  // 2) Conectar WebSocket
  // ============================
  useEffect(() => {
    if (!showtimeId) return

    // URL DEL BACKEND VA AQUI:
    const WS_URL = `ws://AQUI_VA_LA_URL/ws/showtime/${showtimeId}`

    const ws = new WebSocket(WS_URL)
    setSocket(ws)

    ws.onopen = () => console.log('WS conectado')
    ws.onclose = () => console.log('WS desconectado')

    return () => ws.close()
  }, [showtimeId])

  // ============================
  // 3) Escuchar eventos del servidor
  // ============================
  useEffect(() => {
    if (!socket) return

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)

      if (data.type === 'lock') {
        setSeats((prev) =>
          prev.map((s) =>
            s.id === data.seatId ? { ...s, status: 'locked' } : s,
          ),
        )
      }

      if (data.type === 'unlock') {
        setSeats((prev) =>
          prev.map((s) =>
            s.id === data.seatId ? { ...s, status: 'available' } : s,
          ),
        )
      }

      if (data.type === 'sold') {
        setSeats((prev) =>
          prev.map((s) =>
            data.seatIds.includes(s.id) ? { ...s, status: 'sold' } : s,
          ),
        )
      }
    }
  }, [socket])

  // ============================
  // 4) Seleccionar / deseleccionar asiento
  // ============================
  const selectedSeats = seats.filter((s) => s.status === 'selected')

  const toggleSeat = (seatId) => {
    const seat = seats.find((s) => s.id === seatId)

    if (!seat) return
    if (seat.status === 'sold' || seat.status === 'locked') return

    // 🔥 Enviar al backend
    if (socket) {
      socket.send(
        JSON.stringify({
          type: seat.status === 'available' ? 'lock' : 'unlock',
          seatId,
          userId: user?.userId,
        }),
      )
    }

    // 🔥 Actualizar localmente
    setSeats((prev) =>
      prev.map((s) =>
        s.id === seatId
          ? {
              ...s,
              status: s.status === 'available' ? 'selected' : 'available',
            }
          : s,
      ),
    )
  }

  // ============================
  // 5) Temporizador de bloqueo
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
    console.log('Tiempo expirado, liberando asientos…')

    if (socket) {
      selectedSeats.forEach((s) => {
        socket.send(
          JSON.stringify({
            type: 'unlock',
            seatId: s.id,
          }),
        )
      })
    }

    setSeats((prev) =>
      prev.map((s) =>
        s.status === 'selected' ? { ...s, status: 'available' } : s,
      ),
    )

    setTimeLeft(300)
  }

  // ============================
  // 6) Liberar asientos al salir
  // ============================
  useEffect(() => {
    return () => {
      if (socket) {
        const selected = seats.filter((s) => s.status === 'selected')
        selected.forEach((s) => {
          socket.send(
            JSON.stringify({
              type: 'unlock',
              seatId: s.id,
            }),
          )
        })
      }
    }
  }, [socket, seats])

  // ============================
  // 7) Pasar a confitería
  // ============================
  const handleNext = () => {
    if (socket) {
      socket.send(
        JSON.stringify({
          type: 'confirm',
          seatIds: selectedSeats.map((s) => s.id),
        }),
      )
    }

    navigate('confectionery', {
      state: {
        movieId,
        showtime,
        selectedSeats,
        ticketsNeeded,
        totalPrice: ticketsNeeded * Number(showtime.price),
      },
    })
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

  // ============================
  // UI
  // ============================
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

        {/* 🔥 Temporizador */}
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

          <Summary
            showtime={showtime}
            ticketsNeeded={ticketsNeeded}
            setTicketsNeeded={setTicketsNeeded}
            selectedSeats={selectedSeats}
            onNext={handleNext}
          />
        </div>
      </div>
    </div>
  )
}
