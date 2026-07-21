import React, { useState, useEffect, useMemo } from 'react';
import Footer from '../../components/ui/Footer';
import MovieCard from '../../components/movies/MovieCard';
import PageHeader from '../../components/ui/PageHeader';
import { getMoviesBillboard } from '../../services/movies.service';
import { getProjectionTypes, getLanguages } from '../../services/info.service';
import useDocumentTitle from '../../hooks/useDocumentTitle';


export default function MoviesReleases() {
  useDocumentTitle('Cartelera');

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
            title: content.title || content.name, // Fallback de título/nombre
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

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#231640] text-white justify-between font-['Montserrat'] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-[80px] animate-pulse" />
        <div className="flex-grow flex items-center justify-center relative z-10">
          <p className="text-sm font-bold tracking-widest uppercase animate-pulse text-gray-300">
            Cargando filtros y funciones...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#231640] text-white justify-between font-['Montserrat'] relative overflow-hidden">

      {/* Fondos ambientales sutiles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-5%] w-[40vw] h-[40vw] bg-white/[0.01] rounded-full blur-[140px] pointer-events-none" />

      <section className={`px-4 md:px-8 lg:px-16 w-full flex-grow flex flex-col relative z-10 ${filteredMovies.length === 0 ? 'py-12' : 'py-16'}`}>
        <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col">

          <PageHeader
            className="border-b border-white/5 pb-6 mb-10"
            titlePrefix="Películas en"
            titleHighlight="Cartelera"
            subtitle="Filtra por formato de pantalla de tu preferencia para personalizar la experiencia perfecta en nuestras salas de Cineflix."
            rightContent={
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
            }
          />

          {/* Renderizado Condicional delegando a MovieCard */}
          {filteredMovies.length === 0 ? (
            <div className="flex-grow flex items-center justify-center my-auto pb-12">
              <p className="text-gray-400 text-base md:text-lg font-medium tracking-wide bg-white/5 px-6 py-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                No hay funciones disponibles que coincidan con el formato seleccionado.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {filteredMovies.map((movie, index) => (
                <MovieCard
                  key={`${movie.type}-${movie.id || index}-${index}`}
                  movie={movie}
                  isEventsPage={movie.isEvent}
                />
              ))}
            </div>
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
}
