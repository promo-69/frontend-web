import React, { useEffect, useState } from 'react'
import { FiX, FiCheck, FiFilm } from 'react-icons/fi'
import { 
  getAvailableGenres, 
  getMoviesGenres, 
  addFavoriteGenres, 
  removeFavoriteGenres 
} from '../../services/movies.service'

export default function MyGenresModal({ open, onClose }) {
  const [catalogGenres, setCatalogGenres] = useState([])
  const [selectedIds, setSelectedIds] = useState([])
  const [initialFavoriteIds, setInitialFavoriteIds] = useState([])
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Carga inicial de datos combinados
  useEffect(() => {
    if (!open) return

    async function fetchGenresData() {
      try {
        setLoading(true)
        // Ejecutamos ambas consultas en paralelo para optimizar tiempos de respuesta
        const [allGenres, userFavorites] = await Promise.all([
          getAvailableGenres(),
          getMoviesGenres()
        ])

        setCatalogGenres(allGenres)
        
        // Mapeamos los IDs favoritos actuales del usuario
        const favoriteIds = userFavorites.map(g => g.id)
        setSelectedIds(favoriteIds)
        setInitialFavoriteIds(favoriteIds) // Mantiene referencia del estado inicial de la BD
      } catch (error) {
        console.error('❌ Error al sincronizar el catálogo de géneros:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGenresData()
  }, [open])

  if (!open) return null

  // Alternar selección de un género individual en el modal
  const handleToggleGenre = (genreId) => {
    setSelectedIds(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId) 
        : [...prev, genreId]
    )
  }

  // Guardar cambios ejecutando los diferenciales requeridos
  const handleSaveChanges = async () => {
    setSaving(true)
    try {
      // 1. Encontrar qué IDs se añadieron de nuevo
      const genresToAdd = selectedIds.filter(id => !initialFavoriteIds.includes(id))
      
      // 2. Encontrar qué IDs se removieron
      const genresToRemove = initialFavoriteIds.filter(id => !selectedIds.includes(id))

      // 3. Ejecutar las peticiones solo si hay cambios que procesar
      const apiCalls = []
      if (genresToAdd.length > 0) apiCalls.push(addFavoriteGenres(genresToAdd))
      if (genresToRemove.length > 0) apiCalls.push(removeFavoriteGenres(genresToRemove))

      if (apiCalls.length > 0) {
        await Promise.all(apiCalls)
      }

      // Notificamos al componente padre (MyGenres) que hubo éxito para que refresque su parrilla
      onClose(true)
    } catch (error) {
      console.error('Error al actualizar tus géneros de preferencia:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-['Montserrat']">
      
      {/* Fondo Traslúcido de desenfoque */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => !saving && onClose(false)}
      />

      {/* Contenedor Principal del Modal */}
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-[#2A154B] to-[#1c1035] border border-white/10 rounded-2xl shadow-2xl text-white overflow-hidden z-10 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Encabezado fijo */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg">
              <FiFilm className="text-lg" />
            </div>
            <div className="text-left">
              <h4 className="text-lg font-black uppercase tracking-wide text-white">
                Mis Preferencias
              </h4>
              <p className="text-xs text-gray-400 font-medium">
                Selecciona tus géneros favoritos para personalizar tu cartelera Cineflix
              </p>
            </div>
          </div>
          
          <button
            onClick={() => onClose(false)}
            disabled={saving}
            className="text-gray-400 hover:text-white p-1 bg-white/5 hover:bg-white/10 rounded-xl transition-all disabled:opacity-30"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Cuerpo del Modal (Scrolleable) */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow min-h-[200px]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#1c1035]/50 backdrop-blur-xs">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500" />
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">
                Sincronizando catálogo...
              </p>
            </div>
          ) : catalogGenres.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-gray-400 italic">
                No se pudieron recuperar los géneros disponibles en este momento.
              </p>
            </div>
          ) : (
            /* Cuadrícula interactiva de selección */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {catalogGenres.map((genre) => {
                const isSelected = selectedIds.includes(genre.id)
                return (
                  <div
                    key={`modal-genre-${genre.id}`}
                    onClick={() => handleToggleGenre(genre.id)}
                    className={`group relative flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all duration-200 select-none ${
                      isSelected
                        ? 'bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.15)] text-white'
                        : 'bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:border-white/10 hover:text-white'
                    }`}
                  >
                    <span className="text-sm font-bold tracking-wide">
                      {genre.description}
                    </span>
                    
                    {/* Indicador de selección */}
                    <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all duration-200 ${
                      isSelected
                        ? 'bg-yellow-500 border-yellow-400 text-[#231640]'
                        : 'border-white/20 bg-black/20 group-hover:border-white/40'
                    }`}>
                      {isSelected && <FiCheck className="text-xs stroke-[4]" />}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Barra de Acciones Fija (Footer del Modal) */}
        <div className="px-6 py-4 bg-black/20 border-t border-white/5 flex items-center justify-between gap-4">
          <span className="text-xs font-semibold text-gray-400">
            {selectedIds.length} {selectedIds.length === 1 ? 'género seleccionado' : 'géneros seleccionados'}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onClose(false)}
              disabled={saving}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all disabled:opacity-40"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={loading || saving}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 disabled:from-gray-700 disabled:to-gray-800 disabled:text-gray-500 text-[#231640] text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-yellow-500/5 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="h-3 w-3 border-2 border-[#231640] border-b-transparent rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar preferencias'
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}