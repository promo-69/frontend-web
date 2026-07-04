import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

// Servicios
import { getCinemas, getMoviesShowtimebyDateCinema } from '../../services/info.service' 
// Componentes Compartidos
import ShowtimeCard from '../../components/showtimesMovie/ShowtimeCard'
import DateCarousel from '../../components/ui/DateCarroussel'

// Utilidad para formatear Slugs de forma consistente
const convertToSlug = (title) => {
  if (!title) return ''
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-z0-9\s-]/g, "")   
    .replace(/\s+/g, "-")           
    .trim()
}

export default function CinemaMovieDetails() {
  const { cinemaSlug } = useParams()

  // Helpers internos para manejo preciso de fechas sin desfase horario
  const getLocalDateString = (date) => {
    const offset = date.getTimezoneOffset()
    const localDate = new Date(date.getTime() - (offset * 60 * 1000))
    return localDate.toISOString().split('T')[0]
  }

  const todayStr = getLocalDateString(new Date())

  // Estados
  const [cinema, setCinema] = useState(null)
  const [billboard, setBillboard] = useState([]) 
  const [selectedDate, setSelectedDate] = useState(todayStr)
  
  const [loadingCinema, setLoadingCinema] = useState(true)
  const [loadingBillboard, setLoadingBillboard] = useState(false)

  // 🚀 SCROLL AUTOMÁTICO AL TOP AL CAMBIAR DE SUCURSAL
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }, [cinemaSlug])

  // 🏢 Efecto 1: Carga los detalles de la Sucursal
  useEffect(() => {
    async function loadCinema() {
      try {
        if (!cinemaSlug) {
          setCinema(null)
          setLoadingCinema(false)
          return
        }

        const allCinemas = await getCinemas()
        
        const matchedCinema = allCinemas.find(
          (sucursal) => convertToSlug(sucursal.name) === cinemaSlug
        )

        setCinema(matchedCinema || null)

      } catch (err) {
        console.error('❌ Error buscando la sucursal en la lista:', err)
        setCinema(null)
      } finally {
        setLoadingCinema(false)
      }
    }

    loadCinema()
  }, [cinemaSlug])

  // 🍿 Efecto 2: Carga la cartelera de forma reactiva
  useEffect(() => {
    async function loadBillboardData() {
      if (!cinema?.id) return

      try {
        setLoadingBillboard(true)
        const data = await getMoviesShowtimebyDateCinema(cinema.id, selectedDate)
        setBillboard(data || [])
      } catch (err) {
        setBillboard([])
      } finally {
        setLoadingBillboard(false)
      }
    }

    loadBillboardData()
  }, [cinema, selectedDate])

  // Vistas de Estado (Loading / Error General)
  if (loadingCinema) {
    return (
      <div className="min-h-screen bg-[#231640] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-[#F6AD38] border-t-transparent rounded-full mb-4"></div>
          <p className="text-xl opacity-70">Cargando detalles de la sucursal...</p>
        </div>
      </div>
    )
  }

  if (!cinema) {
    return (
      <div className="min-h-screen bg-[#231640] text-white flex items-center justify-center">
        <p className="text-xl opacity-70">Sucursal no encontrada</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_50%,#231640_100%)] text-white pb-20">
      
      <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-10 pt-6 md:pt-10">
        
        {/* VISTA DETALLADA DEL COMPLEJO */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-10 mb-10">
          {/* Contenedor de la Imagen Cuadrada */}
          <div className="w-full sm:w-5/12 md:w-1/3 max-w-[260px] sm:max-w-[300px] mx-auto sm:mx-0">
            <div className="w-full aspect-square bg-white/10 rounded-2xl border border-white/10 shadow-xl overflow-hidden flex items-center justify-center text-gray-400 text-lg relative group">
              <img
                src={cinema.image_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop'} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt={cinema.name}
              />
              <div className="absolute top-3 left-3 bg-[#F6AD38] text-[#231640] text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                Cineflix
              </div>
            </div>
          </div>

          {/* Contenedor de Textos e Información */}
          <div className="w-full sm:w-7/12 md:w-2/3 flex flex-col justify-between self-stretch py-2">
            <div className="text-left mb-6 md:mb-8">
              <span className="text-[11px] text-[#F6AD38] uppercase font-bold tracking-widest block mb-1">
                Complejo Cinematográfico
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold italic leading-tight tracking-tight">
                {cinema.name}
              </h1>
            </div>

            {/* DATOS TÉCNICOS ESPECÍFICOS */}
            <div className="grid grid-cols-2 gap-4 md:gap-6 bg-[#231640] p-4 md:p-6 rounded-2xl border border-white/10 shadow-inner text-left">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Horario de Apertura</p>
                <p className="text-white text-sm md:text-base font-semibold">{cinema.opening_time || 'No especificado'}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Horario de Cierre</p>
                <p className="text-white text-sm md:text-base font-semibold">{cinema.closing_time || 'No especificado'}</p>
              </div>
              <div className="col-span-2 border-t border-white/5 pt-3">
                <p className="text-gray-400 text-xs md:text-sm">Teléfono de Contacto</p>
                <p className="text-white text-sm md:text-base font-semibold">{cinema.phone || 'No disponible'}</p>
              </div>
              <div className="col-span-2 border-t border-white/5 pt-3">
                <p className="text-gray-400 text-xs md:text-sm mb-1">Dirección Exacta</p>
                <p className="text-gray-200 text-xs md:text-sm leading-relaxed font-medium">
                  {cinema.address || 'Dirección no disponible'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 🍿 SECCIÓN HORARIOS, FECHAS Y CARTELERA */}
        <div className="mt-16 border-t border-white/10 pt-10 text-left">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-wide bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
                🎬 Cartelera Disponible
              </h2>
              <p className="text-xs text-gray-400 mt-1">Selecciona una fecha para ver las películas y eventos en este complejo.</p>
            </div>

            <DateCarousel 
              selectedDate={selectedDate} 
              onDateChange={(date) => setSelectedDate(date)} 
            />
          </div>

          {loadingBillboard ? (
            <div className="py-12 flex justify-center items-center">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-[#f4b400] border-t-transparent rounded-full"></div>
              <p className="text-sm text-gray-400 ml-3 tracking-wider">Actualizando cartelera...</p>
            </div>
          ) : billboard.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-gray-400 italic">
              No se encontraron funciones ni eventos programados para la fecha seleccionada.
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {billboard.map((item, index) => {
                const isMovie = item.type === 'movie'
                const entityData = isMovie ? item.movie : item.event

                if (!entityData) return null

                const detailUrl = isMovie
                  ? `/movies/${entityData.id}-${convertToSlug(entityData.title)}`
                  : `/events/${entityData.id}-${convertToSlug(entityData.title)}`

                return (
                  <div 
                    key={`${entityData.id}-${index}`}
                    className="bg-[#231640]/40 border border-white/10 rounded-2xl p-6 md:p-7 flex flex-col md:flex-row gap-6 items-start hover:border-white/20 transition-all duration-300 shadow-md"
                  >
                    {/* COLUMNA IZQUIERDA: PÓSTER + DETALLES */}
                    {/* CAMBIO: Se amplió el ancho de esta columna de md:w-2/5 a md:w-[45%] e lg:w-[40%] para sostener el póster más grande */}
                    <div className="flex gap-5 w-full md:w-[45%] lg:w-[40%] shrink-0">
                      
                      {/* CAMBIO: El contenedor del póster pasó de w-[95px]/[110px] a w-[120px] en móviles y w-[145px] en pantallas medianas/grandes */}
                      <Link 
                        to={detailUrl}
                        className="w-[120px] sm:w-[135px] md:w-[145px] aspect-[2/3] bg-white/5 rounded-xl border border-white/10 overflow-hidden shrink-0 block group relative shadow-md"
                      >
                        <img 
                          src={entityData.poster_url || 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1000'} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          alt={entityData.title}
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2">
                          <span className="text-[10px] font-bold text-center w-full text-[#231640] bg-white py-1 rounded-lg">
                            Ver más
                          </span>
                        </div>
                      </Link>

                      {/* Contenedor de textos al lado del póster */}
                      <div className="flex flex-col justify-center text-left flex-1 min-w-0">
                        {!isMovie && (
                          <span className="text-[10px] text-[#F6AD38] uppercase font-bold tracking-widest block mb-1">
                            Evento Especial
                          </span>
                        )}
                        <Link to={detailUrl} className="hover:text-[#f4b400] transition-colors">
                          {/* CAMBIO: El título se aumentó de text-base a text-lg sm:text-xl */}
                          <h3 className="text-lg sm:text-xl font-bold italic line-clamp-2 leading-snug">
                            {entityData.title}
                          </h3>
                        </Link>
                        
                        {/* CAMBIO: Se aumentó levemente el tamaño de la duración */}
                        <p className="text-xs sm:text-sm text-gray-400 mt-1.5">
                          ⏱️ {entityData.duration_minutes ? `${entityData.duration_minutes} min` : 'Duración N/A'}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          <span className="text-[10px] text-[#F6AD38] font-bold px-2 py-0.5 bg-white/5 rounded-md border border-white/10">
                            {entityData.age_classification?.description?.split(' ')[0] || 'A'}
                          </span>
                          {entityData.lifecycle?.description && (
                            <span className="text-[10px] text-gray-300 font-medium px-2 py-0.5 bg-white/5 rounded-md border border-white/10">
                              {entityData.lifecycle.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* COLUMNA DERECHA: GRILLA DE FUNCIONES */}
                    {/* CAMBIO: Se ajustó el ancho restante proporcionalmente a md:w-[55%] e lg:w-[60%] */}
                    <div className="w-full md:w-[55%] lg:w-[60%] border-t md:border-t-0 md:border-l border-white/10 pt-5 md:pt-0 md:pl-6 text-left">
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">
                        Horarios de Función:
                      </p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {item.showtimes?.map((showtime) => (
                          <ShowtimeCard 
                            key={showtime.id} 
                            showtime={showtime} 
                            movieId={entityData.id} 
                            cinemaId={cinema.id}
                          />
                        ))}
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}