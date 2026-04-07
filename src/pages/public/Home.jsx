import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiLogOut, FiChevronLeft, FiChevronRight, FiMenu, FiX } from 'react-icons/fi'
import logotipo from '../../assets/images/logotype/logoCiineflix.png'

function Home() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const top5Movies = [1, 2, 3, 4, 5]
  const billboardMovies = [1, 2, 3, 4, 5, 6, 7, 8]

  const carouselMovies = [
    { title: "Cumbres Borrascosas", subtitle: "Una Película de Emerald Fennell", color: "bg-[#3a3a3a]" },
    { title: "El Castillo Ambulante", subtitle: "De Hayao Miyazaki", color: "bg-[#1e293b]" },
    { title: "Los Extraños: Capítulo 1", subtitle: "De Renny Harlin", color: "bg-[#450a0a]" }
  ]

  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === carouselMovies.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [carouselMovies.length])

  const nextSlide = () => setCurrentSlide((prev) => (prev === carouselMovies.length - 1 ? 0 : prev + 1))
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? carouselMovies.length - 1 : prev - 1))

  const navLinks = [
    { name: 'Cartelera', hasDot: true },
    { name: 'Estrenos', hasDot: true },
    { name: 'Confitería', hasDot: true },
    { name: 'Sucursales', hasDot: false },
  ]

  return (
    <div className="min-h-screen bg-[#3F297E] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-16 py-4 bg-[#3F297E] border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src={logotipo} className="w-40 md:w-60 h-auto" alt="logotipo" />
        </div>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => (
            <li key={link.name} className="flex items-center gap-2 transition-colors hover:text-[#f4b400] cursor-pointer">
              {link.name}
              {link.hasDot && <span className="w-1.5 h-1.5 bg-[#f4b400] rounded-sm transform rotate-45"></span>}
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/login')}
            className="hidden md:flex items-center gap-2 text-[#f4b400] text-xl font-bold hover:scale-105 transition-transform"
          >
            Ingresar
            <FiLogOut className="text-2xl" />
          </button>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden text-[#f4b400] text-3xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <div className={`fixed inset-0 bg-[#3F297E] z-40 transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} lg:hidden flex flex-col items-center justify-center gap-8`}>
            <ul className="flex flex-col items-center gap-8 text-2xl font-bold">
                {navLinks.map((link) => (
                    <li 
                      key={link.name} 
                      onClick={() => setIsMenuOpen(false)}
                      className="hover:text-[#f4b400] cursor-pointer"
                    >
                        {link.name}
                    </li>
                ))}
            </ul>
            <button
                onClick={() => {
                    setIsMenuOpen(false)
                    navigate('/login')
                }}
                className="flex items-center gap-2 text-[#f4b400] text-2xl font-bold"
            >
                Ingresar
                <FiLogOut className="text-3xl" />
            </button>
        </div>
      </nav>

      {/* Hero Section - Dynamic Carousel */}
      <section className="relative w-full h-[350px] md:h-[500px] overflow-hidden group">
        {carouselMovies.map((movie, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-20' : 'opacity-0 z-10'
            }`}
          >
            <div className={`absolute inset-0 ${movie.color} flex items-center justify-center text-4xl font-serif text-gray-400`}>
              <div className="text-center px-6 md:px-10">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-2 md:mb-4 italic">
                    "{movie.title}"
                </h2>
                <p className="text-base md:text-xl font-light text-gray-300">{movie.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#3F297E] via-transparent to-transparent z-30 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3F297E]/50 to-transparent z-30 pointer-events-none" />

        {/* Navigation Arrows */}
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

        {/* Dash Indicators */}
        <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-40 flex gap-2">
          {carouselMovies.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1 md:h-1.5 rounded-full transition-all duration-300 ${
                i === currentSlide ? 'w-6 md:w-10 bg-[#f4b400]' : 'w-2 md:w-4 bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Visual accent like in the image */}
        <div className="absolute top-10 right-10 w-32 md:w-64 h-32 md:h-64 bg-purple-500/10 blur-[60px] md:blur-[120px] rounded-full z-20" />
      </section>

      <main className="px-6 md:px-16 py-8 md:py-12">
        {/* TOP 5 Section */}
        <section className="mb-12 md:mb-20 text-center">
          <h3 className="text-[#f4b400] text-2xl md:text-3xl font-bold mb-6 md:mb-10">TOP 5 de la Semana</h3>
          <div className="flex justify-start md:justify-center gap-4 md:gap-6 overflow-x-auto pb-6 scrollbar-hide">
            {top5Movies.map((i) => (
              <div
                key={i}
                className="min-w-[150px] md:min-w-[200px] h-[225px] md:h-[300px] bg-white/5 rounded-2xl border border-white/10 shadow-xl hover:scale-105 transition-transform cursor-pointer relative group flex items-center justify-center text-gray-500 font-bold overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10 text-sm md:text-base">POPULAR {i}</span>
              </div>
            ))}
          </div>
          {/* Gray divider like in original image */}
          <div className="w-full md:w-2/3 h-12 md:h-20 bg-gray-300 mx-auto mt-6 rounded-lg opacity-80 flex items-center justify-center text-[#3F297E] font-bold text-sm md:text-xl px-4 text-center">
             ESPACIO PUBLICITARIO
          </div>
        </section>

        {/* Cartelera Section */}
        <section>
          <h3 className="text-[#f4b400] text-2xl md:text-3xl font-bold mb-6 md:mb-10">Cartelera</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {billboardMovies.map((i) => (
              <div
                key={i}
                className="aspect-[2/3] bg-white/5 rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer flex items-center justify-center text-gray-500 font-bold text-lg md:text-2xl group"
              >
                <span className="group-hover:scale-110 transition-transform">{i}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer space */}
      <footer className="py-12 md:py-20 text-center text-gray-500 border-t border-white/10">
        <p className="px-6 text-sm md:text-base">&copy; 2026 INEFLIX - Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

export default Home


