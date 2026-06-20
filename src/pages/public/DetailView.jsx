import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

// Servicios
import { getMovieById, getCinemaShowtimebyDateMovies } from '../../services/movies.service'
import { getEventById, getCinemaShowtimebyDateEvents } from '../../services/events.service'
// import { subscribeToMovie } from '../../services/subscriptions.service' 

// Componentes Compartidos
import { TrailerPlayer } from '../../components/movies/TrailerPlayer'
import ShowtimeCard from '../../components/showtimesMovie/ShowtimeCard'
import DateCarousel from '../../components/ui/DateCarroussel'

// import { useAuth } from '../../context/AuthContext' 

export default function DetailView() {
  const { movieSlug, eventSlug } = useParams()
  const navigate = useNavigate()
  
  // const { user, isAuthenticated } = useAuth()
  const isAuthenticated = false // Cambiar por tu estado real de sesión

  // Identificar el tipo de entidad según los parámetros de la URL
  const isMovie = !!movieSlug
  const activeSlug = movieSlug || eventSlug

  // Helpers internos para manejo preciso de fechas sin desfase horario
  const getLocalDateString = (date) => {
    const offset = date.getTimezoneOffset()
    const localDate = new Date(date.getTime() - (offset * 60 * 1000))
    return localDate.toISOString().split('T')[0]
  }

  const todayStr = getLocalDateString(new Date())

  // Estados unificados
  const [item, setItem] = useState(null)
  const [cinemas, setCinemas] = useState([])
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [loading, setLoading] = useState(true)
  const [loadingShowtimes, setLoadingShowtimes] = useState(false)
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  
  // Estados para el botón de suscripción
  const [subscribing, setSubscribing] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const hasCheckedAutoAdvance = useRef(false)

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [activeSlug])

  // Efecto principal para la carga de datos
  useEffect(() => {
    async function loadDataAndShowtimes() {
      try {
        const entityId = activeSlug ? activeSlug.split('-')[0] : null
        if (!entityId || isNaN(entityId)) {
          setItem(null)
          setLoading(false)
          return
        }

        if (!item) {
          const res = isMovie 
            ? await getMovieById(entityId) 
            : await getEventById(entityId)
          
          const rawData = res?.data ? res.data : res

          if (rawData) {
            setItem({
              id: rawData.id,
              title: rawData.title,
              description: rawData.synopsis || rawData.description || 'No hay descripción disponible.',
              poster_url: rawData.poster_url || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000',
              duration_minutes: rawData.duration_minutes,
              release_date: rawData.release_date || 'Próximamente',
              trailer_url: rawData.trailer_url,
              classification: rawData.age_classification?.description || rawData.age_classification_detail?.description || 'Todo Público',
              lifecycle: rawData.lifecycle?.description || rawData.lifecycle_state?.description || rawData.lifecycle_state_detail?.description,
              genres: rawData.genres || [], 
              isEvent: !isMovie
            })
          } else {
            setItem(null)
          }
        }

        setLoadingShowtimes(true)
        let fetchedCinemas = []

        try {
          const showtimesPayload = isMovie
            ? await getCinemaShowtimebyDateMovies(entityId, selectedDate)
            : await getCinemaShowtimebyDateEvents(entityId, selectedDate)
            
          fetchedCinemas = showtimesPayload?.cinemas || []
        } catch (showtimeErr) {
          fetchedCinemas = []
        }

        if (!hasCheckedAutoAdvance.current && selectedDate === todayStr) {
          hasCheckedAutoAdvance.current = true

          const allPassed = fetchedCinemas.length === 0 || fetchedCinemas.every(c => 
            c.showtimes?.every(st => new Date(st.booking?.start_time) < new Date())
          )

          if (allPassed) {
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            const tomorrowStr = getLocalDateString(tomorrow)
            
            setSelectedDate(tomorrowStr)
            return 
          }
        }

        const sortedCinemas = fetchedCinemas.map(cinemaItem => ({
          ...cinemaItem,
          showtimes: cinemaItem.showtimes 
            ? [...cinemaItem.showtimes].sort((a, b) => new Date(a.booking?.start_time) - new Date(b.booking?.start_time))
            : []
        }))

        setCinemas(sortedCinemas)
      } catch (err) {
        console.error('❌ Error crítico en el ecosistema de carga unificado:', err)
        setItem(null)
        setCinemas([])
      } finally {
        setLoading(false)
        setLoadingShowtimes(false)
      }
    }

    loadDataAndShowtimes()
  }, [activeSlug, selectedDate, isMovie])

  // Lógica del botón de suscripción
  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } })
      return
    }

    setSubscribing(true)
    try {
      // await subscribeToMovie(item.id)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubscribed(true)
    } catch (error) {
      console.error("Error al procesar la suscripción:", error)
    } finally {
      setSubscribing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#231640] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-[#F6AD38] border-t-transparent rounded-full mb-4"></div>
          <p className="text-xl opacity-70">Cargando detalles...</p>
        </div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-[#231640] text-white flex items-center justify-center">
        <p className="text-xl opacity-70">Contenido no encontrado</p>
      </div>
    )
  }

  const entityId = activeSlug ? activeSlug.split('-')[0] : null
  const isUpcoming = item.lifecycle?.toLowerCase().includes('próximamente') || item.lifecycle?.toLowerCase().includes('proximamente')

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_50%,#231640_100%)] text-white pb-20">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-10 pt-6 md:pt-10">
        {/* BANNER / POSTER + INFO */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-10 mb-10">
          <div className="w-full sm:w-5/12 md:w-1/3 max-w-[280px] sm:max-w-none mx-auto sm:mx-0">
            <div className="w-full aspect-[2/3] bg-white/10 rounded-2xl border border-white/10 shadow-xl overflow-hidden flex items-center justify-center text-gray-400 text-lg relative group">
              <img
                src={item.poster_url}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt={item.title}
              />
              {item.lifecycle && (
                <div className="absolute top-3 left-3 bg-[#F6AD38] text-[#231640] text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                  {item.lifecycle}
                </div>
              )}
            </div>
          </div>

          <div className="w-full sm:w-7/12 md:w-2/3 flex flex-col justify-between">
            <div className="text-left">
              {item.isEvent && (
                <span className="text-[11px] text-[#F6AD38] uppercase font-bold tracking-widest block mb-1">
                  Evento Especial
                </span>
              )}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold italic mb-4 md:mb-6 leading-tight tracking-tight">
                {item.title}
              </h1>
              <p className="text-gray-300 text-base md:text-xl mb-6 md:mb-8 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* DATOS TÉCNICOS NORMALIZADOS */}
            <div className="grid grid-cols-2 gap-4 md:gap-6 bg-[#231640] p-4 md:p-6 rounded-2xl border border-white/10 shadow-inner text-left">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Fecha de Estreno</p>
                <p className="text-white text-sm md:text-base font-semibold">
                  {item.release_date}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Duración</p>
                <p className="text-white text-sm md:text-base font-semibold">
                  {item.duration_minutes ? `${item.duration_minutes} min` : 'No especificada'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Complejos</p>
                <p className="text-white text-sm md:text-base font-semibold truncate">
                  {isUpcoming ? 'Sin funciones activas' : 'Disponibles abajo'}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs md:text-sm">
                  Clasificación
                </p>
                <p className="text-[#F6AD38] text-sm md:text-base font-bold">
                  {item.classification}
                </p>
              </div>

              {/* GÉNEROS */}
              {item.genres.length > 0 && (
                <div className="col-span-2 border-t border-white/5 pt-3">
                  <p className="text-gray-400 text-xs md:text-sm mb-2">Géneros</p>
                  <div className="flex flex-wrap gap-2">
                    {item.genres.map((g, index) => (
                      <span
                        key={g.id || index}
                        className="px-2.5 py-1 bg-white/10 text-white text-[11px] md:text-xs font-medium rounded-full border border-white/20 shadow-sm whitespace-nowrap"
                      >
                        {g._Genres?.description || g.description}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* BOTONES ACCIÓN (TRAILER / SUSCRIPCIÓN) */}
              <div className="col-span-2 pt-2 border-t border-white/5 flex flex-col sm:flex-row gap-3">
                {item.trailer_url && (
                  <button 
                    onClick={() => setIsVideoOpen(true)} 
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-[#231640] text-sm md:text-base font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.01] active:scale-95 whitespace-nowrap"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                    Ver Trailer Oficial
                  </button>
                )}

                {/* 🔔 BOTÓN DE SUSCRIPCIÓN CON GRADIENTE MAGENTA A MORADO */}
                {isUpcoming && (
                  <button
                    onClick={handleSubscribe}
                    disabled={subscribing || isSubscribed}
                    className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm md:text-base font-bold shadow-lg transition-all transform hover:scale-[1.01] active:scale-95 w-full sm:w-auto text-white ${
                      isSubscribed 
                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 border border-fuchsia-500/30'
                    }`}
                  >
                    {subscribing ? (
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full">**</div>
                    ) : isSubscribed ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.14-.094l3.741-5.234Z" clipRule="evenodd" />
                        </svg>
                        ¡Suscrito para el Estreno!
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M5.85 3.5a.75.75 0 0 0-1.117-1A9.719 9.719 0 0 0 2.25 9.25a.75.75 0 0 0 1.5 0c0-1.996.643-3.842 1.735-5.343ZM19.267 2.5a.75.75 0 1 0-1.118 1a8.22 8.22 0 0 1 1.735 5.343.75.75 0 0 0 1.5 0 9.719 9.719 0 0 0-2.117-6.743ZM12 1.5a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5A.75.75 0 0 0 12 1.5ZM4.331 18.232a.75.75 0 0 0-.832 1.25A11.936 11.936 0 0 0 12 22.5a11.936 11.936 0 0 0 8.501-3.018.75.75 0 0 0-.832-1.25A10.436 10.436 0 0 1 12 21a10.436 10.436 0 0 1-7.669-2.768Z" />
                          <path fillRule="evenodd" d="M12 4a6 6 0 0 0-6 6v3.586l-.707.707A1 1 0 0 0 6 16h12a1 1 0 0 0 .707-1.707L18 13.586V10a6 6 0 0 0-6-6Zm0 14a3 3 0 0 1-2.83-2h5.66A3 3 0 0 1 12 18Z" clipRule="evenodd" />
                        </svg>
                        Avisarme cuando estrene
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 🍿 SECCIÓN HORARIOS, FECHAS Y SUCURSALES */}
        <div className="mt-16 border-t border-white/10 pt-10 text-left">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wide bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                {`🗓️ Funciones y Horarios Disponibles`}
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
                      <ShowtimeCard key={showtime.id} showtime={showtime} movieId={entityId} cinemaId={item.cinema.id} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL DEL REPRODUCTOR */}
        {isVideoOpen && item.trailer_url && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-10">
            <div className="relative w-full max-w-4xl bg-[#231640] rounded-2xl border border-white/10 p-2 shadow-2xl">
              <button 
                onClick={() => setIsVideoOpen(false)} 
                className="absolute -top-12 right-0 md:right-2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full border border-white/10 transition-colors shadow"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <TrailerPlayer url={item.trailer_url} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}