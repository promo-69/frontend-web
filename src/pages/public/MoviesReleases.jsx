import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../components/ui/Footer';
import { getMoviesBillboard } from '../../services/movies.service';
import { getProjectionTypes, getLanguages } from '../../services/info.service';

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

export default function MoviesReleases() {
  const [billboardMovies, setBillboardMovies] = useState([]);
  const [projectionTypes, setProjectionTypes] = useState([]);
  const [languages, setLanguages] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [activeProjection, setActiveProjection] = useState('Todos');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [billboardRes, projectionRes, languageRes] = await Promise.all([
          getMoviesBillboard(),
          getProjectionTypes(),
          getLanguages()
        ]);

        const rawProjections = projectionRes?.data || projectionRes || [];
        setProjectionTypes(Array.isArray(rawProjections) ? rawProjections : []);
        setLanguages(languageRes?.data || languageRes || []);

        const billboardData = billboardRes?.data || billboardRes || [];
        
        const processedItems = billboardData.map(item => {
          const content = item.movie || item.event || item;
          const isSpecialEvent = item.type === 'special_event' || !!item.event;

          const availableFormats = item.showtimes && Array.isArray(item.showtimes)
            ? Array.from(new Set(item.showtimes.map(s => s.projection_type?.description?.trim()).filter(Boolean)))
            : [];

          const availableLanguages = item.showtimes && Array.isArray(item.showtimes)
            ? Array.from(new Set(item.showtimes.map(s => s.language?.description?.trim()).filter(Boolean)))
            : [];

          return {
            ...content,
            type: item.type,
            id: content.id || item.id, 
            showtimes: item.showtimes || [],
            availableFormats,   
            availableLanguages, 
            isEvent: isSpecialEvent
          };
        });
        
        const uniqueItems = Array.from(
          new Map(processedItems.map(item => [`${item.type}-${item.id}`, item])).values()
        );

        setBillboardMovies(uniqueItems); 
      } catch (error) {
        console.error("Error inicializando los datos de cartelera o catálogos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Filtro por Tipo de Proyección
  const filteredMovies = useMemo(() => {
    return billboardMovies.filter(item => {
      if (activeProjection === 'Todos') return true;
      return item.availableFormats?.some(
        format => format.toLowerCase() === activeProjection.toLowerCase()
      );
    });
  }, [billboardMovies, activeProjection]);

  const moviesToRender = useMemo(() => {
    if (filteredMovies.length < 8 && filteredMovies.length > 0) {
      return [...filteredMovies, ...filteredMovies].slice(0, 8);
    }
    return filteredMovies;
  }, [filteredMovies]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#231640] text-white justify-between font-['Montserrat'] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#F6AD38]/10 rounded-full blur-[80px] animate-pulse" />
        <div className="flex-grow flex items-center justify-center relative z-10">
          <p className="text-lg font-medium tracking-widest uppercase animate-pulse text-[#F6AD38]">
            Cargando filtros y funciones...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    /* Cambiado a min-h-screen constante para evitar que el alto calculado rompa el viewport */
    <div className="flex flex-col min-h-screen bg-[#231640] text-white justify-between font-['Montserrat'] relative overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-5%] w-[40vw] h-[40vw] bg-[#F6AD38]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-[10%] w-[30vw] h-[30vw] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Ajustado el padding condicional de la sección para mantener simetría visual */}
      <section className={`px-4 md:px-8 lg:px-16 w-full flex-grow flex flex-col relative z-10 ${moviesToRender.length === 0 ? 'py-12' : 'py-16'}`}>
        <div className={`max-w-7xl mx-auto w-full flex-grow flex flex-col`}>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/5 pb-6 mb-10 gap-6">
            <div className="border-l-4 border-[#F6AD38] pl-4 text-left">
              <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-none">
                Películas en <span className="text-[#F6AD38] bg-gradient-to-r from-[#F6AD38] to-[#ffc973] bg-clip-text text-transparent">Cartelera</span>
              </h3>
              <p className="text-xs md:text-sm text-gray-400 mt-3 tracking-wide font-medium max-w-xl leading-relaxed">
                Filtra por formato de pantalla de tu preferencia para personalizar la experiencia perfecta en nuestras salas de Cineflix.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              
              <div className="flex gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
                <button
                  onClick={() => setActiveProjection('Todos')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 border ${
                    activeProjection === 'Todos'
                      ? 'bg-purple-600 text-white border-purple-500 shadow-[0_4px_12px_rgba(168,85,247,0.4)]'
                      : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Todos los Formatos
                </button>
                {projectionTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setActiveProjection(type.description)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 border ${
                      activeProjection.toLowerCase() === type.description?.toLowerCase()
                        ? 'bg-purple-600 text-white border-purple-500 shadow-[0_4px_12px_rgba(168,85,247,0.4)]'
                        : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {type.description}
                  </button>
                ))}
              </div>

            </div>
          </div>

          {/* Renderizado Condicional */}
          {moviesToRender.length === 0 ? (
            <div className="flex-grow flex items-center justify-center my-auto pb-12">
              <p className="text-gray-400 text-base md:text-lg font-medium tracking-wide bg-white/5 px-6 py-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                No hay funciones disponibles que coincidan con el formato seleccionado.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {moviesToRender.map((movie, index) => {
                const imageSource = movie.poster_url || movie.image;
                const routePrefix = movie.isEvent ? 'eventos' : 'movies';
                const detailUrl = `/${routePrefix}/${movie.id}-${convertToSlug(movie.title)}`;

                return (
                  <Link
                    key={`${movie.type}-${movie.id || index}-${index}`}
                    to={detailUrl}
                    className="flex flex-col group cursor-pointer block"
                  >
                    <div className="aspect-[2/3] w-full bg-white/[0.02] rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative group-hover:border-[#F6AD38]/60 group-hover:shadow-[0_0_30px_rgba(246,173,56,0.25)] transition-all duration-500 backdrop-blur-sm">
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
                      
                      {imageSource ? (
                        <img 
                          src={imageSource} 
                          alt={movie.title}
                          onError={(e) => { 
                            e.target.onerror = null; 
                            e.target.style.display = 'none';
                            const fallback = e.target.nextSibling;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                          loading="lazy"
                        />
                      ) : null}

                      <div 
                        className="w-full h-full flex flex-col items-center justify-center bg-[#1b1032] text-gray-500 p-4"
                        style={{ display: imageSource ? 'none' : 'flex' }}
                      >
                        <span className="text-3xl mb-2">🎬</span>
                        <span className="text-[11px] uppercase tracking-wider font-bold text-center px-2">
                          Sin Póster Disponible
                        </span>
                      </div>

                      <div className="absolute top-4 left-4 px-2.5 py-1 bg-black/70 backdrop-blur-md border border-white/20 rounded-lg text-[10px] uppercase font-black text-[#F6AD38] tracking-widest shadow-md z-10">
                        {movie.age_classification?.description ? movie.age_classification.description.split(' ')[0] : 'Apt'}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-[#1b1032] via-[#231640]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end justify-center pb-8 px-4 z-10">
                        <span className="w-full py-3 bg-[#F6AD38] text-[#231640] text-center font-black text-xs md:text-sm rounded-xl shadow-[0_4px_15px_rgba(246,173,58,0.4)] hover:bg-white hover:text-black transition-all uppercase tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          Ver Detalles
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 text-left space-y-2 px-1">
                      <h4 className="text-sm md:text-base font-extrabold text-white tracking-wide group-hover:text-[#F6AD38] line-clamp-1 transition-colors duration-300">
                        {movie.title}
                      </h4>
                      
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {movie.availableFormats?.map((format, i) => (
                          <span 
                            key={`f-${i}`} 
                            className="px-2 py-0.5 bg-purple-600/20 border border-purple-500/30 rounded-md text-[9px] text-purple-300 font-extrabold tracking-wider uppercase"
                          >
                            {format}
                          </span>
                        ))}
                        
                        {movie.availableLanguages?.map((lang, i) => (
                          <span 
                            key={`l-${i}`} 
                            className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-md text-[9px] text-gray-400 font-medium tracking-wide"
                          >
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
}