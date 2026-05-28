import { useEffect, useState } from 'react'
import { getShowtimesByCinema } from '../../services/showtimes.service'
import { useNavigate } from 'react-router-dom'

export default function Showtimes({ movieId, cinemaId }) {
  const [showtimes, setShowtimes] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getShowtimesByCinema(cinemaId)
        const filtered = res.data.filter(
          (st) => st.movie.id === Number(movieId),
        )
        setShowtimes(filtered)
      } catch (err) {
        console.error('Error loading showtimes:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [movieId, cinemaId])

  if (loading) {
    return <p className="text-gray-300">Cargando funciones...</p>
  }

  if (showtimes.length === 0) {
    return <p className="text-gray-400">No hay funciones disponibles.</p>
  }

  return (
    <div className="space-y-4">
      {showtimes.map((s) => (
        <div
          key={s.id}
          className="bg-white/10 border border-white/20 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p className="text-xl font-bold text-[#f4b400]">
              {s.projection_type.description}
            </p>
            <p className="text-gray-300">
              Precio: {s.price} {s.currency.code}
            </p>
            <p className="text-gray-400 text-sm">
              Puntos: {s.earned_loyalty_points}
            </p>
          </div>

          <button
            onClick={() => navigate('/selectSeats')}
            className="mt-4 md:mt-0 px-6 py-3 bg-[#f4b400] text-black rounded-xl font-bold hover:bg-[#ffcc33] transition"
          >
            Elegir Asientos
          </button>
        </div>
      ))}
    </div>
  )
}
