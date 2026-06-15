import EventCard from '../../components/movies/EventCard'

export default function HomeEvents({ events = [] }) {
  // Si no llegan eventos, no se renderiza el bloque interno
  if (!events.length) return null

  return (
    <div className="flex gap-6 pb-4">
      {events.map((event) => (
        <div
          key={event.id}
          className="
            movie-carousel-card
            flex-shrink-0
            hide-scrollbar
            w-[calc((100%-96px)/5)]
            min-w-[180px]
          "
        >
          <EventCard event={event} upcoming />
        </div>
      ))}
    </div>
  )
}