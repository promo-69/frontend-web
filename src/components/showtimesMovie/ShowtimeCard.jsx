import { useNavigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import ModalMessage from '../ui/ModalMessage'
import { useAuth } from '../../context/AuthContext'

export default function ShowtimeCard({ showtime, movieId }) {
  const navigate = useNavigate()
  const location = useLocation() 
  const { user } = useAuth()

  const [showLoginModal, setShowLoginModal] = useState(false)

  const showtimeDate = new Date(showtime.booking?.start_time)
  const currentDate = new Date()
  const isPassed = showtimeDate < currentDate

  const handleClick = () => {
    if (isPassed) return

    if (!user) {
      console.log('NO HAY USUARIO EN CONTEXTO, MOSTRAR MODAL')
      setShowLoginModal(true)
      return
    }

    navigate(`/selectSeats/${movieId}/${showtime.id}`)
  }

  const formatHour = (iso) => {
    const date = new Date(iso)
    return date.toLocaleTimeString('es-VE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  return (
    <>
      <div
        onClick={handleClick}
        className={`border rounded-xl p-4 transition-all ${
          isPassed
            ? 'bg-black/20 border-white/5 opacity-40 cursor-not-allowed select-none'
            : 'bg-white/10 border-white/20 hover:bg-white/20 cursor-pointer shadow-md'
        }`}
      >
        <div className="flex justify-between items-start">
          {/* Hora */}
          <p className={`text-xl font-bold ${isPassed ? 'text-gray-500 line-through' : 'text-[#f4b400]'}`}>
            {formatHour(showtime.booking?.start_time)}
          </p>

          {/* Etiqueta visual de caducado */}
          {isPassed && (
            <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
              Pasada
            </span>
          )}
        </div>

        {/* Sala */}
        <p className="text-white text-sm mt-1">
          Sala: <span className="font-semibold">{showtime.booking?.room?.name}</span>
        </p>

        {/* Tipo de proyección */}
        <p className="text-gray-300 text-sm">
          {showtime.projection_type?.description}
        </p>

        {/* Idioma */}
        <p className="text-gray-300 text-sm">
          {showtime.language?.description}
        </p>
      </div>

      {showLoginModal && (
        <ModalMessage
          type="error"
          message="Inicia sesión para comprar tus boletos"
          onClose={() => {
            setShowLoginModal(false)
            navigate('/login', {
              state: { from: location.pathname },
            })
          }}
        />
      )}
    </>
  )
}