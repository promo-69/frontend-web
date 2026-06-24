import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MovieCard from '../movies/MovieCard'; 
import { getMoviesByGenres } from '../../services/movies.service';

export default function ForU() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [genres, setGenres] = useState([]);
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentBanner, setCurrentBanner] = useState(0);

  // 1. Verificar autenticación y obtener géneros favoritos mediante servicios
  useEffect(() => {
    const checkAuthAndFetchGenres = async () => {
      const token = localStorage.getItem('token'); 
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }

      setIsLoggedIn(true);

      try {
        // Consumo directo de tu servicio aislado
        const userGenres = await getMoviesGenres();
        
        if (userGenres && userGenres.length > 0) {
          setGenres(userGenres);
          
          // Mapeamos los IDs de los géneros favoritos para la consulta (ej: "1,2,3")
          const genreIds = userGenres.map(g => g.id).join(',');
          
          // Buscamos películas asociadas a dichos géneros
          const moviesData = await getMoviesByGenres(genreIds);
          setRecommendedMovies(moviesData);
        } else {
          setGenres([]);
        }
      } catch (error) {
        console.error("Error al recuperar géneros o películas en ForU:", error);
        setGenres([]);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchGenres();
  }, []);

  // 2. Control del Carrusel automático para la versión publicitaria
  useEffect(() => {
    if (!loading && (genres.length === 0 || !isLoggedIn)) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev === 0 ? 1 : 0));
      }, 5000); // Cambia cada 5 segundos
      return () => clearInterval(interval);
    }
  }, [loading, genres, isLoggedIn]);

  const handleGenreBannerClick = () => {
    if (!isLoggedIn) {
      navigate('/login');
    } else {
      navigate('/seleccion-generos'); 
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

  // ==========================================
  // VERSION 1: No logueado o sin géneros (Carrusel Publicitario)
  // ==========================================
  if (!isLoggedIn || genres.length === 0) {
    return (
      <div className="w-full relative overflow-hidden rounded-xl bg-slate-900 h-56 md:h-64 shadow-lg font-montserrat my-6">
        {/* Banner 1: Selección de Géneros */}
        <div 
          className={`absolute inset-0 w-full h-full flex flex-col justify-center px-8 md:px-16 transition-opacity duration-1000 ease-in-out cursor-pointer bg-gradient-to-r from-purple-900 via-slate-950 to-transparent ${
            currentBanner === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          onClick={handleGenreBannerClick}
        >
          <span className="text-amber-400 uppercase tracking-widest text-xs font-bold mb-2">Recomendaciones personalizadas</span>
          <h2 className="text-white text-2xl md:text-4xl font-extrabold uppercase max-w-lg leading-tight">
            ¿No sabes qué ver? Elige tus géneros favoritos
          </h2>
          <p className="text-gray-300 text-sm mt-2 max-w-md">
            {!isLoggedIn ? 'Inicia sesión para configurar tu perfil.' : 'Personaliza tu sección "Para Ti" en segundos.'}
          </p>
        </div>

        {/* Banner 2: Alquiler de Salas */}
        <div 
          className={`absolute inset-0 w-full h-full flex flex-col justify-center px-8 md:px-16 transition-opacity duration-1000 ease-in-out cursor-pointer bg-gradient-to-r from-blue-950 via-slate-950 to-transparent ${
            currentBanner === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          onClick={handleRoomsBannerClick}
        >
          <span className="text-cyan-400 uppercase tracking-widest text-xs font-bold mb-2">Experiencias exclusivas Cineflix</span>
          <h2 className="text-white text-2xl md:text-4xl font-extrabold uppercase max-w-lg leading-tight">
            Alquila tu propia sala de cine
          </h2>
          <p className="text-gray-300 text-sm mt-2 max-w-md">
            Disfruta de funciones privadas con tus amigos o eventos corporativos con la mejor tecnología.
          </p>
        </div>

        {/* Indicadores de posición del carrusel */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); setCurrentBanner(0); }} 
            className={`w-3 h-3 rounded-full transition-all ${currentBanner === 0 ? 'bg-amber-400 w-6' : 'bg-gray-500'}`}
          />
          <button 
            onClick={(e) => { e.stopPropagation(); setCurrentBanner(1); }} 
            className={`w-3 h-3 rounded-full transition-all ${currentBanner === 1 ? 'bg-cyan-400 w-6' : 'bg-gray-500'}`}
          />
        </div>
      </div>
    );
  }

  // ==========================================
  // VERSION 2: Logueado y con géneros (Sección "Para ti")
  // ==========================================
  return (
    <div className="space-y-4 my-6 font-montserrat">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
        <h2 className="text-xl font-black text-white uppercase tracking-wide border-l-4 border-amber-500 pl-3">
          Para ti
        </h2>
        <span className="text-xs text-gray-400 italic">
          Basado en tus géneros: {genres.map(g => g.description).join(', ')}
        </span>
      </div>

      {recommendedMovies.length === 0 ? (
        <p className="text-gray-400 text-sm italic py-4">
          No hay películas disponibles que coincidan con tus géneros preferidos.
        </p>
      ) : (
        <div className="flex gap-6 pb-4 overflow-x-auto hide-scrollbar">
          {recommendedMovies.map((movie, index) => (
            <div
              key={`foru-movie-${movie.id}-${index}`} 
              className="
                movie-carousel-card
                flex-shrink-0
                hide-scrollbar
                w-[calc((100%-96px)/5)]
                min-w-[180px]
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