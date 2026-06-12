import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { getMovieById } from '../../services/movies.service'
import { getShowtimesByMovieAndCinema } from '../../services/showtimes.service'

import ShowtimesList from '../../components/showtimesMovie/ShowtimeList'
import { useCart } from '../../context/CartContext'

import { TrailerPlayer } from '../../components/movies/TrailerPlayer'

export default function MovieDetails() {
  const { movieId } = useParams()
  const { cart } = useCart() 

  const [movie, setMovie] = useState(null)
  const [showtimes, setShowtimes] = useState([])
  const [loading, setLoading] = useState(true)
  
  // ⭐ Estado para controlar la visibilidad del modal del tráiler
  const [isTrailerOpen, setIsTrailerOpen] = useState(false)

  useEffect(() => {
    async function loadMovie() {
      try {
        if (!cart.cinema?.id) {
          console.log('Esperando cinema…')
          return
        }

        const movieData = await getMovieById(movieId)
        setMovie(movieData)

        try {
          const showtimesData = await getShowtimesByMovieAndCinema(
            cart.cinema.id,
            movieId,
          )
          setShowtimes(showtimesData?.rows || [])
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
  }, [movieId, cart.cinema])

  if (loading || !cart.cinema) {
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

  if (movie && showtimes.length === 0) {
    return (
      <div className="min-h-screen bg-[#231640] text-white overflow-x-hidden flex items-center justify-center flex-col gap-4">
        <p className="text-xl opacity-70 text-center">
          Esta película no está disponible en la sucursal seleccionada.
        </p>
        <p className="text-sm opacity-60 text-center">
          Selecciona otra sucursal para ver funciones disponibles.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_50%,#231640_100%)] text-white pb-20">
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-10">
        
        {/* POSTER + INFO */}
        <div className="flex flex-col md:flex-row gap-10 mb-10">
          <div className="w-full md:w-1/3">
            <div className="w-full aspect-[2/3] bg-white/10 rounded-2xl border border-white/10 shadow-xl overflow-hidden flex items-center justify-center text-gray-400 text-lg">
              <img
                src={movie.poster_url}
                className="w-full h-full object-cover"
                alt={movie.title}
              />
            </div>
          </div>

          <div className="w-full md:w-2/3">
            <h1 className="text-4xl md:text-6xl font-bold italic mb-6 leading-tight">
              {movie.title}
            </h1>

            <p className="text-gray-300 text-lg md:text-xl mb-8 leading-relaxed">
              {movie.synopsis}
            </p>

            {/* DATOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#231640] p-6 rounded-2xl border border-white/10 shadow-inner">
              <div>
                <p className="text-gray-400 text-sm">Duración</p>
                <p className="text-white font-semibold">{movie.duration_minutes} min</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Clasificación</p>
                <p className="text-white font-semibold">{movie.age_classification?.description}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Estado</p>
                <p className="text-white font-semibold">{movie.lifecycle_state?.description}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Fecha de Estreno</p>
                <p className="text-white font-semibold">{movie.release_date}</p>
              </div>

              {/* GÉNEROS */}
              <div className="md:col-span-2">
                <p className="text-gray-400 text-sm mb-2">Géneros</p>
                <div className="flex flex-wrap gap-2">
                  {movie.genres && movie.genres.length > 0 ? (
                    movie.genres.map((g, index) => (
                      <span 
                        key={g.id || index} 
                        className="px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20 shadow-sm"
                      >
                        {g._Genres?.description}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 italic text-sm">No especificados</span>
                  )}
                </div>
              </div>
              
              {/* BOTÓN CONDICIONAL DEL TRÁILER */}
              {movie.trailer_url && (
                <div className="md:col-span-2 pt-2">
                  <button
                    onClick={() => setIsTrailerOpen(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-[#231640] font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                    Ver Tráiler Oficial
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* TRAILER MODAL - Renderizado condicional */}
        {isTrailerOpen && movie.trailer_url && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-10 animate-fade-in">
            {/* Contenedor del Modal */}
            <div className="relative w-full max-w-4xl bg-[#231640] rounded-2xl border border-white/10 p-2 shadow-2xl">
              
              {/* Botón superior para cerrar */}
              <button 
                onClick={() => setIsTrailerOpen(false)}
                className="absolute -top-12 right-0 md:right-2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full border border-white/10 transition-colors shadow"
                title="Cerrar Tráiler"
              >
                <svg xmlns="http://www.w3.org/2000/xl" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Inyección de nuestro reproductor */}
              <TrailerPlayer url={movie.trailer_url} />
            </div>
          </div>
        )}

        {/* FUNCIONES FILTRADAS POR SUCURSAL */}
        <div className="border-t border-white/10 pt-8">
          <ShowtimesList showtimes={showtimes} movieId={movieId} />
        </div>
      </div>
    </div>
  )
}