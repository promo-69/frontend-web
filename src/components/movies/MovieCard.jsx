import React, { useState } from 'react';
import { Link } from 'react-router-dom';

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

export default function MovieCard({ movie, upcoming = false, isEventsPage = false }) {
  const [imageError, setImageError] = useState(false);

  if (!movie) return null;

  const imageSource = movie.poster_url || movie.image || movie.posterUrl;
  
  const routePrefix = isEventsPage || movie.isEvent ? 'events' : 'movies';
  const movieUrl = `/${routePrefix}/${movie.id}-${convertToSlug(movie.title)}`;
 
  return (
    <Link
      to={movieUrl}
      className="flex flex-col group cursor-pointer text-left block movie-carousel-card"
    >
      {/* Contenedor del Póster */}
      <div className="aspect-[2/3] w-full bg-white/[0.02] rounded-2xl border border-white/5 overflow-hidden relative transition-all duration-500 backdrop-blur-sm group-hover:border-amber-500/50">
        
        {imageSource && !imageError ? (
          <img
            src={imageSource}
            alt={movie.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
            loading="lazy"
          />
        ) : (
          /* FALLBACK DECLARATIVO DE REACT */
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#1b1032] text-gray-500 p-4">
            <span className="text-3xl mb-2">{isEventsPage || movie.isEvent ? '🗓️' : '🎬'}</span>
            <span className="text-[11px] uppercase tracking-wider font-bold text-center px-2">
              Sin Imagen Disponible
            </span>
          </div>
        )}

        {/* Overlay al hacer Hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6 px-4 z-20">
          <span className="w-full py-2 bg-white text-black text-center font-bold text-xs rounded-xl shadow-md transition-all uppercase tracking-widest transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
            {upcoming ? 'Próximamente' : 'Ver Detalles'}
          </span>
        </div>
      </div>

      {/* Información de la Película / Evento */}
      <div className="mt-3 text-left space-y-1.5 px-0.5">
        <h4 className="text-sm font-bold text-white tracking-wide group-hover:text-amber-400 line-clamp-1 transition-colors duration-300">
          {movie.title}
        </h4>

        <div className="flex flex-wrap gap-1.5 items-center">
          {/* Mapeo dinámico de géneros o categorías del evento si existen */}
          {movie.genres && movie.genres.map((g) => (
            <span 
              key={g.id} 
              className="px-2 py-0.5 bg-purple-600/20 border border-purple-500/40 rounded-md text-[9px] text-purple-300 font-extrabold tracking-wider uppercase shadow-[0_2px_6px_rgba(168,85,247,0.15)]"
            >
              {g._Genres?.description || g.description}
            </span>
          ))}

          {/* ETIQUETA INFERIOR */}
          {isEventsPage || movie.isEvent ? (
            <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/40 rounded-md text-[9px] text-amber-400 font-extrabold tracking-wider uppercase shadow-[0_2px_6px_rgba(245,158,11,0.15)]">
              ⭐ Evento Especial
            </span>
          ) : (
            <span className="text-[11px] text-gray-400 mt-1">
              {movie.ageClassification?.description || movie.age_classification?.description || 'Apto para todo público'}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}