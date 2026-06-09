import React, { useState, useEffect } from 'react';
import Footer from '../../components/ui/Footer';
import { getUpcomingMovies } from '../../services/movies.service';

export default function MoviesUpComing() {
  const [billboardMovies, setBillboardMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await getUpcomingMovies();
        console.log("Respuesta exacta de la API:", response);
        
        let moviesData = [];
        if (response?.data?.rows) {
          moviesData = response.data.rows;
        } else if (response?.rows) {
          moviesData = response.rows;
        } else if (response?.data) {
          moviesData = response.data;
        } else if (Array.isArray(response)) {
          moviesData = response;
        }

        setBillboardMovies(moviesData);
      } catch (error) {
        console.error("Error cargando los próximos estrenos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // --- FUNCIÓN DE AGRUPACIÓN POR MES (FILTRO FRONTEND) ---
  const getMoviesGroupedByMonth = () => {
    if (!Array.isArray(billboardMovies) || billboardMovies.length === 0) return {};

    const mesesEspanol = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    return billboardMovies.reduce((groups, movie) => {
      if (!movie.release_date) {
        const unknownKey = 'Por Confirmar';
        if (!groups[unknownKey]) groups[unknownKey] = [];
        groups[unknownKey].push(movie);
        return groups;
      }

      const parts = movie.release_date.split('-');
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1; 

      if (monthIndex >= 0 && monthIndex < 12) {
        const formattedMonth = `${mesesEspanol[monthIndex]} ${year}`;
        
        if (!groups[formattedMonth]) {
          groups[formattedMonth] = [];
        }
        groups[formattedMonth].push(movie);
      } else {
        const unknownKey = 'Por Confirmar';
        if (!groups[unknownKey]) groups[unknownKey] = [];
        groups[unknownKey].push(movie);
      }

      return groups;
    }, {});
  };

  const groupedMovies = getMoviesGroupedByMonth();
  const monthsOrder = Object.keys(groupedMovies);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#231640] text-white justify-between font-['Montserrat']">
        <div className="flex-grow flex items-center justify-center">
          <p className="text-lg animate-pulse">Cargando próximos estrenos...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${monthsOrder.length === 0 ? 'h-[calc(100vh-80px)] overflow-hidden' : 'min-h-screen'} bg-[#231640] text-white justify-between font-['Montserrat']`}>
      
      {/* Sección principal de Contenido */}
      <section className={`bg-[#231640] px-4 md:px-8 lg:px-16 w-full flex-grow flex flex-col ${monthsOrder.length === 0 ? 'pt-10 pb-4' : 'py-16'}`}>
        <div className={`max-w-7xl mx-auto w-full ${monthsOrder.length === 0 ? 'flex-grow flex flex-col' : ''}`}>
          
          {/* Encabezado */}
          <div className="border-l-4 border-[#F6AD38] pl-4 text-left mb-12 flex-shrink-0">
            <h3 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white leading-none">
              Próximos <span className="text-[#F6AD38]">Estrenos</span>
            </h3>
            <p className="text-xs md:text-sm text-gray-400 mt-2 uppercase tracking-wider font-semibold">
              Explora los títulos más esperados que llegarán muy pronto a las salas de CINEFLIX. ¡Prepara tu agenda cinéfila!
            </p>
          </div>

          {/* Condicional de renderizado */}
          {monthsOrder.length === 0 ? (
            <div className="flex-grow flex items-center justify-center pb-12">
              <p className="text-gray-400 text-base md:text-lg font-medium tracking-wide">
                No hay próximos estrenos programados en este momento.
              </p>
            </div>
          ) : (
            <div className="space-y-16">
              {monthsOrder.map((month) => (
                <div key={month} className="space-y-6">
                  
                  {/* Título de la Sección del Mes */}
                  <div className="flex items-center space-x-4">
                    <h2 className="text-xl md:text-2xl font-bold text-[#F6AD38] tracking-wide uppercase">
                      {month}
                    </h2>
                    <div className="flex-grow h-[1px] bg-white/10" />
                  </div>

                  {/* Grid de Películas de este mes específico */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                    {groupedMovies[month].map((movie, index) => (
                      <div
                        key={`${movie.id || index}-${index}`}
                        className="flex flex-col group cursor-pointer"
                      >
                        {/* Contenedor del Póster */}
                        <div className="aspect-[2/3] w-full bg-white/[0.02] rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative group-hover:border-[#F6AD38]/40 transition-all duration-300">
                          <img 
                            src={movie.poster_url} 
                            alt={movie.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                            loading="lazy"
                          />

                          {/* Clasificación de Edad */}
                          <div className="absolute top-4 left-4 px-2.5 py-0.5 bg-black/70 backdrop-blur-md border border-white/10 rounded-md text-[10px] uppercase font-bold text-gray-200">
                            {movie.age_classification?.description || 'Apt'}
                          </div>

                          {/* Overlay con Hover animado */}
                          <div className="absolute inset-0 bg-gradient-to-t from-[#231640]/95 via-[#231640]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8 px-4">
                            <button className="w-full py-2.5 bg-white text-[#231640] font-bold text-xs md:text-sm rounded-xl shadow-lg hover:bg-[#F6AD38] transition-colors uppercase tracking-wider transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                              Ver Detalles
                            </button>
                          </div>
                        </div>

                        {/* Información de Texto inferior */}
                        <div className="mt-4 text-left space-y-1.5 px-1">
                          <h4 className="text-sm md:text-base font-bold text-white tracking-wide group-hover:text-[#F6AD38] line-clamp-1 transition-colors">
                            {movie.title}
                          </h4>
                          
                          {/* Mapeo dinámico de géneros del Backend */}
                          <div className="flex flex-wrap gap-1">
                            {movie.genres && movie.genres.map((g) => (
                              <span 
                                key={g.id} 
                                className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-gray-400 font-semibold tracking-wider"
                              >
                                {g._Genres?.description}
                              </span>
                            ))}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
}