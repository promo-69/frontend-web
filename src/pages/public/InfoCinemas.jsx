import React, { useState, useEffect } from 'react'
import { getCinemas } from '../../services/info.service' 

function InfoSucursales() {
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
            
      <main className="flex-grow px-4 sm:px-8 md:px-16 pt-20 md:pt-24 pb-12">
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
                
                return (
                  <div 
                    key={sucursal.id || sucursal.name} 
                    className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-[#F6AD38]/40 transition-all duration-300 flex flex-col group"
                  >

                    {/* Contenido de la Tarjeta por sucursal */}
                    <div className="p-6 flex flex-col flex-grow text-left space-y-4">
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
                        <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
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

      {/* Footer Consistente */}
      <footer className="py-8 text-center text-gray-500 border-t border-white/10 text-xs md:text-sm bg-[#231640]">
        <p>&copy; 2026 CINEFLIX - Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

export default InfoSucursales