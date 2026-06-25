import React, { useEffect, useState, useMemo } from 'react'
import { FiSliders, FiCalendar } from 'react-icons/fi'
import Footer from '../../../components/ui/Footer'
import MovieCard from '../../../components/movies/MovieCard' 
import { getMoviesByGenres, getMoviesGenres } from '../../../services/movies.service'
import MyGenresModal from '../../../components/home/MyGenresModal.jsx' 

export default function MyGenres() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Estado de control para el modal de configuración de preferencias
  const [showGenresModal, setShowGenresModal] = useState(false)

  // Función para cargar las películas filtradas por los géneros seleccionados por el usuario
  const loadMoviesByGenres = async () => {
    try {
      setLoading(true)
      const favoriteGenres = await getMoviesGenres()
      
      if (favoriteGenres && favoriteGenres.length > 0) {
        const ids = favoriteGenres.map(genre => genre.id)
        const dataPayload = await getMoviesByGenres(ids)
        setMovies(dataPayload || [])
      } else {
        setMovies([])
      }
    } catch (error) {
      console.error('❌ Error al cargar el listado de películas por género:', error)
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    loadMoviesByGenres()
  }, [])

  // Mantiene la consistencia ordenando cronológicamente de la fecha más cercana a la más lejana
  const sortedMovies = useMemo(() => {
    return [...movies].sort((a, b) => {
      const dateA = new Date(a.release_date || '9999-12-31')
      const dateB = new Date(b.release_date || '9999-12-31')
      return dateA - dateB
    })
  }, [movies])

  // Formateador de fecha optimizado para la marca Cineflix
  const formatDate = (dateString) => {
    if (!dateString) return 'Por anunciar'
    const [year, month, day] = dateString.split('-')
    if (!year || !month || !day) return 'Por anunciar'
    
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('es-VE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).replace('.', '')
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#2A154B] via-[#7B1A82] to-[#231640] text-white justify-between font-['Montserrat'] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-[80px] animate-pulse" />
        <div className="flex-grow flex items-center justify-center relative z-10">
          <p className="text-sm font-bold tracking-widest uppercase animate-pulse text-gray-300">
            Buscando películas ideales para ti...
          </p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#2A154B] via-[#7B1A82] to-[#231640] text-white justify-between font-['Montserrat'] relative overflow-hidden">
      
      {/* Fondos ambientales sutiles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-5%] w-[40vw] h-[40vw] bg-white/[0.01] rounded-full blur-[140px] pointer-events-none" />

      <section className={`px-4 md:px-8 lg:px-16 w-full flex-grow flex flex-col relative z-10 ${sortedMovies.length === 0 ? 'py-12' : 'py-16'}`}>
        <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col">
          
          {/* SECCIÓN CABECERA */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/5 pb-6 mb-10 gap-6">
            <div className="border-l-4 border-yellow-500 pl-4 text-left">
              <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-none">
                Recomendaciones <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">Por Género</span>
              </h3>
              <p className="text-xs md:text-sm text-gray-400 mt-3 tracking-wide font-medium max-w-xl leading-relaxed">
                Explora el catálogo de películas seleccionadas minuciosamente basándonos en tus preferencias y géneros cinematográficos favoritos.
              </p>
            </div>

            {/* CONTROLES: Únicamente el botón principal de la marca */}
            <div className="flex items-center self-start lg:self-end">
              <button
                onClick={() => setShowGenresModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-[#231640] text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-yellow-500/10 active:scale-95"
              >
                <FiSliders className="text-sm stroke-[3]" /> Ajustar mis géneros
              </button>
            </div>
          </div>

          {/* RENDERIZADO DE CARDS EN CUADRÍCULA */}
          {sortedMovies.length === 0 ? (
            <div className="flex-grow flex items-center justify-center my-auto pb-12">
              <p className="text-gray-400 text-base md:text-lg font-medium tracking-wide bg-white/5 px-6 py-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                No se encontraron películas que coincidan con tus géneros configurados actualmente.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {sortedMovies.map((movie, index) => {
                const isSpecialEvent = movie.type === 'special_event' || !!movie.event

                return (
                  <div 
                    key={movie.id || `genre-movie-${index}`} 
                    className="relative flex flex-col group gap-3 text-left"
                  >
                    {/* Contenedor visual de la MovieCard */}
                    <div className="relative rounded-2xl transition-all duration-300 hover:translate-y-[-4px]">
                      <MovieCard 
                        movie={{
                          ...movie,
                          isEvent: isSpecialEvent,
                          genres: movie.genres || [] 
                        }}
                        upcoming={true}
                      />
                    </div>

                    {/* ETIQUETA EXTERNA DE LA FECHA DE ESTRENO */}
                    <div className="mt-1 pl-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-sm">
                        <FiCalendar className="text-xs" />
                        Estreno: {formatDate(movie.release_date)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </section>

      <Footer />

      {/* MODAL DECLARATIVO DE GÉNEROS */}
      {showGenresModal && (
        <MyGenresModal
          open={showGenresModal}
          onClose={(updated) => {
            setShowGenresModal(false)
            if (updated) loadMoviesByGenres() // Recarga el catálogo si el usuario guardó cambios en el modal
          }}
        />
      )}
    </div>
  )
}