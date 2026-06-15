import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useRef } from 'react'

export default function DateCarousel({ selectedDate, onDateChange }) {
  // Generar un arreglo con los próximos 7 días a partir de hoy
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })

  const carouselRef = useRef(null)

  // Helper para formatear la fecha evitando desfases de zona horaria
  const getLocalDateString = (date) => {
    const offset = date.getTimezoneOffset()
    const localDate = new Date(date.getTime() - (offset * 60 * 1000))
    return localDate.toISOString().split('T')[0]
  }

  const getDayName = (date) => {
    return date.toLocaleDateString('es-VE', { weekday: 'short' }).replace('.', '')
  }

  const getDayNumber = (date) => {
    return date.getDate()
  }

  const getMonthName = (date) => {
    return date.toLocaleDateString('es-VE', { month: 'short' }).replace('.', '')
  }

  const scroll = (direction) => {
    if (carouselRef.current) {
      const containerWidth = carouselRef.current.offsetWidth
      const scrollAmount = direction === 'left' ? -containerWidth : containerWidth
      carouselRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="flex items-center gap-1 bg-[#231640]/60 border border-white/10 p-2 rounded-2xl w-full max-w-xl md:max-w-md lg:max-w-xl">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Flecha Izquierda */}
      <button 
        onClick={() => scroll('left')} 
        className="p-1.5 text-gray-400 hover:text-[#f4b400] transition-colors shrink-0"
      >
        <FiChevronLeft size={22} />
      </button>
      
      {/* Contenedor del Carrusel - SOLUCIÓN: flex-1, min-w-0 y px-2 */}
      <div 
        ref={carouselRef}
        className="flex-1 min-w-0 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1 px-2"
      >
        {dates.map((date, idx) => {
          const dateStr = getLocalDateString(date)
          const isSelected = selectedDate === dateStr
          
          return (
            <button
              key={idx}
              onClick={() => onDateChange(dateStr)}
              /* Ajuste del cálculo responsivo:
                - Móvil: 2 gaps de 8px (16px) + padding de extremos (12px) = 28px de espacio no disponible. El resto se divide entre 3.
                - Tablet/Sm: 4 gaps de 8px (32px) + padding (12px) = 44px de espacio no disponible. El resto entre 5.
              */
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all snap-start shrink-0
                w-[calc((100%-28px)/3)] sm:w-[calc((100%-44px)/5)] md:w-[76px] ${
                isSelected
                  ? 'bg-[#7B1A82] text-[#f4b400] border border-[#f4b400] font-black shadow-lg shadow-[#7B1A82]/40 scale-105'
                  : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <span className="text-[10px] uppercase tracking-wider font-semibold opacity-90">
                {getDayName(date)}
              </span>
              <span className="text-lg font-bold my-0.5 leading-none">
                {getDayNumber(date)}
              </span>
              <span className="text-[9px] uppercase font-medium opacity-75">
                {getMonthName(date)}
              </span>
            </button>
          )
        })}
      </div>

      {/* Flecha Derecha */}
      <button 
        onClick={() => scroll('right')} 
        className="p-1.5 text-gray-400 hover:text-[#f4b400] transition-colors shrink-0"
      >
        <FiChevronRight size={22} />
      </button>
    </div>
  )
}