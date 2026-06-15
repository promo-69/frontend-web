import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { getEventById } from '../../services/events.service'
import { TrailerPlayer } from '../../components/movies/TrailerPlayer' 

export default function EventDetails() {
  const { eventSlug } = useParams()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  useEffect(() => {
    async function loadEvent() {
      try {
        const eventId = eventSlug ? eventSlug.split('-')[0] : null
 
        if (!eventId || isNaN(eventId)) {
          setEvent(null)
          setLoading(false)
          return
        }

        const eventData = await getEventById(eventId)
        setEvent(eventData)
      } catch (err) {
        console.error('❌ Error cargando el evento:', err)
        setEvent(null)
      } finally {
        setLoading(false)
      }
    }

    loadEvent()
  }, [eventSlug])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#231640] text-white overflow-x-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-[#F6AD38] border-t-transparent rounded-full mb-4"></div>
          <p className="text-xl opacity-70">Cargando detalles del evento...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#231640] text-white overflow-x-hidden flex items-center justify-center">
        <p className="text-xl opacity-70">Evento no encontrado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_50%,#231640_100%)] text-white pb-20">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-10 pt-6 md:pt-10">
        
        {/* BANNER / POSTER + INFO */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-10 mb-10">
          
          {/* Contenedor del Póster/Banner del Evento */}
          <div className="w-full sm:w-5/12 md:w-1/3 max-w-[280px] sm:max-w-none mx-auto sm:mx-0">
            <div className="w-full aspect-[2/3] bg-white/10 rounded-2xl border border-white/10 shadow-xl overflow-hidden flex items-center justify-center text-gray-400 text-lg relative group">
              <img
                src={event.image_url || event.poster_url || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt={event.title}
              />
              <div className="absolute top-3 left-3 bg-[#F6AD38] text-[#231640] text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                Especial
              </div>
            </div>
          </div>

          {/* Contenedor de Textos e Información */}
          <div className="w-full sm:w-7/12 md:w-2/3 flex flex-col justify-between">
            <div className="text-left">
              <span className="text-[11px] text-[#F6AD38] uppercase font-bold tracking-widest block mb-1">
                Evento Exclusivo
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold italic mb-4 md:mb-6 leading-tight tracking-tight">
                {event.title}
              </h1>

              <p className="text-gray-300 text-base md:text-xl mb-6 md:mb-8 leading-relaxed">
                {event.description || event.synopsis || 'No hay descripción disponible para este evento.'}
              </p>
            </div>

            {/* DATOS TÉCNICOS DEL EVENTO */}
            <div className="grid grid-cols-2 gap-4 md:gap-6 bg-[#231640] p-4 md:p-6 rounded-2xl border border-white/10 shadow-inner text-left">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Fecha del Evento</p>
                <p className="text-white text-sm md:text-base font-semibold">{event.date || 'Próximamente'}</p>
              </div>

              <div>
                <p className="text-gray-400 text-xs md:text-sm">Hora de Inicio</p>
                <p className="text-white text-sm md:text-base font-semibold">{event.start_time || event.time || 'No especificada'}</p>
              </div>

              <div>
                <p className="text-gray-400 text-xs md:text-sm">Lugar / Sucursal</p>
                <p className="text-white text-sm md:text-base font-semibold truncate">
                  {event.cinema?.name || event.location || 'Todas las sucursales'}
                </p>
              </div>

              <div>
                <p className="text-gray-400 text-xs md:text-sm">Precio Entrada</p>
                <p className="text-[#F6AD38] text-sm md:text-base font-bold">
                  {event.price ? `$${event.price}` : 'Entrada Libre'}
                </p>
              </div>

              {/* CATEGORÍAS O ETIQUETAS DEL EVENTO */}
              <div className="col-span-2 border-t border-white/5 pt-3">
                <p className="text-gray-400 text-xs md:text-sm mb-2">Etiquetas del Evento</p>
                <div className="flex flex-wrap gap-2">
                  {event.tags && event.tags.length > 0 ? (
                    event.tags.map((tag, index) => (
                      <span 
                        key={tag.id || index} 
                        className="px-2.5 py-1 bg-white/10 text-white text-[11px] md:text-xs font-medium rounded-full border border-white/20 shadow-sm whitespace-nowrap"
                      >
                        {tag.description || tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 italic text-xs md:text-sm">Exclusivo de Cineflix</span>
                  )}
                </div>
              </div>
              
              {/* BOTÓN DEL VIDEO PROMOCIONAL */}
              {event.promo_video_url && (
                <div className="col-span-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => setIsVideoOpen(true)}
                    className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto px-4 md:px-5 py-2.5 md:py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-[#231640] text-sm md:text-base font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.01] active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                    Ver Video Promocional
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PROMO VIDEO MODAL */}
        {isVideoOpen && event.promo_video_url && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-10 animate-fade-in">
            <div className="relative w-full max-w-4xl bg-[#231640] rounded-2xl border border-white/10 p-2 shadow-2xl">
              <button 
                onClick={() => setIsVideoOpen(false)}
                className="absolute -top-12 right-0 md:right-2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full border border-white/10 transition-colors shadow"
                title="Cerrar Video"
              >
                <svg xmlns="http://www.w3.org/2000/xl" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <TrailerPlayer url={event.promo_video_url} />
            </div>
          </div>
        )}

      </div>
    </div>
  )
}