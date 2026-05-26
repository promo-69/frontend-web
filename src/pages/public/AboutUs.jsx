import React from 'react'
import { InfoTabs } from '../../components/ui/InfoTabs'

function AboutUs() {
  // Configuración de los datos que alimentarán tus pestañas
  const empresaTabs = [
    {
      id: 'sobre-nosotros',
      label: 'Sobre Nosotros',
      content: (
        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-bold text-[#F6AD38]">Quiénes Somos</h3>
          <p className="text-sm md:text-base text-gray-200 leading-relaxed">
            Bienvenidos a <span className="text-[#F6AD38] font-semibold">Cineflix</span>. 
            Somos una cadena de cines dedicada a ofrecer la mejor experiencia cinematográfica, 
            combinando tecnología de proyección de vanguardia, salas confortables y una excelente variedad en confitería.
          </p>
          <p className="text-sm md:text-base text-gray-200 leading-relaxed">
            Nos esforzamos día a día por llevar el entretenimiento a cada rincón, asegurando espacios impecables 
            y una atención personalizada para que cada función sea inolvidable.
          </p>
        </div>
      ),
    },
    {
      id: 'marketing',
      label: 'Marketing Empresarial',
      content: (
        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-bold text-[#F6AD38]">Alianzas y Publicidad</h3>
          <p className="text-sm md:text-base text-gray-200 leading-relaxed">
            Potencia tu marca con nosotros. Ofrecemos soluciones de marketing empresarial que incluyen 
            pautas comerciales en nuestras pantallas grandes, activaciones de marca en los lobbies de nuestras sucursales 
            y presencia digital en nuestra plataforma.
          </p>
          <div className="bg-[#7B1A82]/20 border border-[#F6AD38]/30 rounded-xl p-4 mt-2">
            <p className="text-xs md:text-sm text-[#F6AD38] font-bold uppercase mb-1">Contacto Corporativo</p>
            <p className="text-sm text-white">marketing@cineflix.com</p>
          </div>
        </div>
      ),
    },
    {
      id: 'terminos',
      label: 'Términos y Condiciones',
      content: (
        <div className="space-y-4">
          <h3 className="text-xl md:text-2xl font-bold text-[#F6AD38]">Políticas de Uso</h3>
          <div className="text-xs md:text-sm text-gray-300 space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            <p>
              <strong>1. Adquisición de Boletos:</strong> Toda compra realizada a través de nuestro portal web 
              o aplicación móvil es definitiva. No se realizan cambios ni devoluciones de dinero una vez emitido el código de barra o ticket digital.
            </p>
            <p>
              <strong>2. Acceso a las Salas:</strong> Es indispensable presentar el boleto digital o impreso al ingresar. Cineflix se reserva el derecho de admisión de acuerdo con las clasificaciones por edad estipuladas por las leyes locales.
            </p>
            <p>
              <strong>3. Confitería:</strong> Por motivos de higiene y seguridad, se restringe el acceso a las salas con alimentos y bebidas que no hayan sido adquiridos en los puntos de venta oficiales de Cineflix.
            </p>
          </div>
        </div>
      ),
    },
  ]

  return (
    /* Mismo color de fondo y propiedades estéticas que tu Home para mantener consistencia */
    <div className="min-h-screen bg-[#231640] text-white overflow-x-hidden flex flex-col justify-between">
      
      {/* Contenedor principal del contenido. 
        El padding-top (pt-24 y md:pt-32) asegura que el Header fijo no tape las pestañas.
      */}
      <main className="flex-grow px-4 sm:px-6 md:px-16 pt-24 md:pt-36 pb-12">
        <div className="max-w-5xl mx-auto">
          
          {/* Título de la sección (Opcional, puedes removerlo si deseas el diseño exacto de tu captura) */}
          <div className="text-center mb-4 md:mb-8">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-1">Company - Info</span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">Nuestra Empresa</h2>
          </div>

          {/* Invocación del componente con los datos adaptados */}
          <InfoTabs tabs={empresaTabs} />
          
        </div>
      </main>

      {/* Footer consistente con la aplicación */}
      <footer className="py-8 text-center text-gray-500 border-t border-white/10 text-xs md:text-sm bg-[#231640]">
        <p>&copy; 2026 CINEFLIX - Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

export default AboutUs