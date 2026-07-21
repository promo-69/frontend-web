import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../../components/ui/Footer'
import { getCinemas } from '../../services/info.service' 
import useDocumentTitle from '../../hooks/useDocumentTitle';


// 📝 Helper para formatear la URL de la sucursal de forma limpia
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

function InfoSucursales() {
  useDocumentTitle('Sucursales');

  const [sucursales, setSucursales] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cargarSucursales = async () => {
      try {
        setCargando(true)
        const data = await getCinemas()
        setSucursales(data)
      } catch (err) {
        console.error("Error al traer las sucursales:", err)
        setError("No se pudieron cargar las sucursales. Inténtalo más tarde.")
      } finally {
        setCargando(false)
      }
    }

    cargarSucursales()
  }, [])

  return (
    <div className="min-h-screen bg-[#231640] text-white overflow-x-hidden flex flex-col justify-between font-['Montserrat']">
            
      <main className="flex-grow px-4 sm:px-8 md:px-16 pt-8 md:pt-12 pb-12">
        <div className="max-w-6xl mx-auto space-y-10 animate-fadeIn">

          <div className="border-l-4 border-[#F6AD38] pl-4 text-left">
            <h3 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white leading-none">
              Nuestras <span className="text-[#F6AD38]">Sucursales</span>
            </h3>
            <p className="text-xs md:text-sm text-gray-400 mt-1.5 uppercase tracking-wider font-semibold">
              Encuentra el complejo Cineflix más cercano a ti y vive la magia.
            </p>
          </div>

          {cargando && (
            <div className="text-center py-20">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-[#F6AD38] border-t-transparent rounded-full mb-4"></div>
              <p className="text-gray-400 text-sm">Cargando complejos cinematográficos...</p>
            </div>
          )}

          {error && !cargando && (
            <div className="text-center py-20 bg-red-500/10 border border-red-500/20 rounded-2xl p-6 max-w-xl mx-auto">
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          )}

          {!cargando && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sucursales.map((sucursal) => {
                const cinemaUrl = `/cinemas/${convertToSlug(sucursal.name)}`                
                return (
                  <div 
                    key={sucursal.id || sucursal.name} 
                    className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-[#F6AD38]/40 transition-all duration-300 flex flex-col group"
                  >
                    {/* Contenido de la Tarjeta por sucursal */}
                    <div className="p-6 flex flex-col flex-grow text-left justify-between space-y-5">
                      
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-lg md:text-xl font-bold text-white tracking-wide group-hover:text-[#F6AD38] transition-colors">
                            {sucursal.name}
                          </h4>
                          <p className="text-xs text-gray-400 font-medium mt-1">
                            Horario: {sucursal.opening_time} - {sucursal.closing_time}
                          </p>
                        </div>
                        
                        <div className="space-y-1">
                          <span className="text-[11px] text-[#F6AD38] uppercase font-bold tracking-wider block">Ubicación</span>
                          <p className="text-xs md:text-sm text-gray-300 leading-relaxed line-clamp-2">
                            {sucursal.address || 'Dirección no disponible'}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                          <div>
                            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Teléfono</span>
                            <p className="text-xs text-gray-200 font-medium whitespace-nowrap">
                              {sucursal.phone || 'No disponible'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Link
                          to={cinemaUrl}
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-[#231640] text-xs md:text-sm font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.01] active:scale-95 text-center"
                        >
                          {/* Icono de Ticket / Entrada de Cine */}
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 md:w-4 md:h-4">
                            <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67c0-1.13-.67-2.16-1.71-2.62a3.748 3.748 0 01-3.29 0c-1.04.46-1.71 1.49-1.71 2.62v.18A1.5 1.5 0 0113.32 10.2H10.69A1.5 1.5 0 019.18 8.85v-.18c0-1.13-.67-2.16-1.71-2.62a3.748 3.748 0 01-3.29 0C3.14 6.51 2.5 7.54 2.5 8.67z" />
                            <path d="M12 12.75a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V13.5a.75.75 0 01.75-.75zm-3.75.75a.75.75 0 00-1.5 0v2.25a.75.75 0 001.5 0V13.5zm7.5 0a.75.75 0 00-1.5 0v2.25a.75.75 0 001.5 0V13.5z" />
                          </svg>
                          Ver Peliculas y Funciones
                        </Link>
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {!cargando && !error && sucursales.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-20">No hay sucursales registradas en este momento.</p>
          )}

          <div className="pt-4 text-center border-t border-white/10">
            <p className="text-xs md:text-sm font-medium text-gray-400 italic">
              ¿Interesado en funciones privadas o eventos corporativos en alguna de nuestras sedes?
            </p>
            <div className="inline-block mt-3 px-4 py-1.5 bg-[#7B1A82]/30 border border-[#F6AD38]/20 rounded-full text-[11px] text-[#F6AD38] uppercase font-bold tracking-wider">
              Contáctanos directamente mediante al correo de informatica.promo69@gmail.com
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}

export default InfoSucursales