import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Step2Seats from '../../../components/buyTickets/Step2Seats'
import {
  getMovieById,
  getShowtimeById,
  getSeatMap,
} from '../../../services/localStorage.service'

export default function SelectSeats() {
  const { movieId, showtimeId } = useParams()
  const navigate = useNavigate()

  const [movie, setMovie] = useState(null)
  const [showtime, setShowtime] = useState(null)
  const [seatMap, setSeatMap] = useState([])

  useEffect(() => {
    setMovie(getMovieById(movieId))
    setShowtime(getShowtimeById(showtimeId))
    setSeatMap(getSeatMap(showtimeId))
  }, [])

  const handleNext = ({ selectedSeats, ticketsNeeded, totalPrice }) => {
    navigate('confectionery', {
      state: {
        movie,
        showtime,
        seatMap,
        selectedSeats,
        ticketsNeeded,
        totalTickets: totalPrice,
      },
    })
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_18%,#231640_53%,#420946_79%,#231640_87%)] text-white font-montserrat pb-16">
      <div className="max-w-5xl mx-auto px-4 mt-8">
        <div className="bg-[rgba(29,20,48,0.85)] backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl p-6 md:p-8">
          {movie && showtime && (
            <Step2Seats
              movie={movie}
              showtime={showtime}
              seatMap={seatMap}
              onNext={handleNext}
            />
          )}
        </div>
      </div>
    </div>
  )
}
