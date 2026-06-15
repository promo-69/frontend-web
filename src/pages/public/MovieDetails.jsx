import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { getMovieById } from '../../services/movies.service'
import { TrailerPlayer } from '../../components/movies/TrailerPlayer'
 
export default function MovieDetails() {
  const { movieSlug } = useParams()

  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isTrailerOpen, setIsTrailerOpen] = useState(false)

  useEffect(() => {
    async function loadMovie() {
      try {
        const movieId = movieSlug ? movieSlug.split('-')[0] : null

        if (!movieId || isNaN(movieId)) {
          setMovie(null)
          setLoading(false)
          return
        }

        const movieData = await getMovieById(movieId)
        setMovie(movieData)

        // 2) Intentar cargar funciones
        try {
          const showtimesData = await getShowtimesByMovieAndCinema(
            cart.cinema.id,
            movieId,
          )
          setShowtimes(showtimesData || [])
        } catch (err) {
          console.warn('⚠ No hay funciones en esta sucursal:', err)
          setShowtimes([]) 
        }
      } catch (err) {
        console.error('❌ Error cargando película REAL:', err)
        setMovie(null)
      } finally {
        setLoading(false)
      }
    }

    loadMovie()
  }, [movieSlug]) // 3. El efecto ahora reacciona si cambia el slug completo

  if (loading) {
    return (
      <div className="min-h-screen bg-[#231640] text-white overflow-x-hidden flex items-center justify-center">
        <p className="text-xl opacity-70">Cargando película...</p>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-[#231640] text-white overflow-x-hidden flex items-center justify-center">
        <p className="text-xl opacity-70">Película no encontrada</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_50%,#231640_100%)] text-white pb-20">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-10 pt-6 md:pt-10">
        
        {/* POSTER + INFO */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-10 mb-10">
          
          {/* Contenedor del Póster */}
          <div className="w-full sm:w-5/12 md:w-1/3 max-w-[280px] sm:max-w-none mx-auto sm:mx-0">
            <div className="w-full aspect-[2/3] bg-white/10 rounded-2xl border border-white/10 shadow-xl overflow-hidden flex items-center justify-center text-gray-400 text-lg">
              <img
                src={movie.poster_url}
                className="w-full h-full object-cover"
                alt={movie.title}
              />
            </div>
          </div>

          {/* Contenedor de Textos e Información */}
          <div className="w-full sm:w-7/12 md:w-2/3 flex flex-col justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold italic mb-4 md:mb-6 leading-tight tracking-tight">
                {movie.title}
              </h1>

              <p className="text-gray-300 text-base md:text-xl mb-6 md:mb-8 leading-relaxed">
                {movie.synopsis}
              </p>
            </div>

            {/* DATOS TÉCNICOS */}
            <div className="grid grid-cols-2 gap-4 md:gap-6 bg-[#231640] p-4 md:p-6 rounded-2xl border border-white/10 shadow-inner">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Duración</p>
                <p className="text-white text-sm md:text-base font-semibold">{movie.duration_minutes} min</p>
              </div>

              <div>
                <p className="text-gray-400 text-xs md:text-sm">Clasificación</p>
                <p className="text-white text-sm md:text-base font-semibold">{movie.age_classification?.description}</p>
              </div>

              <div>
                <p className="text-gray-400 text-xs md:text-sm">Estado</p>
                <p className="text-white text-sm md:text-base font-semibold">{movie.lifecycle_state?.description}</p>
              </div>

              <div>
                <p className="text-gray-400 text-xs md:text-sm">Fecha de Estreno</p>
                <p className="text-white text-sm md:text-base font-semibold">{movie.release_date}</p>
              </div>

              {/* GÉNEROS */}
              <div className="col-span-2">
                <p className="text-gray-400 text-xs md:text-sm mb-2">Géneros</p>
                <div className="flex flex-wrap gap-2">
                  {movie.genres && movie.genres.length > 0 ? (
                    movie.genres.map((g, index) => (
                      <span 
                        key={g.id || index} 
                        className="px-2.5 py-1 bg-white/10 text-white text-[11px] md:text-xs font-medium rounded-full border border-white/20 shadow-sm whitespace-nowrap"
                      >
                        {g._Genres?.description}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 italic text-xs md:text-sm">No especificados</span>
                  )}
                </div>
              </div>
              
              {/* BOTÓN DEL TRÁILER */}
              {movie.trailer_url && (
                <div className="col-span-2 pt-2">
                  <button
                    onClick={() => setIsTrailerOpen(true)}
                    className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto px-4 md:px-5 py-2.5 md:py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-[#231640] text-sm md:text-base font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.01] active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                    Ver Tráiler Oficial
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TRAILER MODAL */}
        {isTrailerOpen && movie.trailer_url && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-10 animate-fade-in">
            <div className="relative w-full max-w-4xl bg-[#231640] rounded-2xl border border-white/10 p-2 shadow-2xl">
              <button 
                onClick={() => setIsTrailerOpen(false)}
                className="absolute -top-12 right-0 md:right-2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full border border-white/10 transition-colors shadow"
                title="Cerrar Tráiler"
              >
                <svg xmlns="http://www.w3.org/2000/xl" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <TrailerPlayer url={movie.trailer_url} />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}