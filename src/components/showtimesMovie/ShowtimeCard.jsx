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

  // Helper para asignar estilos dinámicos y llamativos según el tipo de proyección
  const getProjectionBadgeStyles = (description) => {
    if (!description) return 'bg-white/5 text-gray-300 border-white/10'
    
    const desc = description.toLowerCase()
    
    if (desc.includes('imax')) {
      return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30 font-black tracking-widest'
    }
    if (desc.includes('4dx') || desc.includes('4d')) {
      return 'bg-orange-500/15 text-orange-400 border-orange-500/30 font-extrabold'
    }
    if (desc.includes('3d')) {
      return 'bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30 font-bold'
    }
    if (desc.includes('vip') || desc.includes('premium')) {
      return 'bg-amber-500/20 text-[#f4b400] border-amber-500/40 font-bold'
    }
    
    // Por defecto para 2D o regular
    return 'bg-blue-500/10 text-blue-400 border-blue-500/20 font-semibold'
  }

  return (
    <>
      <div
        onClick={handleClick}
        className={`border rounded-xl p-4 transition-all duration-300 flex flex-col justify-between h-full ${
          isPassed
            ? 'bg-black/20 border-white/5 opacity-40 cursor-not-allowed select-none'
            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#7B1A82]/50 hover:shadow-lg hover:shadow-[#7B1A82]/10 cursor-pointer'
        }`}
      >
        <div>
          {/* Fila Superior: Hora + Alerta de Caducado */}
          <div className="flex justify-between items-center mb-2">
            <p className={`text-2xl font-black tracking-tight ${isPassed ? 'text-gray-500 line-through' : 'text-[#f4b400]'}`}>
              {formatHour(showtime.booking?.start_time)}
            </p>

            {isPassed && (
              <span className="text-[9px] bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-md uppercase font-bold tracking-wider">
                Pasada
              </span>
            )}
          </div>

          {/* Sala */}
          <p className="text-gray-300 text-xs">
            Sala: <span className="font-bold text-white text-sm">{showtime.booking?.room?.name || 'N/A'}</span>
          </p>
        </div>

        {/* Fila Inferior: Contenedor de Badges Técnicos */}
        <div className="mt-4 flex flex-wrap gap-2 items-center">
          {/* Badge de Proyección (¡El cambio principal!) */}
          {showtime.projection_type?.description && (
            <span className={`text-[10px] uppercase px-2.5 py-0.5 rounded-md border tracking-wide whitespace-nowrap shadow-sm ${getProjectionBadgeStyles(showtime.projection_type.description)}`}>
              {showtime.projection_type.description}
            </span>
          )}

          {/* Badge de Idioma */}
          {showtime.language?.description && (
            <span className="text-[10px] uppercase px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-400 font-medium whitespace-nowrap">
              {showtime.language.description}
            </span>
          )}
        </div>
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