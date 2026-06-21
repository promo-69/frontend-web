import React, { useEffect, useState, useMemo } from 'react'
import { FiTrash2, FiCheckSquare, FiSquare, FiCalendar } from 'react-icons/fi'
import Footer from '../../../components/ui/Footer'
import MovieCard from '../../../components/movies/MovieCard' 
import QuestionModal from '../../../components/ui/QuestionModal'
import SuccessModal from '../../../components/ui/SuccessModal'
import { getMovieSubscriptions, unsubscribeFromMoviesBatch } from '../../../services/subscription.service'

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Estados para la selección en lote (Almacena IDs de películas)
  const [isBatchMode, setIsBatchMode] = useState(false)
  const [selectedSubIds, setSelectedSubIds] = useState([]) 
  const [isDeleting, setIsDeleting] = useState(false)

  // Estados de control para Modales Declarativos
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [successModalMessage, setSuccessModalMessage] = useState('')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })

    async function loadSubscriptions() {
      try {
        const response = await getMovieSubscriptions()
        const dataPayload = response?.data || response || []
        setSubscriptions(dataPayload)
      } catch (error) {
        console.error('❌ Error al cargar el listado de películas suscritas:', error)
        setSubscriptions([])
      } finally {
        setLoading(false)
      }
    }

    loadSubscriptions()
  }, [])

  // Ordena de la fecha más cercana a la más lejana (Presente -> Futuro)
  const sortedSubscriptions = useMemo(() => {
    return [...subscriptions].sort((a, b) => {
      const dateA = new Date(a._Movies?.release_date || '9999-12-31')
      const dateB = new Date(b._Movies?.release_date || '9999-12-31')
      return dateA - dateB
    })
  }, [subscriptions])

  // Lógica para seleccionar/deseleccionar una suscripción individual usando el ID de la película
  const handleToggleSelect = (movieId) => {
    setSelectedSubIds((prev) =>
      prev.includes(movieId)
        ? prev.filter((id) => id !== movieId)
        : [...prev, movieId]
    )
  }

  // Seleccionar o deseleccionar todas las películas disponibles mapeando sus IDs correctamente
  const handleToggleSelectAll = () => {
    const validMovieIds = sortedSubscriptions.map(sub => sub._Movies?.id).filter(Boolean)
    if (selectedSubIds.length === validMovieIds.length) {
      setSelectedSubIds([])
    } else {
      setSelectedSubIds(validMovieIds)
    }
  }

  // Cancelar el modo lote y limpiar selecciones
  const handleCancelBatchMode = () => {
    setIsBatchMode(false)
    setSelectedSubIds([])
  }

  // Formateador de fecha
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

  // Eliminación en lote hacia el backend
  const handleConfirmDeleteBatch = async () => {
    setShowConfirmModal(false)
    setIsDeleting(true)
    try {
      const res = await unsubscribeFromMoviesBatch(selectedSubIds)
      if (res?.success || res) {
        setSubscriptions((prev) => 
          prev.filter((sub) => !selectedSubIds.includes(sub._Movies?.id))
        )
        setSuccessModalMessage('Suscripciones removidas correctamente.')
        handleCancelBatchMode()
      }
    } catch (error) {
      console.error('Error al eliminar las suscripciones en lote:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#231640] text-white justify-between font-['Montserrat'] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-[80px] animate-pulse" />
        <div className="flex-grow flex items-center justify-center relative z-10">
          <p className="text-sm font-bold tracking-widest uppercase animate-pulse text-gray-300">
            Cargando tus suscripciones...
          </p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#231640] text-white justify-between font-['Montserrat'] relative overflow-hidden">
      
      {/* Fondos ambientales sutiles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-5%] w-[40vw] h-[40vw] bg-white/[0.01] rounded-full blur-[140px] pointer-events-none" />

      <section className={`px-4 md:px-8 lg:px-16 w-full flex-grow flex flex-col relative z-10 ${sortedSubscriptions.length === 0 ? 'py-12' : 'py-16'}`}>
        <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col">
          
          {/* SECCIÓN CABECERA */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/5 pb-6 mb-10 gap-6">
            <div className="border-l-4 border-yellow-500 pl-4 text-left">
              <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-none">
                Mis Películas <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">Suscritas</span>
              </h3>
              <p className="text-xs md:text-sm text-gray-400 mt-3 tracking-wide font-medium max-w-xl leading-relaxed">
                Aquí puedes observar y gestionar todos los próximos estrenos a los que te has suscrito para recibir notificaciones personalizadas.
              </p>
            </div>

            {/* BOTONES DE CONTROL DE LOTE */}
            {sortedSubscriptions.length > 0 && (
              <div className="flex items-center gap-3 self-start lg:self-end">
                {!isBatchMode ? (
                  <button
                    onClick={() => setIsBatchMode(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                  >
                    Seleccionar en lote
                  </button>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleToggleSelectAll}
                      className="flex items-center gap-1.5 px-3 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-purple-600/30 transition-all"
                    >
                      {selectedSubIds.length === sortedSubscriptions.map(sub => sub._Movies?.id).filter(Boolean).length ? <FiCheckSquare /> : <FiSquare />}
                      {selectedSubIds.length === sortedSubscriptions.map(sub => sub._Movies?.id).filter(Boolean).length ? 'Deseleccionar Todo' : 'Seleccionar Todo'}
                    </button>
                    <button
                      onClick={() => setShowConfirmModal(true)}
                      disabled={selectedSubIds.length === 0 || isDeleting}
                      className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                        selectedSubIds.length === 0
                          ? 'bg-red-500/10 border border-red-500/20 text-red-500/40 cursor-not-allowed'
                          : 'bg-red-600 border border-red-500 text-white hover:bg-red-500 shadow-[0_4px_12px_rgba(239,68,68,0.2)]'
                      }`}
                    >
                      <FiTrash2 /> Eliminar ({selectedSubIds.length})
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

          {/* RENDERIZADO DE CARDS EN CUADRÍCULA */}
          {sortedSubscriptions.length === 0 ? (
            <div className="flex-grow flex items-center justify-center my-auto pb-12">
              <p className="text-gray-400 text-base md:text-lg font-medium tracking-wide bg-white/5 px-6 py-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                Aún no tienes suscripciones activas a ningún estreno.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {sortedSubscriptions.map((sub, index) => {
                const movieData = sub._Movies
                if (!movieData) return null

                const isSpecialEvent = movieData.type === 'special_event' || !!movieData.event
                const isSelected = selectedSubIds.includes(movieData.id)

                return (
                  <div 
                    key={sub.id || `${movieData.id}-${index}`} 
                    className="relative flex flex-col group gap-3 text-left"
                  >
                    {/* Contenedor de la Card con disparador de click */}
                    <div
                      onClick={() => {
                        if (isBatchMode) handleToggleSelect(movieData.id)
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
                      {/* Capa invisible absoluta (z-30) para forzar que el clic se capture en toda el área */}
                      {isBatchMode && (
                        <div className="absolute inset-0 z-30 bg-transparent rounded-2xl" />
                      )}

                      {/* Checkbox Overlay posicionado sobre la capa totalizadora (z-40) */}
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
                            ...movieData,
                            isEvent: isSpecialEvent,
                            genres: [] 
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
                        if (isBatchMode) handleToggleSelect(movieData.id)
                      }}
                    >
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-sm">
                        <FiCalendar className="text-xs" />
                        Estreno: {formatDate(movieData.release_date)}
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

      {/* MODAL DE CONFIRMACIÓN */}
      {showConfirmModal && (
        <QuestionModal
          title="¿Remover Suscripciones?"
          message={`¿Estás seguro de que deseas eliminar las ${selectedSubIds.length} suscripciones seleccionadas? Dejarás de recibir alertas sobre sus estrenos.`}
          confirmText="Sí, Eliminar"
          cancelText="Cancelar"
          onCancel={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmDeleteBatch}
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
