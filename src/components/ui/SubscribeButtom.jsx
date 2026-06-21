import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { subscribeToMovie, unsubscribeFromMovie } from '../../services/subscription.service'

export default function SubscribeButton({ movieId, initialIsSubscribed = false, onAuthRequired, onSuccess }) {
  const { isAuthenticated } = useAuth()
  
  const [isSubscribed, setIsSubscribed] = useState(initialIsSubscribed)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setIsSubscribed(initialIsSubscribed)
  }, [initialIsSubscribed])

  const handleToggle = async () => {
    if (!isAuthenticated) {
      onAuthRequired() // Llama al modal declarativo del padre
      return
    }

    setLoading(true)
    try {
      if (isSubscribed) {
        await unsubscribeFromMovie(movieId)
        setIsSubscribed(false)
        onSuccess('Suscripción removida correctamente.')
      } else {
        await subscribeToMovie(movieId)
        setIsSubscribed(true)
        onSuccess('¡Te has suscrito con éxito! Te avisaremos el día del estreno.')
      }
    } catch (error) {
      console.error("Error al procesar la acción de suscripción:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm md:text-base font-bold shadow-lg transition-all transform hover:scale-[1.01] active:scale-95 w-full sm:w-auto text-white ${
        isSubscribed 
          ? 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 border border-emerald-500/30'
          : 'bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 border border-fuchsia-500/30'
      }`}
    >
      {loading ? (
        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
      ) : isSubscribed ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.14-.094l3.741-5.234Z" clipRule="evenodd" />
          </svg>
          ¡Suscrito para el Estreno!
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M5.85 3.5a.75.75 0 0 0-1.117-1A9.719 9.719 0 0 0 2.25 9.25a.75.75 0 0 0 1.5 0c0-1.996.643-3.842 1.735-5.343ZM19.267 2.5a.75.75 0 1 0-1.118 1a8.22 8.22 0 0 1 1.735 5.343.75.75 0 0 0 1.5 0 9.719 9.719 0 0 0-2.117-6.743ZM12 1.5a.75.75 0 0 0-.75.75v1.5a.75.75 0 0 0 1.5 0v-1.5A.75.75 0 0 0 12 1.5ZM4.331 18.232a.75.75 0 0 0-.832 1.25A11.936 11.936 0 0 0 12 22.5a11.936 11.936 0 0 0 8.501-3.018.75.75 0 0 0-.832-1.25A10.436 10.436 0 0 1 12 21a10.436 10.436 0 0 1-7.669-2.768Z" />
            <path fillRule="evenodd" d="M12 4a6 6 0 0 0-6 6v3.586l-.707.707A1 1 0 0 0 6 16h12a1 1 0 0 0 .707-1.707L18 13.586V10a6 6 0 0 0-6-6Zm0 14a3 3 0 0 1-2.83-2h5.66A3 3 0 0 1 12 18Z" clipRule="evenodd" />
          </svg>
          Avisarme cuando estrene
        </>
      )}
    </button>
  )
}