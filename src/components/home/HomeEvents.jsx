import React from 'react';
import MovieCard from '../movies/MovieCard'; // Ajusta la ruta relativa si es necesario

export default function HomeEvents({ events }) {
  if (!events || events.length === 0) {
    return (
      <p className="text-gray-400 text-sm italic py-4">
        No hay eventos disponibles próximamente.
      </p>
    );
  }

  return (
    <div className="flex gap-6 pb-4">
      {events.map((event, index) => (
        <div
        key={`home-event-${event.id}-${index}`} 
        className="
              movie-carousel-card
              flex-shrink-0
              hide-scrollbar
              w-[calc((100%-96px)/5)]
              min-w-[180px]
        "
        >
          <MovieCard movie={event} />
        </div>
      ))}
    </div>
  );
}