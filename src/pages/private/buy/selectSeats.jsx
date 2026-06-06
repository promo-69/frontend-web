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

export default function SelectSeats() {
  const { movieId, showtimeId } = useParams()
  const navigate = useNavigate()

  const [showtime, setShowtime] = useState(null)
  const [seats, setSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [ticketsNeeded, setTicketsNeeded] = useState(1)

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

  const selectedSeats = seats.filter((s) => s.status === 'selected')

  const toggleSeat = (seatId) => {
    setSeats((prev) =>
      prev.map((s) =>
        s.id === seatId
          ? {
              ...s,
              status:
                s.status === 'available'
                  ? selectedSeats.length < ticketsNeeded
                    ? 'selected'
                    : 'available'
                  : s.status === 'selected'
                    ? 'available'
                    : s.status,
            }
          : s,
      ),
    )
  }

  const handleNext = () => {
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
        {/* HEADER */}
        <ShowtimeHeader showtime={showtime} />

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* COLUMNA IZQUIERDA: MAPA + LEYENDA */}
          <div className="lg:col-span-2 space-y-6">
            <SeatMap seats={seats} onToggle={toggleSeat} />
            <SeatLegend />
          </div>

          {/* COLUMNA DERECHA: RESUMEN */}
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
