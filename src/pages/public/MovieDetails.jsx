import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  getMovieById,
  getShowtimesByMovie,
} from '../../services/localStorage.service'

export default function MovieDetails() {
  const { movieId } = useParams()
  const navigate = useNavigate()

  const [movie, setMovie] = useState(null)
  const [showtimes, setShowtimes] = useState([])

  useEffect(() => {
    const id = Number(movieId)

    setMovie(getMovieById(id))
    setShowtimes(getShowtimesByMovie(id))
  }, [movieId])

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#231640] text-white flex items-center justify-center">
        <p className="text-xl opacity-70">Cargando película...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#231640] text-white pb-20">
      {/* HERO */}
      <section className="relative w-full h-[350px] md:h-[500px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-[#231640] z-10" />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-20">
          <h1 className="text-4xl md:text-6xl font-bold italic mb-4">
            {movie.title}
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl">
            {movie.description || 'Sinopsis no disponible.'}
          </p>
        </div>

        <div className="absolute inset-0 bg-[#3a3a3a]" />
      </section>

      {/* CONTENIDO */}
      <main className="px-6 md:px-16 mt-10">
        <h2 className="text-[#f4b400] text-2xl md:text-3xl font-bold mb-6">
          Horarios disponibles
        </h2>

        {showtimes.length === 0 && (
          <p className="text-gray-400">No hay horarios disponibles.</p>
        )}

        <div className="flex flex-wrap gap-4">
          {showtimes.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate(`/buy/${movieId}/${s.id}`)}
              className="px-6 py-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all text-lg"
            >
              {s.time}
            </button>
          ))}
        </div>

        <section className="mt-16">
          <h3 className="text-xl font-bold mb-3">Género</h3>
          <p className="text-gray-300 mb-6">
            {movie.genre || 'No especificado'}
          </p>

          <h3 className="text-xl font-bold mb-3">Duración</h3>
          <p className="text-gray-300 mb-6">
            {movie.duration || 'No disponible'}
          </p>

          <h3 className="text-xl font-bold mb-3">Clasificación</h3>
          <p className="text-gray-300 mb-6">
            {movie.rating || 'No disponible'}
          </p>
        </section>
      </main>
    </div>
  )
}
