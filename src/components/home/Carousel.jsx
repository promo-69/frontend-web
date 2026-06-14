import { useState, useEffect } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import poster1 from '../../assets/images/Cartelera/CumbresBorrascosas.jpg'
import poster2 from '../../assets/images/Cartelera/CastilloAmbulante.jpg'
import poster3 from '../../assets/images/Cartelera/Hoppers.jpg'
import poster1portada from '../../assets/images/Cartelera/poster1portada.jpg'
import poster2portada from '../../assets/images/Cartelera/poster2portada.jpg'
import poster3portada from '../../assets/images/Cartelera/poster3portada.jpg'

export default function Carousel() {
  const movies = [
    {
      title: 'Cumbres Borrascosas',
      subtitle: 'Una Película de Emerald Fennell',
      synopsis:
        'Una nueva y visceral adaptación de la apasionante y destructiva historia de amor entre Heathcliff y Catherine Earnshaw, atrapados por la obsesión y las diferencias sociales.',
      image: poster1,
      banner: poster1portada,
      tag: 'Próximamente',
      duration: '125 min',
    },
    {
      title: 'El Castillo Ambulante',
      subtitle: 'De Hayao Miyazaki',
      synopsis:
        'Sophie es una joven cuyo destiny cambia cuando una malvada bruja la transforma en una anciana. Para romper el hechizo, debe abordar el misterioso castillo flotante del mago Howl.',
      image: poster2,
      banner: poster2portada,
      tag: 'Clásico',
      duration: '119 min',
    },
    {
      title: 'Hoppers',
      subtitle: 'De Renny Harlin',
      synopsis:
        'Una joven amante de los animales llamada Mabel transfiere su conciencia a un castor robótico hiperrealista. Su objetivo es infiltrarse en el mundo natural para salvar su hábitat.',
      image: poster3,
      banner: poster3portada,
      tag: 'Estreno',
      duration: '98 min',
    },
  ]

  const [current, setCurrent] = useState(0)

  const next = () =>
    setCurrent((prev) => (prev === movies.length - 1 ? 0 : prev + 1))

  const prev = () =>
    setCurrent((prev) => (prev === 0 ? movies.length - 1 : prev - 1))

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [])

  const activeMovie = movies[current]

  return (
    <div className="w-full bg-[#1e1233] min-h-screen text-white flex flex-col overflow-hidden pb-10">
      
      <section className="relative w-full h-[40vh] min-h-[360px] max-h-[500px] flex items-center px-6 sm:px-12 md:px-16 overflow-hidden">
        {movies.map((movie, index) => (
          <div
            key={`banner-${index}`}
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-wide uppercase font-sans leading-none">
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

          <p className="text-gray-200 text-xs sm:text-sm md:text-base leading-relaxed bg-black/20 md:bg-transparent p-3 md:p-0 rounded-xl backdrop-blur-sm md:backdrop-blur-none">
            {activeMovie.synopsis}
          </p>
        </div>
      </section>

      <section className="relative w-full h-[42vh] min-h-[340px] max-h-[460px] flex flex-col justify-center items-center mt-4 md:mt-8">
        <div className="relative flex items-center justify-center w-full h-full max-w-7xl px-4">
          {movies.map((movie, index) => {
            const isActive = index === current
            const isLeft = index === (current - 1 + movies.length) % movies.length
            const isRight = index === (current + 1) % movies.length

            return (
              <div
                key={`card-${index}`}
                className={`
                  absolute transition-all duration-700 ease-in-out
                  ${isActive ? 'scale-105 sm:scale-110 md:scale-125 z-30 opacity-100 translate-x-0' : ''}
                  ${isLeft ? 'scale-80 -translate-x-[110px] sm:-translate-x-[200px] md:-translate-x-[260px] lg:-translate-x-[360px] opacity-35 z-20 pointer-events-none' : ''}
                  ${isRight ? 'scale-80 translate-x-[110px] sm:translate-x-[200px] md:translate-x-[260px] lg:translate-x-[360px] opacity-35 z-20 pointer-events-none' : ''}
                  ${!isActive && !isLeft && !isRight ? 'opacity-0 invisible' : ''}
                `}
              >
                <div
                  style={{ backgroundImage: `url(${movie.image})` }}
                  className="w-[140px] sm:w-[170px] md:w-[200px] lg:w-[240px] h-[200px] sm:h-[245px] md:h-[285px] lg:h-[340px]
                    rounded-2xl shadow-2xl border border-white/10
                    bg-cover bg-center relative overflow-hidden transition-all duration-500"
                />
              </div>
            )
          })}
        </div>

        {/* Controles del Carrusel */}
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
      </section>
    </div>
  )
}