import React, { useState, useEffect } from 'react';
import Footer from '../../components/ui/Footer';
import MovieCard from '../../components/movies/MovieCard'; 
import { getEvents } from '../../services/events.service'; 

export default function Events() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await getEvents();
        
        const eventsData = Array.isArray(response) ? response : [];

        const processedEvents = eventsData.map(event => ({
          ...event,
          title: event.title || event.name, 
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

    const months = [
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
        const formattedMonth = `${months[monthIndex]} ${year}`;
        
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

  const monthsDirectory = {
    "Enero": 0, "Febrero": 1, "Marzo": 2, "Abril": 3, "Mayo": 4, "Junio": 5,
    "Julio": 6, "Agosto": 7, "Septiembre": 8, "Octubre": 9, "Noviembre": 10, "Diciembre": 11
  };

  const monthsOrder = Object.keys(groupedEvents).sort((a, b) => {
    if (a === 'Por Confirmar') return 1;
    if (b === 'Por Confirmar') return -1;

    const partsA = a.split(' ');
    const partsB = b.split(' ');

    const mesA = monthsDirectory[partsA[0]];
    const anoA = parseInt(partsA[1], 10);

    const mesB = monthsDirectory[partsB[0]];
    const anoB = parseInt(partsB[1], 10);

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

                  {/* Grid de Eventos Unificado delegando al DOM Virtual */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                    {groupedEvents[month].map((event, index) => (
                      <MovieCard 
                        key={`event-${event.id || index}-${index}`}
                        movie={event}
                        isEventsPage={true}
                      />
                    ))}
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