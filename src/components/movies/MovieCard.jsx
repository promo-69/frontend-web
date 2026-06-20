import { Link } from 'react-router-dom'

const convertToSlug = (title) => {
  if (!title) return ''
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-z0-9\s-]/g, "")    
    .replace(/\s+/g, "-")           
    .trim()
}

export default function MovieCard({ movie, upcoming = false }) {
  if (!movie) return null

  // 💡 SOLUCIÓN: Si el objeto híbrido de la cartelera es un evento, 
  // redirigimos a la ruta de eventos, de lo contrario a la de películas.
  const routePrefix = movie.isEvent ? 'events' : 'movies'
  const movieUrl = `/${routePrefix}/${movie.id}-${convertToSlug(movie.title)}`

  return (
    <Link
      to={movieUrl}
      className="flex flex-col group cursor-pointer text-left block"
    >
      {/* Contenedor del Póster */}
      <div className="aspect-[2/3] w-full bg-white/5 rounded-2xl border border-white/10 shadow-lg overflow-hidden relative group-hover:border-[#f4b400]/50 transition-all duration-300">
        <img
          src={movie.posterUrl || movie.poster_url} // Soporte para camelCase y snake_case
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Overlay al hacer Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <span className="font-bold text-xs px-2 py-1.5 rounded-xl w-full text-center shadow-md bg-white text-[#231640]">
            {upcoming ? 'Próximamente' : 'Ver Detalles'}
          </span>
        </div>
      </div>

      {/* Información de la Película / Evento */}
      <div className="mt-3">
        <h4 className="text-white text-sm font-bold group-hover:text-[#f4b400] transition-colors line-clamp-1">
          {movie.title}
        </h4>

        {upcoming ? (
          <p className="text-[11px] text-[#f4b400] mt-1">
            Estreno: {movie.release_date?.split('-')?.reverse()?.join('/')}
          </p>
        ) : (
          <p className="text-[11px] text-gray-400 mt-1">
            {/* Si es evento mostramos la etiqueta correspondiente, si no, la clasificación */}
            {movie.isEvent 
              ? '⭐ Evento Especial' 
              : (movie.ageClassification?.description || movie.age_classification?.description || 'Apto para todo público')}
          </p>
        )}
      </div>
    </Link>
  )
}