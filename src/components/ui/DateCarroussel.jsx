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
        className="p-1.5 text-gray-400 hover:text-[#F6AD38] transition-colors shrink-0"
      >
        <FiChevronLeft size={22} />
      </button>
      
      {/* Contenedor del Carrusel */}
      <div 
        ref={carouselRef}
        className="flex-1 min-w-0 flex gap-3 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1 px-2"
      >
        {dates.map((date, idx) => {
          const dateStr = getLocalDateString(date)
          const isSelected = selectedDate === dateStr
          
          return (
            <button
              key={idx}
              onClick={() => onDateChange(dateStr)}
              className={`flex flex-col items-center justify-center h-[95px] rounded-[12px] border transition-all snap-start shrink-0
                w-[calc((100%-24px)/3)] sm:w-[calc((100%-48px)/5)] md:w-[70px] ${
                isSelected
                  ? 'bg-[#7B1A82] border-white/25 shadow-[0_2px_3.84px_rgba(0,0,0,0.25)]'
                  : 'bg-[#231640]/40 border-white/10'
              }`}
            >
              {/* Parte superior: Nombre del día */}
              <span className={`text-[10px] uppercase tracking-[0.5px] font-bold ${
                isSelected ? 'text-[#F6AD38]' : 'text-[#B0A8C5]'
              }`}>
                {getDayName(date)}
              </span>

              {/* Parte del medio: El mes dinámico */}
              <span className="text-[9px] uppercase font-bold my-[2px] text-white/40">
                {getMonthName(date)}
              </span>

              {/* Parte inferior: El número del día */}
              <span className={`text-2xl font-bold leading-none ${
                isSelected ? 'text-white' : 'text-white/80'
              }`}>
                {getDayNumber(date)}
              </span>
            </button>
          )
        })}
      </div>

      {/* Flecha Derecha */}
      <button 
        onClick={() => scroll('right')} 
        className="p-1.5 text-gray-400 hover:text-[#F6AD38] transition-colors shrink-0"
      >
        <FiChevronRight size={22} />
      </button>
    </div>
  )
}