import React, { useState, useEffect } from 'react';
import Footer from '../../components/ui/Footer';
import { getMoviesBillboard } from '../../services/movies.service';

export default function MoviesReleases() {
  const [billboardMovies, setBillboardMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Todos'); // Estado para simular interactividad

  // URL base para las imágenes (cámbiala por la URL de tu backend en producción)
  const API_URL = 'http://127.0.0.1:3000'; 

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMoviesBillboard();
        
        // 1. Extraemos la película del objeto de función/horario
        const extractedMovies = (data || []).map(item => item.movie || item);
        
        // 2. Eliminamos películas duplicadas (por si una película tiene 5 horarios distintos)
        const uniqueMovies = Array.from(
          new Map(extractedMovies.map(m => [m.id_movie || m.id, m])).values()
        );

        setBillboardMovies(uniqueMovies); 
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
      <div className="flex flex-col min-h-screen bg-[#231640] text-white justify-between font-['Montserrat'] relative overflow-hidden">
        {/* Aura de carga */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#F6AD38]/10 rounded-full blur-[80px] animate-pulse" />
        <div className="flex-grow flex items-center justify-center relative z-10">
          <p className="text-lg font-medium tracking-widest uppercase animate-pulse text-[#F6AD38]">
            Cargando cartelera...
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${moviesToRender.length === 0 ? 'h-[calc(100vh-80px)] overflow-hidden' : 'min-h-screen'} bg-[#231640] text-white justify-between font-['Montserrat'] relative overflow-hidden`}>
      
      {/* CAPA DE LUCES AMBIENTALES (Auras de Fondo) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-5%] w-[40vw] h-[40vw] bg-[#F6AD38]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-[10%] w-[30vw] h-[30vw] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Sección principal de Contenido */}
      <section className={`px-4 md:px-8 lg:px-16 w-full flex-grow flex flex-col relative z-10 ${moviesToRender.length === 0 ? 'pt-10 pb-4' : 'py-16'}`}>
        <div className={`max-w-7xl mx-auto w-full ${moviesToRender.length === 0 ? 'flex-grow flex flex-col' : ''}`}>
          
          {/* Encabezado Estilizado */}
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-6 mb-10 gap-6">
            <div className="border-l-4 border-[#F6AD38] pl-4 text-left">
              <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-none">
                Películas en <span className="text-[#F6AD38] bg-gradient-to-r from-[#F6AD38] to-[#ffc973] bg-clip-text text-transparent">Cartelera</span>
              </h3>
              <p className="text-xs md:text-sm text-gray-400 mt-3 tracking-wide font-medium max-w-2xl leading-relaxed">
                Tu pase directo a las mejores historias. Explora las películas disponibles hoy en nuestras salas, consulta los horarios y asegura tus entradas para vivir la magia del cine ahora mismo.            
              </p>
            </div>

            {/* Píldoras de Filtros / Tabs interactivas */}
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
              {['Todos', 'Estrenos', 'Acción', 'Comedia'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all duration-300 border ${
                    activeTab === tab
                      ? 'bg-[#F6AD38] text-[#231640] border-[#F6AD38] shadow-[0_4px_12px_rgba(246,173,58,0.3)]'
                      : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Condicional de películas */}
          {moviesToRender.length === 0 ? (
            <div className="flex-grow flex items-center justify-center pb-12">
              <p className="text-gray-400 text-base md:text-lg font-medium tracking-wide bg-white/5 px-6 py-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                No hay películas disponibles en este momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {moviesToRender.map((movie, index) => {
                
                // Formateador de imagen: maneja URLs completas o nombres de archivo locales
                const imageSource = movie.poster_url || movie.image;
                const finalImageSrc = imageSource?.startsWith('http') 
                  ? imageSource 
                  : `${API_URL}/assets/${imageSource}`;

                return (
                  <div
                    key={`${movie.id_movie || movie.id || index}-${index}`}
                    className="flex flex-col group cursor-pointer"
                  >
                    {/* Tarjeta del Póster */}
                    <div className="aspect-[2/3] w-full bg-white/[0.02] rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative group-hover:border-[#F6AD38]/60 group-hover:shadow-[0_0_30px_rgba(246,173,56,0.25)] transition-all duration-500 backdrop-blur-sm">
                      
                      {/* Imagen con un degradado base por si tarda en cargar */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
                      <img 
                        src={finalImageSrc} 
                        alt={movie.title}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x450?text=Sin+Poster' }} // Imagen por defecto si falla
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-85 group-hover:opacity-100"
                        loading="lazy"
                      />

                      {/* Clasificación (Badge Superior Izquierdo) */}
                      <div className="absolute top-4 left-4 px-2.5 py-1 bg-black/70 backdrop-blur-md border border-white/20 rounded-lg text-[10px] uppercase font-black text-[#F6AD38] tracking-widest shadow-md">
                        {movie.rating || 'Apt'}
                      </div>

                      {/* Overlay al hacer Hover (Efecto Cine) */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1b1032] via-[#231640]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex items-end justify-center pb-8 px-4">
                        <button className="w-full py-3 bg-[#F6AD38] text-[#231640] font-black text-xs md:text-sm rounded-xl shadow-[0_4px_15px_rgba(246,173,58,0.4)] hover:bg-white hover:text-black transition-all uppercase tracking-widest transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          Comprar Entrada
                        </button>
                      </div>
                    </div>

                    {/* Detalles de la Película (Bajo la tarjeta) */}
                    <div className="mt-4 text-left space-y-2 px-1">
                      <h4 className="text-sm md:text-base font-extrabold text-white tracking-wide group-hover:text-[#F6AD38] line-clamp-1 transition-colors duration-300">
                        {movie.title}
                      </h4>
                      
                      {/* Tags / Géneros */}
                      <div className="flex flex-wrap gap-1.5">
                        {movie.tags && movie.tags.length > 0 ? (
                          movie.tags.map((tag, i) => (
                            <span 
                              key={i} 
                              className="px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-[9px] text-gray-400 font-bold tracking-wider uppercase"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          // Placeholder de tags por si vienen vacíos en desarrollo
                          ['Cine', 'Estreno'].map((placeholderTag, i) => (
                            <span 
                              key={i} 
                              className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded-md text-[9px] text-purple-300 font-bold tracking-wider uppercase"
                            >
                              {placeholderTag}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}