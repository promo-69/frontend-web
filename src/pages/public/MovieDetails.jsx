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

  console.log('→ cinema from cart:', cart.cinema)
  console.log('[MOVIEDETAILS] cinemaId:', cart.cinema?.id)
  console.log('[MOVIEDETAILS] movieId:', movieId)

  useEffect(() => {
    async function loadMovie() {
      try {
        if (!cart.cinema?.id) {
          console.log('Esperando cinema…')
          return
        }

        console.log('✔ Cinema listo:', cart.cinema)

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

  // Si la película existe pero no tiene funciones en esta sucursal
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
        <div className="flex flex-col md:flex-row gap-10">
          <div className="w-full md:w-1/3">
            <div className="w-full aspect-[2/3] bg-white/10 rounded-2xl border border-white/10 shadow-xl flex items-center justify-center text-gray-400 text-lg">
              <img
                src={movie.poster_url}
                className="w-full h-full object-cover rounded-2xl"
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

              {/* GÉNEROS (CORREGIDO) */}
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
            </div>
          </div>
        </div>

        {/* SECCIÓN DEL TRÁILER OFICIAL */}
        <div className="mb-14">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            🎬 Tráiler Oficial
          </h2>
          <div className="max-w-4xl">
            <TrailerPlayer url={movie.trailer_url} /> 
          </div>
        </div>

        {/* ⭐ FUNCIONES FILTRADAS POR SUCURSAL */}
        <ShowtimesList showtimes={showtimes} movieId={movieId} />
      </div>
    </div>
  )
}
