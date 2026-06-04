import MovieCard from '../../components/movies/MovieCard'

export default function HomeReleases({ movies = [] }) {
  if (!movies.length) return null

  return (
    <section className="mb-12 md:mb-20 text-center">
        <h3 className="text-[#f4b400] text-3xl md:text-4xl font-extrabold uppercase tracking-tight">
          CARTELERA
        </h3>
      

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  )
}
