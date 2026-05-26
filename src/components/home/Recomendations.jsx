// src/components/home/Recommendations.jsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMovies } from '../../services/movies.service'

export default function Recomendations() {
  const navigate = useNavigate()
  const [movies, setMovies] = useState([])

  useEffect(() => {
    async function load() {
      const data = await getMovies()
      setMovies(data.slice(0, 5)) // top 5
    }
    load()
  }, [])

  return (
    <section className="mb-12 md:mb-20 text-center">
      <h3 className="text-[#f4b400] text-2xl md:text-3xl font-bold mb-10">
        Recomendaciones
      </h3>

      <div className="flex justify-start md:justify-center gap-6 overflow-x-auto pb-6 scrollbar-hide">
        {movies.map((movie) => (
          <div
            key={movie.id}
            onClick={() => navigate(`/movie/${movie.id}`)}
            className="min-w-[150px] md:min-w-[200px] h-[225px] md:h-[300px] bg-white/5 rounded-2xl border border-white/10 shadow-xl hover:scale-105 transition-transform cursor-pointer flex items-center justify-center text-gray-300 font-bold"
          >
            {movie.title}
          </div>
        ))}
      </div>
    </section>
  )
}
