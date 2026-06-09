export default function ShowtimeHeader({ showtime }) {
  const formatHour = (iso) =>
    new Date(iso).toLocaleTimeString('es-VE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })

  console.log("→ ShowtimeHeader recibe:", showtime)


  return (
    <div className="bg-[#2D1748]/50 border border-white/10 rounded-2xl p-6 shadow-xl">
      <h2 className="text-3xl font-bold text-[#F6AD38] mb-4">
        {showtime.movie?.title}
      </h2>

      {/* Sala */}
      <p className="text-gray-300 text-sm mb-1">
        Sala:{' '}
        <span className="font-semibold text-white">{showtime.booking?.room}</span>
      </p>

      {/* Hora */}
      <p className="text-gray-300 text-sm mb-1">
        Hora:{' '}
        <span className="font-semibold text-white">
          {formatHour(showtime.booking?.start_time)}
        </span>
      </p>

      {/* Tipo */}
      <p className="text-gray-300 text-sm mb-1">
        Tipo: {showtime.projection_type?.description || '2D Digital'}
      </p>

      {/* Idioma */}
      <p className="text-gray-300 text-sm mb-1">
        Idioma: {showtime.language?.description || 'Español'}
      </p>

      {/* Precio */}
      <p className="text-[#F6AD38] font-bold text-2xl mt-4">
        {showtime.currency?.symbol}
        {showtime.price}
      </p>
    </div>
  )
}
