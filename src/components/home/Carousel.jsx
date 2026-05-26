// src/components/home/Carousel.jsx
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useState, useEffect } from 'react'

export default function Carousel() {
  const carouselMovies = [
    {
      title: 'Cumbres Borrascosas',
      subtitle: 'Una Película de Emerald Fennell',
      color: 'bg-[#3a3a3a]',
    },
    {
      title: 'El Castillo Ambulante',
      subtitle: 'De Hayao Miyazaki',
      color: 'bg-[#1e293b]',
    },
    {
      title: 'Los Extraños: Capítulo 1',
      subtitle: 'De Renny Harlin',
      color: 'bg-[#450a0a]',
    },
  ]

  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
        prev === carouselMovies.length - 1 ? 0 : prev + 1,
      )
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () =>
    setCurrentSlide((prev) =>
      prev === carouselMovies.length - 1 ? 0 : prev + 1,
    )

  const prevSlide = () =>
    setCurrentSlide((prev) =>
      prev === 0 ? carouselMovies.length - 1 : prev - 1,
    )

  return (
    <section className="relative w-full h-[350px] md:h-[500px] overflow-hidden group">
      {carouselMovies.map((movie, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-20' : 'opacity-0 z-10'
          }`}
        >
          <div
            className={`absolute inset-0 ${movie.color} flex items-center justify-center`}
          >
            <div className="text-center px-6 md:px-10">
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white italic">
                "{movie.title}"
              </h2>
              <p className="text-base md:text-xl text-gray-300">
                {movie.subtitle}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white"
      >
        <FiChevronLeft className="text-4xl" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-40 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white"
      >
        <FiChevronRight className="text-4xl" />
      </button>
    </section>
  )
}
