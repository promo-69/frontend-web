import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../movies/MovieCard'; 
import { useAuth } from '../../context/AuthContext';
import { getMoviesGenres, getMoviesByGenres } from '../../services/movies.service';
import roomRentImg from '../../assets/images/rent.webp'; 
import genresImg from '../../assets/images/genres.webp'; 

export default function ForU() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [genres, setGenres] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const fetchPersonalizedData = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      setLoading(true);
      let userGenres = [];

      try {
        userGenres = await getMoviesGenres();
        console.log("🔍 [ForU] Géneros obtenidos del backend:", userGenres);
        
        if (userGenres && userGenres.length > 0) {
          setGenres(userGenres);
        } else {
          setGenres([]);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("❌ [ForU] Error al recuperar géneros:", error);
        setGenres([]);
        setLoading(false);
        return;
      }

      try {
        const genreIds = userGenres.map(g => g.id);
        console.log("🚀 [ForU] Solicitando películas con IDs:", genreIds);
        
        const moviesData = await getMoviesByGenres(genreIds); 
        console.log("🍿 [ForU] Películas recomendadas recibidas:", moviesData);
        
        setRecommendedMovies(moviesData || []);
      } catch (error) {
        console.error("⚠️ [ForU] El servicio de películas recomendadas falló:", error);
        setRecommendedMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalizedData();
  }, [isAuthenticated]); 

  useEffect(() => {
    if (!loading && (genres.length === 0 || !isAuthenticated)) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev === 0 ? 1 : 0));
      }, 5000); 
      return () => clearInterval(interval);
    }
  }, [loading, genres, isAuthenticated]);

  const handleGenreBannerClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      navigate('/myGenres'); 
    }
  };

  const handleRoomsBannerClick = () => {
    navigate('/alquiler-salas'); 
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // VERSION 1: No logueado o sin géneros (Carrusel Publicitario)
  if (!isAuthenticated || genres.length === 0) {
    return (
      <div className="w-full relative overflow-hidden rounded-2xl bg-slate-950 h-64 sm:h-72 md:h-80 lg:h-96 shadow-xl font-montserrat my-6 group">
        
        {/* Selección de Géneros */}
        <div 
          className={`absolute inset-0 w-full h-full flex flex-col justify-center px-6 sm:px-12 md:px-16 transition-all duration-1000 ease-in-out cursor-pointer ${
            currentBanner === 0 ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
          }`}
          onClick={handleGenreBannerClick}
        >
          <img 
            src={genresImg} 
            alt="Géneros de películas Cineflix" 
            className="absolute inset-0 w-full h-full object-cover object-[75%_center] pointer-events-none opacity-90 transition-transform duration-700 group-hover:scale-[1.01]"
          />

          <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/20 via-slate-900/10 to-transparent opacity-40 mix-blend-overlay pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1c1035] via-[#130b24]/90 sm:via-[#130b24]/60 to-transparent z-0" />
          
          <div className="relative z-10 max-w-[90%] sm:max-w-md md:max-w-xl transition-transform duration-500 group-hover:translate-x-1">
            <span className="text-amber-400 uppercase tracking-widest text-[10px] sm:text-xs font-black mb-2 block">
              Recomendaciones personalizadas
            </span>
            <h2 className="text-white text-xl sm:text-2xl md:text-4xl font-black uppercase leading-tight tracking-wide drop-shadow-sm">
              ¿No sabes qué ver? Elige tus géneros favoritos
            </h2>
            <p className="text-gray-200 text-xs sm:text-sm mt-2 font-medium max-w-sm sm:max-w-md opacity-95 drop-shadow">
              {!isAuthenticated ? 'Inicia sesión para configurar tu perfil y armar tu cartelera perfecta.' : 'Personaliza tu sección "Para Ti" en segundos.'}
            </p>
          </div>
        </div>

        {/* Alquiler de Salas */}
        <div 
          className={`absolute inset-0 w-full h-full flex flex-col justify-center px-6 sm:px-12 md:px-16 transition-all duration-1000 ease-in-out cursor-pointer ${
            currentBanner === 1 ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
          }`}
          onClick={handleRoomsBannerClick}
        >
          <img 
            src={roomRentImg} 
            alt="Alquiler de salas Cineflix" 
            className="absolute inset-0 w-full h-full object-cover object-[85%_0%] pointer-events-none opacity-95 transition-transform duration-700 group-hover:scale-[1.01]"
          />
          
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 sm:via-slate-950/50 to-transparent z-0" />
          
          <div className="relative z-10 max-w-[80%] sm:max-w-md md:max-w-lg lg:max-w-xl transition-transform duration-500 group-hover:translate-x-1">
            <span className="text-cyan-400 uppercase tracking-widest text-[10px] sm:text-xs font-black mb-1 sm:mb-2 block">
              Experiencias exclusivas Cineflix
            </span>
            <h2 className="text-white text-xl sm:text-2xl md:text-4xl font-black uppercase leading-tight tracking-wide drop-shadow-md">
              Alquila tu propia sala de cine
            </h2>
            <p className="text-gray-200 text-xs sm:text-sm mt-2 font-medium max-w-xs sm:max-w-sm md:max-w-md opacity-95 drop-shadow">
              Disfruta de funciones privadas con tus amigos o eventos corporativos con la mejor tecnología y comodidad.
            </p>
          </div>
        </div>

        {/* Indicadores de posición */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2.5 z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); setCurrentBanner(0); }} 
            className={`h-2 rounded-full transition-all duration-300 ${currentBanner === 0 ? 'bg-amber-400 w-6' : 'bg-white/30 w-2 hover:bg-white/50'}`}
            aria-label="Ir al banner 1"
          />
          <button 
            onClick={(e) => { e.stopPropagation(); setCurrentBanner(1); }} 
            className={`h-2 rounded-full transition-all duration-300 ${currentBanner === 1 ? 'bg-cyan-400 w-6' : 'bg-white/30 w-2 hover:bg-white/50'}`}
            aria-label="Ir al banner 2"
          />
        </div>
      </div>
    );
  }

  // VERSION 2: Logueado y con géneros (Sección "Para ti")
  return (
    <div className="space-y-4 my-6 font-montserrat">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
        <h2 className="text-xl font-black text-white uppercase tracking-wide border-l-4 border-amber-500 pl-3">
          Para ti
        </h2>
        <span className="text-xs text-gray-400 italic font-medium">
          Basado en tus géneros: {genres.map(g => g.description || g.name).join(', ')}
        </span>
      </div>

      {recommendedMovies.length === 0 ? (
        <p className="text-gray-400 text-sm italic py-4">
          No hay películas disponibles que coincidan con tus géneros preferidos en este momento.
        </p>
      ) : (
        <div className="flex gap-4 sm:gap-6 pb-4 overflow-x-auto hide-scrollbar scroll-smooth w-full">
          {recommendedMovies.map((movie, index) => (
            <div
              key={`foru-movie-${movie.id}-${index}`} 
              className="
                movie-carousel-card
                flex-shrink-0
                w-[calc((100%-16px)/2)]
                sm:w-[calc((100%-32px)/3)]
                md:w-[calc((100%-48px)/4)]
                lg:w-[calc((100%-80px)/5)]
                min-w-[140px] sm:min-w-[180px]
              "
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}