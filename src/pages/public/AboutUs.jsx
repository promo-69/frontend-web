import React from 'react'
import { InfoTabs } from '../../components/ui/InfoTabs'
import groupPeopleCinema from '../../assets/images/group-people-cinema.webp'
import cinemaStuffPopcorn from '../../assets/images/cinema-stuff-around-popcorn-heart.webp'

function AboutUs() {
  const empresaTabs = [
    {
      id: 'sobre-nosotros',
      label: 'Sobre Nosotros',
      content: (
        <div className="space-y-8 animate-fadeIn text-left font-['Montserrat']">
          {/* Titular Cinematográfico */}
          <div className="border-l-4 border-[#F6AD38] pl-4 mb-6">
            <h3 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white leading-none">
              Historias que merecen ser <span className="text-[#F6AD38]">vividas</span>
            </h3>
            <p className="text-xs md:text-sm text-gray-400 mt-1.5 uppercase tracking-wider font-semibold">
              El protagonista de cada función eres tú.
            </p>
          </div>

          <div className="space-y-4 text-gray-200 text-sm md:text-base leading-relaxed">
            <p>
              Bienvenidos a <span className="text-[#F6AD38] font-bold">Cineflix</span>. Somos una cadena de cines de última generación 
              nacida con el propósito de revolucionar la forma en que vives el séptimo arte. Creemos firmemente que ir al 
              cine no es solo ver una pantalla; es desconectarse del mundo exterior para conectar con las emociones más profundas a través de 
              espacios de máximo confort y una atmósfera envolvente.
            </p>
            <p>
              Desde los grandes éxitos de taquilla que hacen vibrar las salas, hasta las joyas del cine independiente y festivales nacionales, 
              nuestra pantalla está abierta a un espectro completo de historias para todo tipo de miradas. 
            </p>
          </div>

          {/* Imagen Publicitaria Ajustada */}
          <div className="w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40">
            <img 
              src={groupPeopleCinema} 
              alt="Experiencia Cineflix" 
              className="w-full h-56 sm:h-72 md:h-96 max-h-[320px] md:max-h-[420px] object-cover object-top hover:scale-[1.01] transition-transform duration-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#7B1A82]/10 border border-white/5 rounded-2xl p-6">
            <div>
              <h4 className="text-base md:text-lg font-bold text-[#F6AD38] uppercase tracking-wide mb-2">
                Nuestra Misión
              </h4>
              <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                Brindar una experiencia cinematográfica de clase mundial, calibrando cada sala con tecnologías audiovisuales 
                de vanguardia y garantizando espacios impecables con una atención personalizada para que cada función sea mágica e inolvidable.
              </p>
            </div>
            <div>
              <h4 className="text-base md:text-lg font-bold text-[#F6AD38] uppercase tracking-wide mb-2">
                Nuestra Visión de la Gran Pantalla
              </h4>
              <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                Sabemos que el streaming cambió las reglas del juego, pero también sabemos que <span className="text-white font-semibold">la magia colectiva de una sala a oscuras es irrepetible</span>. 
                Por eso, redefinimos el estándar del cine combinando la calidez del servicio tradicional con la inmersión técnica que mereces ver y escuchar.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold text-white uppercase tracking-wider text-center md:text-left">
              Por qué elegir la experiencia Cineflix
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl hover:border-[#F6AD38]/40 transition-colors">
                <div className="text-[#F6AD38] text-lg font-bold mb-1">Todo a un Toque</div>
                <p className="text-xs text-gray-300 leading-normal">
                  Diseñamos una experiencia digital sin fricciones. Reserva tus asientos favoritos, compra tus combos de confitería prepagados y accede directo a la sala usando solo tu celular.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-xl hover:border-[#F6AD38]/40 transition-colors">
                <div className="text-[#F6AD38] text-lg font-bold mb-1">CinePuntos</div>
                <p className="text-xs text-gray-300 leading-normal">
                  Tu pasión por el cine tiene recompensa. Con nuestro programa exclusivo de lealtad, acumulas puntos en cada visita para canjearlos por entradas, confitería premium y sorpresas especiales.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 p-4 rounded-xl hover:border-[#F6AD38]/40 transition-colors">
                <div className="text-[#F6AD38] text-lg font-bold mb-1">Calidad Premium</div>
                <p className="text-xs text-gray-300 leading-normal">
                  Proyecciones nítidas, sonido envolvente de alta fidelidad y butacas confortables diseñadas para que el tiempo se detenga mientras se enciende la pantalla.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 text-center border-t border-white/10 space-y-6">
            <div>
              <p className="text-sm md:text-base font-medium text-gray-200 italic">
                "El cine llega a todas partes y está al alcance de todos. Te esperamos en la próxima función para escribir juntos una nueva historia."
              </p>
              
              <div className="inline-block mt-4 px-4 py-1.5 bg-[#7B1A82]/30 border border-[#F6AD38]/20 rounded-full text-[11px] text-[#F6AD38] uppercase font-bold tracking-wider">
                Salas disponibles para Funciones Especiales, Eventos Privados y Torneos de Gaming
              </div>
            </div>

            {/* Nueva Imagen Insertada al Final */}
            <div className="w-full overflow-hidden rounded-2xl border border-white/5 shadow-xl bg-white/[0.02]">
              <img 
                src={cinemaStuffPopcorn} 
                alt="Cineflix Popcorn" 
                className="w-full h-40 sm:h-52 md:h-64 max-h-[280px] object-cover object-center opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>
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
        <div className="space-y-4 animate-fadeIn text-left font-['Montserrat']">
          <div className="border-l-4 border-[#F6AD38] pl-4 mb-4">
            <h3 className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight">
              Contrato de Términos y <span className="text-[#F6AD38]">Condiciones de Uso</span>
            </h3>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mt-0.5">
              Portal Web Oficial de Cineflix, C.A.
            </p>
          </div>

          <div className="text-xs md:text-sm text-gray-300 space-y-5 bg-white/[0.01] border border-white/5 p-6 rounded-2xl leading-relaxed">
            <p className="text-gray-400 italic border-b border-white/5 pb-2">
              El presente contrato regula las disposiciones de acceso, navegación y uso del portal entre la sociedad mercantil CINEFLIX, C.A. y EL USUARIO. El acceso o registro implica la aceptación plena de estas cláusulas.
            </p>

            <div>
              <h5 className="text-[#F6AD38] font-bold uppercase text-[11px] tracking-wider mb-1">PRIMERA: OBJETO</h5>
              <p>Regular las condiciones para la consulta de cartelera, compra de boletos, adquisición de productos de confitería, gestión de cuentas y participación en programas de fidelización (CinePuntos).</p>
            </div>

            <div>
              <h5 className="text-[#F6AD38] font-bold uppercase text-[11px] tracking-wider mb-1">SEGUNDA: REGISTRO DEL USUARIO</h5>
              <p>Para acceder a los servicios, EL USUARIO deberá crear una cuenta proporcionando información veraz y completa, incluyendo: Nombre y Apellido, Cédula de Identidad (V o E), Correo Electrónico, Número de Teléfono, Fecha de Nacimiento y Contraseña de acceso.</p>
            </div>

            <div>
              <h5 className="text-[#F6AD38] font-bold uppercase text-[11px] tracking-wider mb-1">TERCERA: FINALIDAD Y TRATAMIENTO DE DATOS</h5>
              <p>Los datos personales serán recopilados y tratados con el fin de procesar transacciones de compra, validar la identidad para prevención de fraudes, gestionar reservas, facturación, administrar el programa de beneficios y cumplir con las regulaciones de la República Bolivariana de Venezuela.</p>
            </div>

            <div>
              <h5 className="text-[#F6AD38] font-bold uppercase text-[11px] tracking-wider mb-1">CUARTA: CONDICIONES DE COMPRA</h5>
              <p>Las operaciones se expresarán en Bolívares (Bs.) o moneda extranjera vigente. Toda compra generará un comprobante digital (código QR o de reserva) válido únicamente para la función, fecha y hora seleccionadas, incluyendo los impuestos de ley.</p>
            </div>

            <div>
              <h5 className="text-[#F6AD38] font-bold uppercase text-[11px] tracking-wider mb-1">QUINTA: POLÍTICA DE CANCELACIÓN Y REEMBOLSO</h5>
              <p>Las compras realizadas a través del portal son definitivas. No se realizan cambios ni devoluciones de dinero, salvo por cancelación de la función por parte de CINEFLIX, fallas técnicas atribuibles a la plataforma o situaciones comprobadas de fuerza mayor.</p>
            </div>

            <div>
              <h5 className="text-[#F6AD38] font-bold uppercase text-[11px] tracking-wider mb-1">SEXTA: CLASIFICACIÓN Y ADMISIÓN</h5>
              <p>CINEFLIX se reserva el derecho de admisión de acuerdo con las clasificaciones por edad estipuladas por las autoridades competentes. Es responsabilidad del usuario verificar la clasificación antes de comprar; su incumplimiento no generará reembolsos.</p>
            </div>

            <div>
              <h5 className="text-[#F6AD38] font-bold uppercase text-[11px] tracking-wider mb-1">SÉPTIMA: USO DEL PORTAL Y PROPIEDAD INTELECTUAL</h5>
              <p>Queda prohibida la reproducción total o parcial del diseño, estructura, código fuente, marcas y logotipos propiedad exclusiva de CINEFLIX. El uso indebido o actividades fraudulentas acarrearán la suspensión inmediata de la cuenta.</p>
            </div>

          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="min-h-screen bg-[#231640] text-white overflow-x-hidden flex flex-col justify-between font-['Montserrat']">
      
      
      <main className="flex-grow px-4 sm:px-8 md:px-16 pt-20 md:pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          
          <InfoTabs tabs={empresaTabs} />
          
        </div>
      </main>

      {/* Footer consistente */}
      <footer className="py-8 text-center text-gray-500 border-t border-white/10 text-xs md:text-sm bg-[#231640]">
        <p>&copy; 2026 CINEFLIX - Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}

export default AboutUs