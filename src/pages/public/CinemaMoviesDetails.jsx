import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'

import { getCinemaById } from '../../services/info.service' 

export default function CinemaMovieDetails() {
  const { cinemaSlug } = useParams()

  const [cinema, setCinema] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isMapOpen, setIsMapOpen] = useState(false)

  useEffect(() => {
    async function loadCinema() {
      try {
        const cinemaId = cinemaSlug ? cinemaSlug.split('-')[0] : null

        if (!cinemaId || isNaN(cinemaId)) {
          setCinema(null)
          setLoading(false)
          return
        }

        const cinemaData = await getCinemaById(cinemaId)
        setCinema(cinemaData)
      } catch (err) {
        console.error('❌ Error cargando sucursal REAL:', err)
        setCinema(null)
      } finally {
        setLoading(false)
      }
    }

    loadCinema()
  }, [cinemaSlug])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#231640] text-white overflow-x-hidden flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-[#F6AD38] border-t-transparent rounded-full mb-4"></div>
          <p className="text-xl opacity-70">Cargando detalles de la sucursal...</p>
        </div>
      </div>
    )
  }

  if (!cinema) {
    return (
      <div className="min-h-screen bg-[#231640] text-white overflow-x-hidden flex items-center justify-center">
        <p className="text-xl opacity-70">Sucursal no encontrada</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_50%,#231640_100%)] text-white pb-20">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-10 pt-6 md:pt-10">
        
        {/* VISTA DETALLADA DEL COMPLEJO */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6 md:gap-10 mb-10">
          
          {/* Contenedor de la Fachada/Imagen de la Sucursal */}
          <div className="w-full sm:w-5/12 md:w-1/3 max-w-[280px] sm:max-w-none mx-auto sm:mx-0">
            <div className="w-full aspect-[2/3] bg-white/10 rounded-2xl border border-white/10 shadow-xl overflow-hidden flex items-center justify-center text-gray-400 text-lg relative group">
              <img
                src={cinema.image_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop'} // Imagen por defecto si el backend no la envía
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt={cinema.name}
              />
              <div className="absolute top-3 left-3 bg-[#F6AD38] text-[#231640] text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                Cineflix
              </div>
            </div>
          </div>

          {/* Contenedor de Textos e Información General */}
          <div className="w-full sm:w-7/12 md:w-2/3 flex flex-col justify-between">
            <div className="text-left">
              <span className="text-[11px] text-[#F6AD38] uppercase font-bold tracking-widest block mb-1">Complejo Cinematográfico</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold italic mb-4 md:mb-6 leading-tight tracking-tight">
                {cinema.name}
              </h1>

              <p className="text-gray-300 text-base md:text-xl mb-6 md:mb-8 leading-relaxed">
                Disfruta de la mejor experiencia cinematográfica con pantallas de última tecnología, sonido envolvente premium y la mejor selección de confitería para ti y tu familia.
              </p>
            </div>

            {/* DATOS TÉCNICOS DE LA SUCURSAL */}
            <div className="grid grid-cols-2 gap-4 md:gap-6 bg-[#231640] p-4 md:p-6 rounded-2xl border border-white/10 shadow-inner text-left">
              <div>
                <p className="text-gray-400 text-xs md:text-sm">Horario de Apertura</p>
                <p className="text-white text-sm md:text-base font-semibold">{cinema.opening_time || 'No especificado'}</p>
              </div>

              <div>
                <p className="text-gray-400 text-xs md:text-sm">Horario de Cierre</p>
                <p className="text-white text-sm md:text-base font-semibold">{cinema.closing_time || 'No especificado'}</p>
              </div>

              <div>
                <p className="text-gray-400 text-xs md:text-sm">Teléfono de Contacto</p>
                <p className="text-white text-sm md:text-base font-semibold">{cinema.phone || 'No disponible'}</p>
              </div>

              <div>
                <p className="text-gray-400 text-xs md:text-sm">Contacto Eventos</p>
                <p className="text-white text-xs md:text-sm font-semibold truncate">informatica.promo69@gmail.com</p>
              </div>

              {/* DIRECCIÓN COMPLETADA */}
              <div className="col-span-2">
                <p className="text-gray-400 text-xs md:text-sm mb-1">Dirección Exacta</p>
                <p className="text-gray-200 text-xs md:text-sm leading-relaxed font-medium">
                  {cinema.address || 'Dirección no disponible'}
                </p>
              </div>

              {/* COMODIDADES / AMENITIES DE LA SUCURSAL */}
              <div className="col-span-2">
                <p className="text-gray-400 text-xs md:text-sm mb-2">Servicios en el Complejo</p>
                <div className="flex flex-wrap gap-2">
                  {['Salas 2D / 3D', 'Sonido Dolby Atmos', 'Acceso de Accesibilidad', 'Confitería Completa', 'Estacionamiento'].map((service, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 bg-white/10 text-white text-[11px] md:text-xs font-medium rounded-full border border-white/20 shadow-sm whitespace-nowrap"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* BOTÓN DE UBICACIÓN (REEMPLAZA AL TRÁILER) */}
              <div className="col-span-2 pt-2">
                <button
                  onClick={() => setIsMapOpen(true)}
                  className="flex items-center justify-center sm:justify-start gap-2 w-full sm:w-auto px-4 md:px-5 py-2.5 md:py-3 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-[#231640] text-sm md:text-base font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.01] active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-5 md:h-5">
                    <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
                  </svg>
                  Ver Ubicación en el Mapa
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL DEL MAPA DE LA SUCURSAL */}
        {isMapOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-10 animate-fade-in">
            <div className="relative w-full max-w-4xl bg-[#231640] rounded-2xl border border-white/10 p-2 shadow-2xl">
              <button 
                onClick={() => setIsMapOpen(false)}
                className="absolute -top-12 right-0 md:right-2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full border border-white/10 transition-colors shadow"
                title="Cerrar Mapa"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Contenedor de un mapa simulado limpio */}
              <div className="w-full aspect-video bg-white/5 rounded-xl overflow-hidden flex flex-col items-center justify-center p-6 text-center border border-white/5">
                <div className="p-4 bg-[#F6AD38]/10 text-[#F6AD38] rounded-full mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.446l6.002-3.466a.75.75 0 000-1.3l-6.002-3.466a.75.75 0 00-.755 0l-5.94 3.43a.75.75 0 01-.755 0L2.943 14.22a.75.75 0 00-1.164.634v5.022a.75.75 0 001.164.634l6.002-3.466a.75.75 0 01.755 0l5.94 3.43a.75.75 0 00.755 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-1">{cinema.name}</h3>
                <p className="text-sm text-gray-400 max-w-md mb-4">{cinema.address}</p>
                <span className="text-xs bg-white/5 px-3 py-1 rounded-full text-gray-400 border border-white/10">
                  📍 [Integración de Google Maps API o iframe aquí]
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}