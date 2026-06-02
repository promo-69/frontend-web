import React, { useState, useEffect } from 'react';
import { getMoviesReleases } from '../../services/movies.service';

export default function MoviesReleases() {
  const [billboardMovies, setBillboardMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMoviesReleases();
        setBillboardMovies(data || []); 
      } catch (error) {
        console.error("Error cargando la cartelera:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const moviesToRender = billboardMovies.length < 8 && billboardMovies.length > 0
    ? [...billboardMovies, ...billboardMovies].slice(0, 8) 
    : billboardMovies;

    if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#231640] text-white justify-between font-['Montserrat']">
        <div className="flex-grow flex items-center justify-center">
          <p className="text-lg animate-pulse">Cargando cartelera...</p>
        </div>
        <footer className="py-8 text-center text-gray-500 border-t border-white/10 text-xs md:text-sm bg-[#231640]">
          <p>&copy; 2026 CINEFLIX - Todos los derechos reservados.</p>
        </footer>
      </div>
    );
  }

  return (

<div className={`flex flex-col ${moviesToRender.length === 0 ? 'h-[calc(100vh-80px)] overflow-hidden' : 'min-h-screen'} bg-[#231640] text-white justify-between font-['Montserrat']`}>
      
      {/* Sección principal de Contenido */}
      <section className={`bg-[#231640] px-4 md:px-8 lg:px-16 w-full flex-grow flex flex-col ${moviesToRender.length === 0 ? 'pt-10 pb-4' : 'py-16'}`}>
        <div className={`max-w-7xl mx-auto w-full ${moviesToRender.length === 0 ? 'flex-grow flex flex-col' : ''}`}>
          
          {/* Encabezado */}
          <div className="border-l-4 border-[#F6AD38] pl-4 text-left mb-6 flex-shrink-0">
            <h3 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white leading-none">
              Peliculas en <span className="text-[#F6AD38]">Cartelera</span>
            </h3>
            <p className="text-xs md:text-sm text-gray-400 mt-2 uppercase tracking-wider font-semibold">
              Tu pase directo a las mejores historias. Explora las películas disponibles hoy en nuestras salas, consulta los horarios y asegura tus entradas para vivir la magia del cine ahora mismo.            
            </p>
          </div>

          {/* Condicional de películas */}
          {moviesToRender.length === 0 ? (
            // Flex-grow y flex items-center justifican el texto perfectamente al centro del espacio restante
            <div className="flex-grow flex items-center justify-center pb-12">
              <p className="text-gray-400 text-base md:text-lg font-medium tracking-wide">
                No hay películas disponibles en este momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {moviesToRender.map((movie, index) => (
                <div
                  key={`${movie.id || index}-${index}`}
                  className="flex flex-col group cursor-pointer"
                >
                  <div className="aspect-[2/3] w-full bg-white/[0.02] rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative group-hover:border-[#F6AD38]/40 transition-all duration-300">
                    <img 
                      src={movie.image} 
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                      loading="lazy"
                    />

                    <div className="absolute top-4 left-4 px-2.5 py-0.5 bg-black/70 backdrop-blur-md border border-white/10 rounded-md text-[10px] uppercase font-bold text-gray-200">
                      {movie.rating || 'Apt'}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-[#231640]/95 via-[#231640]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-8 px-4">
                      <button className="w-full py-2.5 bg-[#F6AD38] text-[#231640] font-bold text-xs md:text-sm rounded-xl shadow-lg hover:bg-white transition-colors uppercase tracking-wider transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        Comprar Entrada
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 text-left space-y-1.5 px-1">
                    <h4 className="text-sm md:text-base font-bold text-white tracking-wide group-hover:text-[#F6AD38] line-clamp-1 transition-colors">
                      {movie.title}
                    </h4>
                    
                    <div className="flex flex-wrap gap-1">
                      {movie.tags && movie.tags.map((tag, i) => (
                        <span 
                          key={i} 
                          className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-gray-400 font-semibold tracking-wider"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* Footer fijo al final sin empujar el layout */}
      <footer className="py-8 text-center text-gray-500 border-t border-white/10 text-xs md:text-sm bg-[#231640] flex-shrink-0">
        <p>&copy; 2026 CINEFLIX - Todos los derechos reservados.</p>
      </footer>

    </div>
  );
}