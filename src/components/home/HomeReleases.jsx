import MovieCard from '../../components/movies/MovieCard'
 
export default function HomeReleases({ movies = [] }) {
  if (!movies.length) return null

  return (

      <div className="flex gap-6 pb-4">
        {movies.map((movie) => (
          <div
            key={movie.id}
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
  )
}