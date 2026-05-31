import React from 'react'
import Header from '../../components/ui/Header' // Ajusta la ruta según tu estructura
// Descomenta estas líneas cuando tengas las imágenes listas en tus assets
// import sucursalSanAntonio from '../../assets/images/sucursal-san-antonio.webp'
// import sucursalLasTrinitarias from '../../assets/images/sucursal-las-trinitarias.webp'

function InfoSucursales() {
  // ==========================================
  // PLANTILLA DE DATOS (Modifica esto con tu info real)
  // ==========================================
  const sucursales = [
    {
      id: 1,
      nombre: "Cineflix Sambil",
      imagen: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&q=80&w=800", // Reemplazar por variable importada ej: sucursalSambil
      zona: "Este",
      direccion: "Centro Comercial Sambil, Av. Venezuela con Av. Bracamonte, Nivel Feria. Barquisimeto, Lara.",
      telefono: "+58 (251) 250-1122",
      correo: "sambil@cineflix.com",
      horario: "Lunes a Domingo: 12:00 PM - 10:00 PM",
      caracteristicas: ["Salas 3D", "Confitería Premium", "Acceso VIP"]
    },
    {
      id: 2,
      nombre: "Cineflix Las Trinitarias",
      imagen: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=800", // Reemplazar por variable importada
      zona: "Centro-Este",
      direccion: "C.C. Ciudad Comercial Las Trinitarias, Av. Los Leones. Barquisimeto, Lara.",
      telefono: "+58 (251) 250-3344",
      correo: "trinitarias@cineflix.com",
      horario: "Lunes a Domingo: 1:00 PM - 11:00 PM",
      caracteristicas: ["Sonido Dolby Atmos", "Estacionamiento Vigilado", "CinePuntos Directo"]
    },
    {
      id: 3,
      nombre: "Cineflix Oeste (Metrópolis)",
      imagen: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800", // Reemplazar por variable importada
      zona: "Oeste",
      direccion: "C.C. Metrópolis, Av. Florencio Jiménez. Barquisimeto, Lara.",
      telefono: "+58 (251) 250-5566",
      correo: "metropolis@cineflix.com",
      horario: "Lunes a Domingo: 12:30 PM - 9:30 PM",
      caracteristicas: ["Salas de Gaming", "Pases Especiales", "Fácil Acceso"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#231640] text-white overflow-x-hidden flex flex-col justify-between font-['Montserrat']">
      
      {/* 1. Header Superior */}
      <Header />
      
      {/* 2. Contenedor Principal */}
      <main className="flex-grow px-4 sm:px-8 md:px-16 pt-20 md:pt-24 pb-12">
        <div className="max-w-6xl mx-auto space-y-10 animate-fadeIn">
          
          {/* Titular Cinematográfico (Estilo AboutUs) */}
          <div className="border-l-4 border-[#F6AD38] pl-4 text-left">
            <h3 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white leading-none">
              Nuestras <span className="text-[#F6AD38]">Sucursales</span>
            </h3>
            <p className="text-xs md:text-sm text-gray-400 mt-1.5 uppercase tracking-wider font-semibold">
              Encuentra el complejo Cineflix más cercano a ti y vive la magia.
            </p>
          </div>

          {/* Grid de Sucursales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sucursales.map((sucursal) => (
              <div 
                key={sucursal.id} 
                className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-[#F6AD38]/40 transition-all duration-300 flex flex-col group"
              >
                {/* Contenedor de la Imagen */}
                <div className="w-full h-48 overflow-hidden relative border-b border-white/5">
                  <img 
                    src={sucursal.imagen} 
                    alt={sucursal.nombre} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Badge de la Zona */}
                  <div className="absolute top-3 right-3 px-3 py-1 bg-[#7B1A82]/80 backdrop-blur-sm border border-[#F6AD38]/30 rounded-full text-[10px] uppercase font-bold tracking-wider text-[#F6AD38]">
                    Zona {sucursal.zona}
                  </div>
                </div>

                {/* Contenido de la Tarjeta */}
                <div className="p-6 flex flex-col flex-grow text-left space-y-4">
                  <div>
                    <h4 className="text-lg md:text-xl font-bold text-white tracking-wide group-hover:text-[#F6AD38] transition-colors">
                      {sucursal.nombre}
                    </h4>
                    <p className="text-xs text-gray-400 font-medium mt-1">
                      {sucursal.horario}
                    </p>
                  </div>

                  {/* Dirección */}
                  <div className="space-y-1">
                    <span className="text-[11px] text-[#F6AD38] uppercase font-bold tracking-wider block">Ubicación</span>
                    <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                      {sucursal.direccion}
                    </p>
                  </div>

                  {/* Contacto */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Teléfono</span>
                      <p className="text-xs text-gray-200 font-medium whitespace-nowrap">{sucursal.telefono}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Soporte</span>
                      <p className="text-xs text-gray-200 font-medium break-all">{sucursal.correo}</p>
                    </div>
                  </div>

                  {/* Características/Servicios de la sucursal */}
                  <div className="pt-3 flex flex-wrap gap-1.5 mt-auto">
                    {sucursal.caracteristicas.map((tag, index) => (
                      <span 
                        key={index} 
                        className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-gray-300 font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Banner de Info Corporativa / Alquileres al final */}
          <div className="pt-4 text-center border-t border-white/10">
            <p className="text-xs md:text-sm font-medium text-gray-400 italic">
              ¿Interesado en funciones privadas o eventos corporativos en alguna de nuestras sedes?
            </p>
            <div className="inline-block mt-3 px-4 py-1.5 bg-[#7B1A82]/30 border border-[#F6AD38]/20 rounded-full text-[11px] text-[#F6AD38] uppercase font-bold tracking-wider">
              Contáctanos directamente al correo de la sucursal de tu elección
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

export default InfoSucursales;