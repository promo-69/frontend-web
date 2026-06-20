import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../components/ui/Footer';
import { getEvents } from '../../services/events.service'; 

const convertToSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-z0-9\s-]/g, "")    
    .replace(/\s+/g, "-")           
    .trim();
};

export default function Events() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await getEvents();
        console.log("Respuesta exacta de la API (Eventos):", response);
        
        let eventsData = [];
        if (response?.data?.rows) {
          eventsData = response.data.rows;
        } else if (response?.rows) {
          eventsData = response.rows;
        } else if (response?.data) {
          eventsData = response.data;
        } else if (Array.isArray(response)) {
          eventsData = response;
        }

        const processedEvents = eventsData.map(event => ({
          ...event,
          type: event.type || 'special_event',
          isEvent: true
        }));

        setUpcomingEvents(processedEvents);
      } catch (error) {
        console.error("Error cargando los próximos eventos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  const getEventsGroupedByMonth = () => {
    if (!Array.isArray(upcomingEvents) || upcomingEvents.length === 0) return {};

    const mesesEspanol = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    return upcomingEvents.reduce((groups, event) => {
      const eventDate = event.release_date || event.date;

      if (!eventDate) {
        const unknownKey = 'Por Confirmar';
        if (!groups[unknownKey]) groups[unknownKey] = [];
        groups[unknownKey].push(event);
        return groups;
      }

      const parts = eventDate.split('-');
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1; 

      if (monthIndex >= 0 && monthIndex < 12) {
        const formattedMonth = `${mesesEspanol[monthIndex]} ${year}`;
        
        if (!groups[formattedMonth]) {
          groups[formattedMonth] = [];
        }
        groups[formattedMonth].push(event);
      } else {
        const unknownKey = 'Por Confirmar';
        if (!groups[unknownKey]) groups[unknownKey] = [];
        groups[unknownKey].push(event);
      }

      return groups;
    }, {});
  };

  const groupedEvents = getEventsGroupedByMonth();

  const diccionarioMeses = {
    "Enero": 0, "Febrero": 1, "Marzo": 2, "Abril": 3, "Mayo": 4, "Junio": 5,
    "Julio": 6, "Agosto": 7, "Septiembre": 8, "Octubre": 9, "Noviembre": 10, "Diciembre": 11
  };

  const monthsOrder = Object.keys(groupedEvents).sort((a, b) => {
    if (a === 'Por Confirmar') return 1;
    if (b === 'Por Confirmar') return -1;

    // Separar el string "Mes Año" (Ej: "Noviembre 2025")
    const partsA = a.split(' ');
    const partsB = b.split(' ');

    const mesA = diccionarioMeses[partsA[0]];
    const anoA = parseInt(partsA[1], 10);

    const mesB = diccionarioMeses[partsB[0]];
    const anoB = parseInt(partsB[1], 10);

    // Crear objetos Date reales usando el primer día del mes para comparar con precisión
    const dateA = new Date(anoA, mesA, 1);
    const dateB = new Date(anoB, mesB, 1);

    return dateA - dateB;
  });

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#231640] text-white justify-between font-['Montserrat'] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-[80px] animate-pulse" />
        <div className="flex-grow flex items-center justify-center relative z-10">
          <p className="text-sm font-bold tracking-widest uppercase animate-pulse text-gray-300">
            Cargando próximos eventos...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#231640] text-white justify-between font-['Montserrat'] relative overflow-hidden">
      
      {/* Fondos ambientales sutiles unificados */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-5%] w-[40vw] h-[40vw] bg-white/[0.01] rounded-full blur-[140px] pointer-events-none" />

      {/* Sección principal de Contenido */}
      <section className={`px-4 md:px-8 lg:px-16 w-full flex-grow flex flex-col relative z-10 ${monthsOrder.length === 0 ? 'py-12' : 'py-16'}`}>
        <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col">
          
          {/* Encabezado Unificado de Eventos */}
          <div className="border-l-4 border-yellow-500 pl-4 text-left pb-6 mb-10">
            <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-none">
              Próximos <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">Eventos</span>
            </h3>
            <p className="text-xs md:text-sm text-gray-400 mt-3 tracking-wide font-medium max-w-xl leading-relaxed">
              Explora las funciones especiales, festivales y eventos exclusivos que están por llegar. ¡Disfruta de experiencias únicas en Cineflix!
            </p>
          </div>

          {/* Condicional de renderizado */}
          {monthsOrder.length === 0 ? (
            <div className="flex-grow flex items-center justify-center my-auto pb-12">
              <p className="text-gray-400 text-base md:text-lg font-medium tracking-wide bg-white/5 px-6 py-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                No hay eventos especiales programados en este momento.
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {monthsOrder.map((month) => (
                <div key={month} className="space-y-6">
                  
                  {/* Título de la Sección del Mes */}
                  <div className="flex items-center space-x-4">
                    <h2 className="text-xl md:text-2xl font-black text-amber-400 tracking-wide uppercase">
                      {month}
                    </h2>
                    <div className="flex-grow h-[1px] bg-white/5" />
                  </div>

                  {/* Grid de Eventos Unificado */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                    {groupedEvents[month].map((event, index) => {
                      const imageSource = event.poster_url || event.image;
                      // Al ser la página de eventos, forzamos la ruta base hacia '/eventos'
                      const detailUrl = `/eventos/${event.id}-${convertToSlug(event.title)}`;

                      return (
                        <Link
                          key={`event-${event.id || index}-${index}`}
                          to={detailUrl}
                          className="flex flex-col group cursor-pointer block movie-carousel-card"
                        >
                          {/* Contenedor del Póster */}
                          <div className="aspect-[2/3] w-full bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden relative transition-all duration-500 backdrop-blur-sm">
                            
                            {imageSource ? (
                              <img 
                                src={imageSource} 
                                alt={event.title}
                                onError={(e) => { 
                                  e.target.onerror = null; 
                                  e.target.style.display = 'none';
                                  const fallback = e.target.nextSibling;
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                                loading="lazy"
                              />
                            ) : null}

                            {/* Caja de Fallback si no hay póster */}
                            <div 
                              className="w-full h-full flex flex-col items-center justify-center bg-[#1b1032] text-gray-500 p-4"
                              style={{ display: imageSource ? 'none' : 'flex' }}
                            >
                              <span className="text-3xl mb-2">🗓️</span>
                              <span className="text-[11px] uppercase tracking-wider font-bold text-center px-2">
                                Sin Imagen Disponible
                              </span>
                            </div>

                            {/* Botón Ver Detalles en Hover */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6 px-4 z-20">
                              <span className="w-full py-2 bg-white text-black text-center font-bold text-xs rounded-xl shadow-md transition-all uppercase tracking-widest transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                Ver Detalles
                              </span>
                            </div>
                          </div>

                          {/* Meta Información Inferior */}
                          <div className="mt-3 text-left space-y-1.5 px-0.5">
                            <h4 className="text-sm font-bold text-white tracking-wide group-hover:text-amber-400 line-clamp-1 transition-colors duration-300">
                              {event.title}
                            </h4>
                            
                            {/* Mapeo dinámico de géneros o categorías del evento */}
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {event.genres && event.genres.map((g) => (
                                <span 
                                  key={g.id} 
                                  className="px-2 py-0.5 bg-purple-600/20 border border-purple-500/40 rounded-md text-[9px] text-purple-300 font-extrabold tracking-wider uppercase shadow-[0_2px_6px_rgba(168,85,247,0.15)]"
                                >
                                  {g._Genres?.description || g.description}
                                </span>
                              ))}

                              {/* ETIQUETA DISTINTIVA DE EVENTO */}
                              <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded-md text-[9px] text-amber-400 font-extrabold tracking-wider uppercase shadow-[0_2px_6px_rgba(245,158,11,0.15)]">
                                ⭐ Evento Especial
                              </span>
                            </div>
                          </div>

                        </Link>
                      );
                    })}
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
}