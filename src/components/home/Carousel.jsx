import { useState, useEffect } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import poster1 from '../../assets/images/Cartelera/CumbresBorrascosas.jpg'
import poster2 from '../../assets/images/cartelera/CastilloAmbulante.jpg'
import poster3 from '../../assets/images/cartelera/Hoppers.jpg'
import poster1portada from '../../assets/images/Cartelera/poster1portada.jpg'
import poster2portada from '../../assets/images/cartelera/poster2portada.jpg'
import poster3portada from '../../assets/images/cartelera/poster3portada.jpg'

export default function MovieTheater() {
  const movies = [
    {
      title: 'Cumbres Borrascosas',
      subtitle: 'Una Película de Emerald Fennell',
      synopsis:
        'Una nueva y visceral adaptación de la apasionante y destructiva historia de amor entre Heathcliff y Catherine Earnshaw, atrapados por la obsesión y las diferencias sociales.',
      image: poster1,
      banner: poster1portada,
    },
    {
      title: 'El Castillo Ambulante',
      subtitle: 'De Hayao Miyazaki',
      synopsis:
        'Sophie es una joven cuyo destino cambia cuando una malvada bruja la transforma en una anciana. Para romper el hechizo, debe abordar el misterioso castillo flotante del mago Howl.',
      image: poster2,
      banner: poster2portada,
    },
    {
      title: 'Hoppers',
      subtitle: 'De Renny Harlin',
      synopsis:
        'una joven amante de los animales llamada Mabel transfiere su conciencia a un castor robótico hiperrealista. Su objetivo es infiltrarse en el mundo natural para salvar su hábitat, desencadenando una aventura que revela grandes secretos.',
      image: poster3,
      banner: poster3portada,
    },
  ]

  const [current, setCurrent] = useState(0)

  const next = () =>
    setCurrent((prev) => (prev === movies.length - 1 ? 0 : prev + 1))

  const prev = () =>
    setCurrent((prev) => (prev === 0 ? movies.length - 1 : prev - 1))

  useEffect(() => {
    const timer = setInterval(next, 5000) // 5 segundos
    return () => clearInterval(timer)
  }, [])

  // Película que está activa actualmente
  const activeMovie = movies[current]

  return (
    <div className="w-full bg-[#1e1233] min-h-screen text-white flex flex-col justify-between overflow-hidden">
      {/* =========================================================
          SECCIÓN SUPERIOR (HERO / BANNER DINÁMICO) 
         ========================================================= */}
      <section className="relative w-full h-[380px] md:h-[450px] flex items-center px-6 md:px-16 overflow-hidden">
        {movies.map((movie, index) => (
          <div
            key={`banner-${index}`}
            style={{ backgroundImage: `url(${movie.banner})` }}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
              index === current ? 'opacity-40' : 'opacity-0'
            }`}
          />
        ))}
        {/*fondo de los banner */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1e1233]/90 via-[#1e1233]/30 to-transparent z-10 w-full md:w-[70%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e1233] via-transparent to-black/10 z-10" />
        {/* Información textual con animación de entrada suave*/}
        <div
          key={current}
          className="relative z-20 max-w-2xl animate-fade-in transition-all duration-500"
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-wide uppercase font-sans">
            {activeMovie.title}
          </h1>

          <div className="flex items-center gap-4 mt-3 mb-4">
            <span className="bg-[#f4b400] text-black text-xs md:text-sm font-bold px-3 py-1 rounded-full">
              {activeMovie.tag}
            </span>
            <span className="text-gray-300 text-sm flex items-center gap-1">
              ⏱️ {activeMovie.duration}
            </span>
          </div>

          <p className="text-gray-200 text-sm md:text-base leading-relaxed line-clamp-3 md:line-clamp-none bg-black/20 md:bg-transparent p-2 rounded-lg">
            {activeMovie.synopsis}
          </p>
        </div>
      </section>

      {/* =========================================================
          SECCIÓN INFERIOR (CARRUSEL DE TARJETAS CONECTADO)
         ========================================================= */}
      <section className="relative w-full h-[360px] md:h-[440px] flex items-center justify-center pb-12">
        {/* Contenedor de las tarjetas */}
        <div className="relative flex items-center justify-center w-full h-full max-w-7xl px-4 md:px-12">
          {movies.map((movie, index) => {
            const isActive = index === current
            const isLeft =
              index === (current - 1 + movies.length) % movies.length
            const isRight = index === (current + 1) % movies.length

            return (
              <div
                key={`card-${index}`}
                className={`
                  absolute transition-all duration-700 ease-in-out
                  ${isActive ? 'scale-110 md:scale-125 z-30 opacity-100 translate-x-0' : ''}
                  ${isLeft ? 'scale-85 -translate-x-[140px] md:-translate-x-[380px] opacity-40 z-20 pointer-events-none' : ''}
                  ${isRight ? 'scale-85 translate-x-[140px] md:translate-x-[380px] opacity-40 z-20 pointer-events-none' : ''}
                  ${!isActive && !isLeft && !isRight ? 'opacity-0 invisible' : ''}
                `}
              >
                {/* Tarjeta con póster vertical */}
                <div
                  style={{ backgroundImage: `url(${movie.image})` }}
                  className="w-[180px] md:w-[240px] h-[260px] md:h-[340px]
                    rounded-2xl shadow-2xl border border-white/10
                    bg-cover bg-center relative overflow-hidden"
                />
              </div>
            )
          })}
        </div>

        {/* Controles del Carrusel */}
        <div className="absolute bottom-2 flex gap-6 z-40">
          <button
            onClick={prev}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-all transform hover:scale-110"
          >
            <FiChevronLeft className="text-2xl" />
          </button>
          <button
            onClick={next}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white transition-all transform hover:scale-110"
          >
            <FiChevronRight className="text-2xl" />
          </button>
        </div>
      </section>
    </div>
  )
}