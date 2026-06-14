import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getCinemas } from '../../services/info.service' 

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

  const [cinema, setCinema] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCinema() {
      try {
        if (!cinemaSlug) {
          setCinema(null)
          setLoading(false)
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

          {/* Contenedor de Textos e Información Filtrada */}
          <div className="w-full sm:w-7/12 md:w-2/3 flex flex-col justify-between self-stretch py-2">
            
            {/* 🌟 CAMBIO AQUÍ: Se eliminó sm:mb-0 y se forzó un margen inferior estable */}
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

      </div>
    </div>
  )
}