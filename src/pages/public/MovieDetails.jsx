import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getMovieById } from '../../services/movies.service'

export default function MovieDetails() {
  const { movieId } = useParams()
  const navigate = useNavigate()

  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMovie() {
      try {
        const response = await getMovieById(movieId)
        setMovie(response)
      } catch (err) {
        console.error('Error cargando película:', err)
      } finally {
        setLoading(false)
      }
    }

    loadMovie()
  }, [movieId])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#231640] text-white overflow-x-hidden">
        <p className="text-xl opacity-70">Cargando película...</p>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#231640] text-white overflow-x-hidden">
        <p className="text-xl opacity-70">Película no encontrada</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_50%,#231640_100%)] text-white pb-20">
      {/* CONTENEDOR PRINCIPAL */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-10">
        {/* POSTER + INFO */}
        <div className="flex flex-col md:flex-row gap-10">
          {/* POSTER */}
          <div className="w-full md:w-1/3">
            <div className="w-full aspect-[2/3] bg-white/10 rounded-2xl border border-white/10 shadow-xl flex items-center justify-center text-gray-400 text-lg">
              {/* poster_url */}
              <img
                src={movie.poster_url}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>

          {/* INFORMACIÓN PRINCIPAL */}
          <div className="w-full md:w-2/3">
            <h1 className="text-4xl md:text-6xl font-bold italic mb-6 leading-tight">
              {movie.title}
            </h1>

            <p className="text-gray-300 text-lg md:text-xl mb-8 leading-relaxed">
              {movie.synopsis}
            </p>

            {/* DATOS ORGANIZADOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#231640] p-6 rounded-2xl border border-white/10">
              <div>
                <p className="text-gray-400 text-sm">Duración</p>
                <p className="text-white font-semibold">
                  {movie.duration_minutes} min
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Clasificación</p>
                <p className="text-white font-semibold">
                  {movie.age_classification?.description}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Estado</p>
                <p className="text-white font-semibold">
                  {movie.lifecycle_state?.description}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Fecha de Estreno</p>
                <p className="text-white font-semibold">{movie.release_date}</p>
              </div>

              <div className="md:col-span-2">
                <p className="text-gray-400 text-sm">Géneros</p>
                <p className="text-white font-semibold">
                  {movie.genres?.map((g) => g.description).join(', ')}
                </p>
              </div>
            </div>

            {/* BOTÓN TEMPORAL PARA IR A SELECT SEATS */}
            <button
              onClick={() => navigate(`/buy/${movieId}/1`)}
              className="mt-10 px-10 py-4 bg-[#f4b400] text-[#231640] rounded-xl font-bold text-lg hover:bg-[#ffcc4d] transition-all"
            >
              Seleccionar Asientos
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
