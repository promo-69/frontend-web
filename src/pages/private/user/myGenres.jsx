import React, { useEffect, useState, useMemo } from 'react'
import { FiSliders, FiCheckSquare, FiSquare, FiCalendar, FiPlusCircle } from 'react-icons/fi'
import Footer from '../../../components/ui/Footer'
import MovieCard from '../../../components/movies/MovieCard' 
import QuestionModal from '../../../components/ui/QuestionModal'
import SuccessModal from '../../../components/ui/SuccessModal'
import { getMoviesByGenres, getMoviesGenres } from '../../../services/movies.service'
import MyGenresModal from '../../../components/home/MyGenresModal.jsx' 

export default function MyGenres() {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Estados para la selección en lote (Almacena IDs de películas para acciones masivas)
  const [isBatchMode, setIsBatchMode] = useState(false)
  const [selectedMovieIds, setSelectedMovieIds] = useState([]) 
  const [isProcessingBatch, setIsProcessingBatch] = useState(false)

  // Estados de control para Modales Declarativos
  const [showGenresModal, setShowGenresModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [successModalMessage, setSuccessModalMessage] = useState('')

  // Función para cargar los datos desde el servicio
  const loadMoviesByGenres = async () => {
    try {
      setLoading(true)
      
      const favoriteGenres = await getMoviesGenres()
      
      if (favoriteGenres && favoriteGenres.length > 0) {
        const ids = favoriteGenres.map(genre => genre.id)
        
        const dataPayload = await getMoviesByGenres(ids)
        setMovies(dataPayload)
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

  // Mantiene la consistencia ordenando de la fecha de estreno más cercana a la más lejana
  const sortedMovies = useMemo(() => {
    return [...movies].sort((a, b) => {
      const dateA = new Date(a.release_date || '9999-12-31')
      const dateB = new Date(b.release_date || '9999-12-31')
      return dateA - dateB
    })
  }, [movies])

  // Lógica para seleccionar/deseleccionar una película individual en modo lote
  const handleToggleSelect = (movieId) => {
    setSelectedMovieIds((prev) =>
      prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId]
    )
  }

  // Seleccionar o deseleccionar todas las películas disponibles en la cuadrícula
  const handleToggleSelectAll = () => {
    const validMovieIds = sortedMovies.map(movie => movie.id).filter(Boolean)
    if (selectedMovieIds.length === validMovieIds.length) {
      setSelectedMovieIds([])
    } else {
      setSelectedMovieIds(validMovieIds)
    }
  }

  // Cancelar el modo lote y limpiar selecciones
  const handleCancelBatchMode = () => {
    setIsBatchMode(false)
    setSelectedMovieIds([])
  }

  // Formateador de fecha optimizado
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

  // Acción en lote simulada/adaptada (ej: Suscribirse o guardar en lote)
  const handleConfirmBatchAction = async () => {
    setShowConfirmModal(false)
    setIsProcessingBatch(true)
    try {
      // Aquí puedes mapear una llamada al backend si David implementa un endpoint de suscripción masiva
      setSuccessModalMessage(`Se han procesado correctamente las ${selectedMovieIds.length} películas seleccionadas.`);
      handleCancelBatchMode();
    } catch (error) {
      console.error('Error al procesar la acción en lote:', error)
    } finally {
      setIsProcessingBatch(false)
    }
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
      
      {/* Fondos ambientales sutiles de la marca Cineflix */}
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

            {/* BOTONES DE CONTROL Y PANEL DE CONFIGURACIÓN */}
            <div className="flex items-center gap-3 self-start lg:self-end flex-wrap">
              {/* BOTÓN PRIMARIO: Configurar gustos (Abre el MyGenresModal) */}
              <button
                onClick={() => setShowGenresModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-[#231640] text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-yellow-500/10 active:scale-95"
              >
                <FiSliders className="text-sm stroke-[3]" /> Ajustar mis géneros
              </button>

              {sortedMovies.length > 0 && (
                <div className="flex items-center gap-2">
                  {!isBatchMode ? (
                    <button
                      onClick={() => setIsBatchMode(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                    >
                      Selección en lote
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={handleToggleSelectAll}
                        className="flex items-center gap-1.5 px-3 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-purple-600/30 transition-all"
                      >
                        {selectedMovieIds.length === sortedMovies.map(m => m.id).filter(Boolean).length ? <FiCheckSquare /> : <FiSquare />}
                        {selectedMovieIds.length === sortedMovies.map(m => m.id).filter(Boolean).length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                      </button>
                      <button
                        onClick={() => setShowConfirmModal(true)}
                        disabled={selectedMovieIds.length === 0 || isProcessingBatch}
                        className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                          selectedMovieIds.length === 0
                            ? 'bg-purple-500/10 border border-purple-500/20 text-purple-500/40 cursor-not-allowed'
                            : 'bg-purple-600 border border-purple-500 text-white hover:bg-purple-500 shadow-[0_4px_12px_rgba(147,51,234,0.2)]'
                        }`}
                      >
                        <FiPlusCircle /> Acciones en lote ({selectedMovieIds.length})
                      </button>
                      <button
                        onClick={handleCancelBatchMode}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              )}
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
                const isSelected = selectedMovieIds.includes(movie.id)

                return (
                  <div 
                    key={movie.id || `genre-movie-${index}`} 
                    className="relative flex flex-col group gap-3 text-left"
                  >
                    {/* Contenedor de la Card con disparador de click */}
                    <div
                      onClick={() => {
                        if (isBatchMode) handleToggleSelect(movie.id)
                      }}
                      className={`relative rounded-2xl transition-all duration-300 ${
                        isBatchMode 
                          ? 'cursor-pointer select-none active:scale-[0.98]' 
                          : 'hover:translate-y-[-4px]'
                      } ${
                        isSelected 
                          ? 'border-2 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)] bg-yellow-500/5 rounded-2xl' 
                          : ''
                      }`}
                    >
                      {/* Capa invisible absoluta para forzar el click uniforme */}
                      {isBatchMode && (
                        <div className="absolute inset-0 z-30 bg-transparent rounded-2xl" />
                      )}

                      {/* Checkbox Overlay */}
                      {isBatchMode && (
                        <div className={`absolute top-4 right-4 z-40 p-2.5 rounded-xl border backdrop-blur-md transition-all duration-200 shadow-xl ${
                          isSelected 
                            ? 'bg-yellow-500 border-yellow-400 text-[#231640]' 
                            : 'bg-[#231640]/90 border-white/20 text-gray-400'
                        }`}>
                          {isSelected ? (
                            <FiCheckSquare className="text-xl stroke-[3]" />
                          ) : (
                            <FiSquare className="text-xl stroke-[2]" />
                          )}
                        </div>
                      )}

                      {/* Componente visual de la película */}
                      <div className={`transition-opacity duration-300 ${
                        isBatchMode && !isSelected ? 'opacity-40' : 'opacity-100'
                      }`}>
                        <MovieCard 
                          movie={{
                            ...movie,
                            isEvent: isSpecialEvent,
                            genres: movie.genres || [] 
                          }}
                          upcoming={true}
                        />
                      </div>
                    </div>

                    {/* ETIQUETA EXTERNA DE LA FECHA DE ESTRENO */}
                    <div 
                      className={`mt-1 transition-opacity duration-300 pl-1 relative ${
                        isBatchMode ? 'z-40 cursor-pointer' : ''
                      } ${
                        isBatchMode && !isSelected ? 'opacity-40' : 'opacity-100'
                      }`}
                      onClick={() => {
                        if (isBatchMode) handleToggleSelect(movie.id)
                      }}
                    >
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

      {/* MODAL DECLARATIVO DE GÉNEROS (MyGenresModal) */}
      {showGenresModal && (
        <MyGenresModal
          open={showGenresModal}
          onClose={(updated) => {
            setShowGenresModal(false)
            if (updated) loadMoviesByGenres() // Recarga el catálogo si el usuario guardó cambios en el modal
          }}
        />
      )}

      {/* MODAL DE CONFIRMACIÓN EN LOTE */}
      {showConfirmModal && (
        <QuestionModal
          title="¿Procesar selección?"
          message={`¿Estás seguro de que deseas aplicar la acción masiva sobre las ${selectedMovieIds.length} películas seleccionadas?`}
          confirmText="Sí, procesar"
          cancelText="Cancelar"
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmBatchAction}
        />
      )}

      {/* MODAL DE ÉXITO */}
      {!!successModalMessage && (
        <SuccessModal 
          message={successModalMessage}
          onClose={() => setSuccessModalMessage('')} 
        />
      )}
    </div>
  )
}