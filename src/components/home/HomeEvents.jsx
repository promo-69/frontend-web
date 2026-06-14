import MovieCard from '../../components/movies/EventCard'

export default function HomeEvents({ events = [] }) {
  if (!events.length) return null

  return (
    <div className="flex gap-6 pb-4">
      {events.map((events) => (
        <div
          key={events.id}
          className="
            movie-carousel-card
            flex-shrink-0
            hide-scrollbar
            w-[calc((100%-96px)/5)]
            min-w-[180px]
          "
          >
          <MovieCard movie={events} upcoming />
        </div>
      ))}
    </div>
  )
}