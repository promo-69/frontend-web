import { useState, useEffect } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { getMovies } from '../../services/localStorage.service'

function Home() {
  const navigate = useNavigate()

  const [movies, setMovies] = useState([])

  // Cargar películas reales desde localStorage
  useEffect(() => {
    const data = getMovies()
    setMovies(data)
  }, [])

  // Si no hay películas aún, no renderizamos nada
  if (movies.length === 0) {
    return (
      <div className="min-h-screen bg-[#231640] text-white flex items-center justify-center">
        <p className="text-xl opacity-70">Cargando cartelera...</p>
      </div>
    )
  }

  // Adaptamos tus secciones usando películas reales
  const top5Movies = movies.slice(0, 5)
  const billboardMovies = movies.slice(5, 13)

  // Carrusel: usamos las primeras 3 películas reales
  const carouselMovies = movies.slice(0, 3).map((m, index) => ({
    id: m.id,
    title: m.title,
    subtitle: m.description || 'Sinopsis no disponible',
    color:
      ['bg-[#3a3a3a]', 'bg-[#1e293b]', 'bg-[#450a0a]'][index] || 'bg-[#3a3a3a]',
  }))

  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === carouselMovies.length - 1 ? 0 : prev + 1,
      )
    }, 5000)
    return () => clearInterval(timer)
  }, [carouselMovies.length])

  const nextSlide = () =>
    setCurrentSlide((prev) =>
      prev === carouselMovies.length - 1 ? 0 : prev + 1,
    )

  const prevSlide = () =>
    setCurrentSlide((prev) =>
      prev === 0 ? carouselMovies.length - 1 : prev - 1,
    )

  return (
    <div className="min-h-screen bg-[#231640] text-white overflow-x-hidden">
      {/* HERO CAROUSEL */}
      <section className="relative w-full h-[350px] md:h-[500px] overflow-hidden group">
        {carouselMovies.map((movie, index) => (
          <div
            key={movie.id}
            onClick={() => navigate(`/movie/${movie.id}`)}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out cursor-pointer ${
              index === currentSlide ? 'opacity-100 z-20' : 'opacity-0 z-10'
            }`}
          >
            <div
              className={`absolute inset-0 ${movie.color} flex items-center justify-center text-4xl font-serif text-gray-400`}
            >
              <div className="text-center px-6 md:px-10">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-4 italic">
                  "{movie.title}"
                </h2>
                <p className="text-base md:text-xl font-light text-gray-300">
                  {movie.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#231640] via-transparent to-transparent z-30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#231640]/50 to-transparent z-30 pointer-events-none" />

        {/* Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-40 p-1 md:p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors lg:opacity-0 group-hover:opacity-100"
        >
          <FiChevronLeft className="text-3xl md:text-4xl" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-40 p-1 md:p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors lg:opacity-0 group-hover:opacity-100"
        >
          <FiChevronRight className="text-3xl md:text-4xl" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-2">
          {carouselMovies.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1 md:h-1.5 rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? 'w-6 md:w-10 bg-[#f4b400]'
                  : 'w-2 md:w-4 bg-white/40'
              }`}
            />
          ))}
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="px-6 md:px-16 py-8 md:py-12">
        {/* RECOMENDACIONES */}
        <section className="mb-12 md:mb-20 text-center">
          <h3 className="text-[#f4b400] text-2xl md:text-3xl font-bold mb-6 md:mb-10">
            Recomendaciones
          </h3>

          <div className="flex justify-start md:justify-center gap-4 md:gap-6 overflow-x-auto pb-6 scrollbar-hide">
            {top5Movies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => navigate(`/movie/${movie.id}`)}
                className="min-w-[150px] md:min-w-[200px] h-[225px] md:h-[300px] bg-white/5 rounded-2xl border border-white/10 shadow-xl hover:scale-105 transition-transform cursor-pointer relative group flex items-center justify-center text-gray-500 font-bold overflow-hidden"
              >
                <span className="relative z-10 text-sm md:text-base">
                  {movie.title}
                </span>
              </div>
            ))}
          </div>

          <div className="w-full md:w-2/3 h-12 md:h-20 bg-gray-300 mx-auto mt-6 rounded-lg opacity-80 flex items-center justify-center text-[#231640] font-bold text-sm md:text-xl px-4 text-center">
            ESPACIO PUBLICITARIO
          </div>
        </section>

        {/* PRÓXIMOS ESTRENOS */}
        <section>
          <h3 className="text-[#f4b400] text-2xl md:text-3xl font-bold mb-6 md:mb-10">
            Próximos Estrenos
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {billboardMovies.map((movie) => (
              <div
                key={movie.id}
                onClick={() => navigate(`/movie/${movie.id}`)}
                className="aspect-[2/3] bg-white/5 rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer flex items-center justify-center text-gray-500 font-bold text-lg md:text-2xl group"
              >
                <span className="group-hover:scale-110 transition-transform">
                  {movie.title}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-12 md:py-20 text-center text-gray-500 border-t border-white/10">
        <p className="px-6 text-sm md:text-base">
          &copy; 2026 CINEFLIX - Todos los derechos reservados.
        </p>
      </footer>
    </div>
  )
}

export default Home
