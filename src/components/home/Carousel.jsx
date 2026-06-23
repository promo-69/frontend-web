import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom' 
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { getActiveMovies } from '../../services/movies.service' 

// Función para normalizar el título y convertirlo en slug (idéntica a la de MovieCard)
const convertToSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-z0-9\s-]/g, "")    
    .replace(/\s+/g, "-")           
    .trim();
};

export default function Carousel() {
  const [movies, setMovies] = useState([])
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true)
        const data = await getActiveMovies()
        
        const normalizedMovies = data.map((item) => {
          const m = item.movie
          return {
            id: m.id,
            title: m.title,
            synopsis: m.synopsis || `Disfruta de "${m.title}" en nuestras salas disponibles. Checkea los horarios de las funciones asignadas.`,
            image: m.poster_url, 
            banner: m.banner_url || m.poster_url, 
            tag: m.age_classification?.description || 'Regular',
            duration: m.duration_minutes ? `${m.duration_minutes} min` : '— min',
          }
        })

        setMovies(normalizedMovies)
      } catch (error) {
        console.error('Error cargando las películas del carrusel:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  const next = () =>
    setCurrent((prev) => (prev === movies.length - 1 ? 0 : prev + 1))

  const prev = () =>
    setCurrent((prev) => (prev === 0 ? movies.length - 1 : prev - 1))

  useEffect(() => {
    if (movies.length <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [movies.length])

  if (loading) {
    return (
      <div className="w-full bg-[#1e1233] min-h-[50vh] flex items-center justify-center text-white font-montserrat">
        <p className="text-sm font-bold tracking-widest uppercase animate-pulse text-gray-400">
          Cargando cartelera...
        </p>
      </div>
    )
  }

  if (movies.length === 0) return null

  const activeMovie = movies[current]

  // Construcción dinámica de la URL exacta del detalle
  const activeMovieUrl = `/movies/${activeMovie.id}-${convertToSlug(activeMovie.title)}`;

  return (
    <div className="w-full bg-[#1e1233] min-h-screen text-white flex flex-col overflow-hidden pb-10 font-montserrat">
      
      {/* Sección del Banner Superior */}
      <section className="relative w-full h-[40vh] min-h-[360px] max-h-[500px] flex items-center px-6 sm:px-12 md:px-16 overflow-hidden">
        {movies.map((movie, index) => (
          <div
            key={`banner-${movie.id || index}`}
            style={{ backgroundImage: `url(${movie.banner})` }}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
              index === current ? 'opacity-35' : 'opacity-0'
            }`}
          />
        ))}
        
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e1233]/90 via-[#1e1233]/40 to-transparent z-10 w-full md:w-[70%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e1233] via-transparent to-black/10 z-10" />
        
        <div
          key={current}
          className="relative z-20 max-w-2xl animate-fade-in transition-all duration-500"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-wide uppercase leading-none">
            {activeMovie.title}
          </h1>

          <div className="flex items-center gap-4 mt-4 mb-4">
            <span className="bg-[#f4b400] text-black text-xs md:text-sm font-bold px-3 py-1 rounded-full shadow-md">
              {activeMovie.tag}
            </span>
            <span className="text-gray-300 text-xs md:text-sm flex items-center gap-1 font-medium bg-white/5 px-3 py-1 rounded-full border border-white/5">
              ⏱️ {activeMovie.duration}
            </span>
          </div>

          <p className="text-gray-200 text-xs sm:text-sm md:text-base leading-relaxed bg-black/20 md:bg-transparent p-3 md:p-0 rounded-xl backdrop-blur-sm md:backdrop-blur-none mb-5">
            {activeMovie.synopsis}
          </p>

          {/* Botón con la ruta de destino estructurada correctamente */}
          <Link
            to={activeMovieUrl}
            className="inline-block bg-[#F6AD38] hover:bg-[#d9982f] text-black text-sm font-bold px-6 py-2.5 rounded-xl shadow-lg transform active:scale-95 transition-all duration-200 uppercase tracking-wider"
          >
            Ver detalles
          </Link>
        </div>
      </section>

      {/* Sección del Carrusel de Pósters */}
      <section className="relative w-full h-[42vh] min-h-[340px] max-h-[460px] flex flex-col justify-center items-center mt-4 md:mt-8">
        <div className="relative flex items-center justify-center w-full h-full max-w-7xl px-4">
          {movies.map((movie, index) => {
            const isActive = index === current
            const isLeft = index === (current - 1 + movies.length) % movies.length
            const isRight = index === (current + 1) % movies.length

            const movieUrl = `/movies/${movie.id}-${convertToSlug(movie.title)}`;

            const posterCard = (
              <div
                style={{ backgroundImage: `url(${movie.image})` }}
                className={`w-[140px] sm:w-[170px] md:w-[200px] lg:w-[240px] h-[200px] sm:h-[245px] md:h-[285px] lg:h-[340px]
                  rounded-2xl shadow-2xl border border-white/10 bg-cover bg-center relative overflow-hidden transition-all duration-500
                  ${isActive ? 'cursor-pointer hover:border-[#F6AD38]/60 hover:shadow-[#F6AD38]/10' : ''}`}
              />
            )

            return (
              <div
                key={`card-${movie.id || index}`}
                className={`
                  absolute transition-all duration-700 ease-in-out
                  ${isActive ? 'scale-105 sm:scale-110 md:scale-125 z-30 opacity-100 translate-x-0' : ''}
                  ${isLeft ? 'scale-80 -translate-x-[110px] sm:-translate-x-[200px] md:-translate-x-[260px] lg:-translate-x-[360px] opacity-35 z-20 pointer-events-none' : ''}
                  ${isRight ? 'scale-80 translate-x-[110px] sm:translate-x-[200px] md:translate-x-[260px] lg:translate-x-[360px] opacity-35 z-20 pointer-events-none' : ''}
                  ${!isActive && !isLeft && !isRight ? 'opacity-0 invisible' : ''}
                `}
              >
                {/* Si es el póster del centro (activo), también permite hacer clic e ir a sus detalles correspondientes */}
                {isActive ? (
                  <Link to={movieUrl}>
                    {posterCard}
                  </Link>
                ) : (
                  posterCard
                )}
              </div>
            )
          })}
        </div>

        {/* Controles del Carrusel */}
        {movies.length > 1 && (
          <div className="absolute bottom-0 flex gap-6 z-40">
            <button
              onClick={prev}
              className="p-2.5 md:p-3 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-all transform hover:scale-110 shadow-lg border border-white/10 backdrop-blur-sm"
            >
              <FiChevronLeft className="text-xl md:text-2xl" />
            </button>
            <button
              onClick={next}
              className="p-2.5 md:p-3 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-all transform hover:scale-110 shadow-lg border border-white/10 backdrop-blur-sm"
            >
              <FiChevronRight className="text-xl md:text-2xl" />
            </button>
          </div>
        )}
      </section>
    </div>
  )
}