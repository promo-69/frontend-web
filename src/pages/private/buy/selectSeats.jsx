import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Step2Seats from '../../../components/buyTickets/Step2Seats'

// Usando localStorage provisorio
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Intentar leer de los servicios existentes
        let movieData = getMovieById ? getMovieById(movieId) : null
        let showtimeData = getShowtimeById ? getShowtimeById(showtimeId) : null
        let seatsData = getSeatMap ? getSeatMap(showtimeId) : []

        // 2. MOCKS DE RESPALDO: Si no hay datos reales en LocalStorage, forzamos estos para ver la interfaz
        if (!movieData) {
          movieData = {
            id: movieId || '2',
            title: 'Urban Legends',
            synopsis: 'Fantasía Urbana',
          }
        }

        if (!showtimeData) {
          showtimeData = {
            id: showtimeId || '1',
            time: '7:00 PM',
            room: 'Sala 3 (Premium)',
            price: 5.0,
          }
        }

        // Si el mapa viene vacío, generamos la matriz completa que espera Step2Seats (Filas A-I, Columnas 1-14)
        if (!seatsData || seatsData.length === 0) {
          const generatedSeats = []
          const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']

          rows.forEach((rowName) => {
            for (let c = 1; c <= 14; c++) {
              // Simular algunos asientos vendidos al azar para que se vea real
              const randomStatus = Math.random() < 0.15 ? 'sold' : 'available'

              generatedSeats.push({
                id: `${rowName}${c}`, // Ej: "A1", "B5"
                row: rowName,
                col: c,
                status: randomStatus,
              })
            }
          })
          seatsData = generatedSeats
        }

        setMovie(movieData)
        setShowtime(showtimeData)
        setSeatMap(seatsData)
      } catch (error) {
        console.error('Error cargando la maquetación de asientos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [movieId, showtimeId])

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#231640]">
        <p className="text-xl animate-pulse">Cargando mapa de asientos...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_18%,#231640_53%,#420946_79%,#231640_87%)] text-white font-montserrat pb-16">
      <div className="max-w-5xl mx-auto px-4 pt-8">
        <div className="bg-[rgba(29,20,48,0.85)] backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl p-6 md:p-8">
          {movie && showtime && seatMap.length > 0 ? (
            <Step2Seats
              movie={movie}
              showtime={showtime}
              seatMap={seatMap}
              onNext={handleNext}
              onBack={() => navigate(-1)}
            />
          ) : (
            <div className="text-center py-12 text-gray-400">
              No se pudieron estructurar los parámetros de la función.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
