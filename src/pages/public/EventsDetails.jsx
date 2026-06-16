import { useParams } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'

import { getEventById, getCinemaShowtimebyDate } from '../../services/events.service'
import { TrailerPlayer } from '../../components/movies/TrailerPlayer' 
import ShowtimeCard from '../../components/showtimesMovie/ShowtimeCard'
import DateCarousel from '../../components/ui/DateCarroussel'

export default function EventDetails() {
  const { eventSlug } = useParams()

  // Helpers internos para manejo preciso de fechas sin desfase horario
  const getLocalDateString = (date) => {
    const offset = date.getTimezoneOffset()
    const localDate = new Date(date.getTime() - (offset * 60 * 1000))
    return localDate.toISOString().split('T')[0]
  }

  const todayStr = getLocalDateString(new Date())

  const [event, setEvent] = useState(null)
  const [cinemas, setCinemas] = useState([])
  const [selectedDate, setSelectedDate] = useState(todayStr) 
  const [loading, setLoading] = useState(true)
  const [loadingShowtimes, setLoadingShowtimes] = useState(false) 
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  const hasCheckedAutoAdvance = useRef(false)

  useEffect(() => {
    async function loadEventAndShowtimes() {
      try {
        const eventId = eventSlug ? eventSlug.split('-')[0] : null
        if (!eventId || isNaN(eventId)) {
          setEvent(null)
          setLoading(false)
          return
        }

        // 1. Cargar datos del evento base (Película) y desempaquetar la propiedad "data"
        if (!event) {
          const res = await getEventById(eventId)
          // Validamos si la respuesta viene con la envoltura .data del JSON enviado
          const eventData = res?.data ? res.data : res
          setEvent(eventData)
        }

        setLoadingShowtimes(true)
        let fetchedCinemas = []

        // 2. Petición de horarios de la cartelera
        try {
          const showtimesPayload = await getCinemaShowtimebyDate(eventId, selectedDate)
          fetchedCinemas = showtimesPayload?.cinemas || []
        } catch (showtimeErr) {
          const is404 = showtimeErr.statusCode === 404 || 
                        showtimeErr.response?.status === 404 || 
                        showtimeErr.message?.includes('No hay funciones') ||
                        String(showtimeErr).includes('404')

          if (is404) {
            console.warn(`🗓️ 404 controlado: Sin funciones para el evento ${eventId} en fecha: ${selectedDate}`)
            fetchedCinemas = []
          } else {
            throw showtimeErr
          }
        }

        // 3. Evaluar auto-avance si estamos parados en HOY
        if (!hasCheckedAutoAdvance.current && selectedDate === todayStr) {
          hasCheckedAutoAdvance.current = true

          const allPassed = fetchedCinemas.length === 0 || fetchedCinemas.every(c => 
            c.showtimes?.every(st => new Date(st.booking?.start_time) < new Date())
          )

          if (allPassed) {
            console.log('⏳ Todas las funciones de hoy finalizaron. Saltando a mañana...')
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            const tomorrowStr = getLocalDateString(tomorrow)
            
            setSelectedDate(tomorrowStr)
            return 
          }
        }

        // 4. Mapear y ordenar funciones cronológicamente de izquierda a derecha
        const sortedCinemas = fetchedCinemas.map(item => ({
          ...item,
          showtimes: item.showtimes 
            ? [...item.showtimes].sort((a, b) => {
                return new Date(a.booking?.start_time) - new Date(b.booking?.start_time)
              })
            : []
        }))

        setCinemas(sortedCinemas)
      } catch (err) {
        console.error('❌ Error crítico en el ecosistema de carga:', err)
        setEvent(null)
        setCinemas([])
      } finally {
        setLoading(false)
        setLoadingShowtimes(false)
      }
    }

    loadEventAndShowtimes()
  }, [eventSlug, selectedDate])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#231640] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-[#F6AD38] border-t-transparent rounded-full mb-4"></div>
          <p className="text-xl opacity-70">Cargando detalles del evento...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-[#231640] text-white flex items-center justify-center">
        <p className="text-xl opacity-70">Evento no encontrado</p>
      </div>
    )
  }

  const eventId = eventSlug ? eventSlug.split('-')[0] : null

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_50%,#231640_100%)] text-white pb-20">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-10 pt-6 md:pt-10">
        {/* BANNER / POSTER + INFO */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-10 mb-10">
          <div className="w-full sm:w-5/12 md:w-1/3 max-w-[280px] sm:max-w-none mx-auto sm:mx-0">
            <div className="w-full aspect-[2/3] bg-white/10 rounded-2xl border border-white/10 shadow-xl overflow-hidden flex items-center justify-center text-gray-400 text-lg relative group">
              <img
                src={
                  event.poster_url ||
                  event.banner_url ||
                  'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000'
                }
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt={event.title}
              />
              {event.lifecycle_state_detail?.description && (
                <div className="absolute top-3 left-3 bg-[#F6AD38] text-[#231640] text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                  {event.lifecycle_state_detail.description}
                </div>
              )}
            </div>
          </div>

          <div className="w-full sm:w-7/12 md:w-2/3 flex flex-col justify-between">
            <div className="text-left">
              <span className="text-[11px] text-[#F6AD38] uppercase font-bold tracking-widest block mb-1">
                Evento Especial
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold italic mb-4 md:mb-6 leading-tight tracking-tight">
                {event.title}
              </h1>
              <p className="text-gray-300 text-base md:text-xl mb-6 md:mb-8 leading-relaxed">
                {event.description ||
                  'No hay descripción disponible para este evento.'}
              </p>
            </div>

            {/* DATOS TÉCNICOS ADAPTADOS DEL EVENTO */}
            <div className="grid grid-cols-2 gap-4 md:gap-6 bg-[#231640] p-4 md:p-6 rounded-2xl border border-white/10 shadow-inner text-left">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">
                  Fecha de Lanzamiento
                </p>
                <p className="text-white text-sm md:text-base font-semibold">
                  {event.release_date || 'Próximamente'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Duración</p>
                <p className="text-white text-sm md:text-base font-semibold">
                  {event.duration_minutes
                    ? `${event.duration_minutes} min`
                    : 'No especificada'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Complejos</p>
                <p className="text-white text-sm md:text-base font-semibold truncate">
                  Disponibles abajo
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs md:text-sm">
                  Clasificación
                </p>
                <p className="text-[#F6AD38] text-sm md:text-base font-bold">
                  {event.age_classification_detail?.description ||
                    'Todo Público'}
                </p>
              </div>

              {/* Uso inteligente de estados de ciclo de vida y clasificaciones como etiquetas fijas */}
              <div className="col-span-2 border-t border-white/5 pt-3">
                <p className="text-gray-400 text-xs md:text-sm mb-2">
                  Características del Evento
                </p>
                <div className="flex flex-wrap gap-2">
                  {event.lifecycle_state_detail?.description && (
                    <span className="px-2.5 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-pink-300 text-[11px] md:text-xs font-semibold rounded-full border border-pink-500/30 shadow-sm whitespace-nowrap">
                      {event.lifecycle_state_detail.description}
                    </span>
                  )}
                </div>
              </div>

              {event.trailer_url && (
                <div className="col-span-2 pt-2 border-t border-white/5">
                  <button
                    onClick={() => setIsVideoOpen(true)}
                    className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto px-4 md:px-5 py-2.5 md:py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-[#231640] text-sm md:text-base font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.01] active:scale-95"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-4 h-4 md:w-5 md:h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Ver Trailer Oficial
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 🍿 SECCIÓN HORARIOS, FECHAS Y SUCURSALES */}
        <div className="mt-16 border-t border-white/10 pt-10 text-left">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wide bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                🗓️ Funciones y Horarios Disponibles
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Selecciona una fecha para ver la cartelera de ese día.
              </p>
            </div>

            <DateCarousel
              selectedDate={selectedDate}
              onDateChange={(date) => setSelectedDate(date)}
            />
          </div>

          {loadingShowtimes ? (
            <div className="py-12 flex justify-center items-center">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-[#f4b400] border-t-transparent rounded-full"></div>
              <p className="text-sm text-gray-400 ml-3 tracking-wider">
                Actualizando horarios...
              </p>
            </div>
          ) : cinemas.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-gray-400 italic">
              No se encontraron funciones programadas para la fecha
              seleccionada.
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {cinemas.map((item) => (
                <div
                  key={item.cinema.id}
                  className="bg-[#231640]/40 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start"
                >
                  <div className="w-full md:w-1/4 shrink-0">
                    <h3 className="text-xl font-bold text-white tracking-wide">
                      🏢 {item.cinema.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                      📍 Complejo disponible. Selecciona la hora exacta en la
                      que deseas asistir para reservar tus butacas de inmediato.
                    </p>
                  </div>

                  <div className="w-full md:w-3/4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {item.showtimes?.map((showtime) => (
                      <ShowtimeCard
                        key={showtime.id}
                        showtime={showtime}
                        movieId={eventId}
                        cinemaId={item.cinema.id}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PROMO VIDEO MODAL */}
        {isVideoOpen && event.trailer_url && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-10">
            <div className="relative w-full max-w-4xl bg-[#231640] rounded-2xl border border-white/10 p-2 shadow-2xl">
              <button
                onClick={() => setIsVideoOpen(false)}
                className="absolute -top-12 right-0 md:right-2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full border border-white/10 transition-colors shadow"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <TrailerPlayer url={event.trailer_url} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}