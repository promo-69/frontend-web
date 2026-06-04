import { useNavigate } from 'react-router-dom'

export default function ShowtimeCard({ showtime, movieId }) {
  const navigate = useNavigate()

  // Formatear hora
  const formatHour = (iso) => {
    const date = new Date(iso)
    return date.toLocaleTimeString('es-VE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  return (
    <div
      onClick={() => navigate(`/selectSeats/${movieId}/${showtime.id}`)}
      className="bg-white/10 border border-white/20 rounded-xl p-4 
                 hover:bg-white/20 transition-all cursor-pointer"
    >
      {/* Hora */}
      <p className="text-xl font-bold text-[#f4b400]">
        {formatHour(showtime.start_time)}
      </p>

      {/* Sala */}
      <p className="text-white text-sm mt-1">
        Sala: <span className="font-semibold">{showtime.room?.name}</span>
      </p>

      {/* Tipo de proyección */}
      <p className="text-gray-300 text-sm">
        {showtime.projection_type?.description}
      </p>

      {/* Idioma */}
      <p className="text-gray-300 text-sm">{showtime.language?.description}</p>

      {/* Precio */}
      <p className="text-white font-bold mt-2">
        {showtime.currency?.symbol}
        {showtime.price}
      </p>
    </div>
  )
}
