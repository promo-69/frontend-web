import ShowtimeCard from './ShowtimeCard'

export default function ShowtimesList({ showtimes = [], movieId }) {
  if (!showtimes.length) {
    return (
      <p className="text-gray-400 mt-10">
        No hay funciones disponibles para esta película.
      </p>
    )
  }

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-bold mb-6">Funciones disponibles</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {showtimes.map((s) => (
          <ShowtimeCard key={s.id} showtime={s} movieId={movieId} />
        ))}
      </div>
    </section>
  )
}
