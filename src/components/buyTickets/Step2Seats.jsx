import { useState, useEffect } from 'react'
import { ArrowLeft, Info } from 'lucide-react'

const ROW_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']

export default function Step2Seats({
  showtime,
  movie,
  seatMap,
  onNext,
  onBack,
}) {
  // Sincronizar el estado local cuando el mapa simulado termine de cargarse arriba
  const [seats, setSeats] = useState(seatMap)
  const [ticketsNeeded, setTicketsNeeded] = useState(1)

  useEffect(() => {
    if (seatMap && seatMap.length > 0) {
      setSeats(seatMap)
    }
  }, [seatMap])

  const selectedSeats = seats.filter((s) => s.status === 'selected')
  const canContinue = selectedSeats.length === ticketsNeeded

  const toggleSeat = (seatId) => {
    const seat = seats.find((s) => s.id === seatId)
    if (!seat || seat.status === 'sold') return

    if (seat.status === 'selected') {
      setSeats((prev) =>
        prev.map((s) => (s.id === seatId ? { ...s, status: 'available' } : s)),
      )
    } else {
      if (selectedSeats.length >= ticketsNeeded) return
      setSeats((prev) =>
        prev.map((s) => (s.id === seatId ? { ...s, status: 'selected' } : s)),
      )
    }
  }

  const resetSeats = () => {
    setSeats((prev) =>
      prev.map((s) =>
        s.status === 'selected' ? { ...s, status: 'available' } : s,
      ),
    )
  }

  const handleTicketCountChange = (val) => {
    const next = Math.max(1, Math.min(val, 8))
    setTicketsNeeded(next)
    resetSeats()
  }

  // Agrupamiento por filas
  const byRow = ROW_LABELS.reduce((acc, row) => {
    acc[row] = seats.filter((s) => s.row === row).sort((a, b) => a.col - b.col)
    return acc
  }, {})

  const cols = byRow['A']?.length || 14
  const totalPrice = ticketsNeeded * (showtime?.price || 0)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* HEADER */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#F6AD38]">
            Selección de Asientos
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            {movie?.title} · {showtime?.time || 'Horario no definido'} ·{' '}
            {showtime?.room || 'Sala General'}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[#F6AD38] font-bold text-2xl">
            ${totalPrice.toFixed(2)}
          </p>
          <p className="text-gray-400 text-xs">
            {ticketsNeeded} boleto{ticketsNeeded > 1 ? 's' : ''} × $
            {(showtime?.price || 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* CANTIDAD DE BOLETOS */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white/5 rounded-xl p-4 border border-white/10">
        <span className="text-sm text-gray-300 font-medium">
          Cantidad de boletos:
        </span>

        <div className="flex items-center gap-3 bg-[#1d1430] rounded-full px-4 py-2 border border-white/20 w-fit">
          <button
            onClick={() => handleTicketCountChange(ticketsNeeded - 1)}
            className="text-[#F6AD38] font-bold w-5 h-5 flex items-center justify-center hover:scale-110 transition-transform"
          >
            −
          </button>

          <span className="font-bold w-6 text-center text-white">
            {ticketsNeeded}
          </span>

          <button
            onClick={() => handleTicketCountChange(ticketsNeeded + 1)}
            className="text-[#F6AD38] font-bold w-5 h-5 flex items-center justify-center hover:scale-110 transition-transform"
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-blue-300">
          <Info className="w-3 h-3" />
          <span>
            Selecciona exactamente {ticketsNeeded} asiento
            {ticketsNeeded > 1 ? 's' : ''}
          </span>
        </div>

        {selectedSeats.length > 0 && (
          <button
            onClick={resetSeats}
            className="sm:ml-auto text-xs text-red-400 underline hover:text-red-300 transition-colors w-fit"
          >
            Limpiar selección
          </button>
        )}
      </div>

      {/* PANTALLA */}
      <div className="flex flex-col items-center">
        <div className="w-3/4 h-2 bg-gradient-to-b from-[#F6AD38]/60 to-transparent rounded-full mb-1" />
        <p className="text-[10px] text-[#F6AD38]/60 uppercase tracking-widest mb-6 font-bold">
          Pantalla
        </p>

        {/* GRID DE ASIENTOS */}
        <div className="overflow-x-auto w-full pb-4">
          <div className="min-w-max mx-auto px-4">
            {/* Números de columna */}
            <div className="flex gap-1 ml-8 mb-2">
              {Array.from({ length: cols }, (_, i) => (
                <span
                  key={i + 1}
                  className="w-7 text-[10px] text-center text-gray-500 font-mono font-semibold"
                >
                  {i + 1}
                </span>
              ))}
            </div>

            {/* Filas */}
            {ROW_LABELS.map((row) => (
              <div key={row} className="flex gap-1 items-center mb-1.5">
                <span className="w-7 text-xs text-[#F6AD38] font-bold text-center">
                  {row}
                </span>

                {(byRow[row] || []).map((seat) => {
                  const colors = {
                    available:
                      'bg-[#713182]/80 hover:bg-[#913a9e] cursor-pointer hover:scale-110',
                    selected:
                      'bg-[#F6AD38] cursor-pointer scale-105 shadow-md shadow-[#F6AD38]/40',
                    sold: 'bg-gray-700/60 cursor-not-allowed opacity-40',
                  }

                  return (
                    <button
                      key={seat.id}
                      onClick={() => toggleSeat(seat.id)}
                      title={`${seat.id} — ${seat.status}`}
                      className={`w-7 h-7 rounded-md transition-all duration-150 ${colors[seat.status] || colors.available}`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* LEYENDA */}
        <div className="flex gap-6 mt-4 text-[11px] items-center text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#F6AD38] rounded-sm" />
            <span>Seleccionado</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#713182]/80 rounded-sm" />
            <span>Disponible</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-700/60 rounded-sm opacity-60" />
            <span>Vendido</span>
          </div>
        </div>
      </div>

      {/* ASIENTOS SELECCIONADOS */}
      {selectedSeats.length > 0 && (
        <div className="bg-white/5 rounded-xl p-3 border border-[#F6AD38]/20">
          <p className="text-xs text-gray-400 mb-1.5">
            Asientos seleccionados:
          </p>
          <div className="flex gap-2 flex-wrap">
            {selectedSeats.map((s) => (
              <span
                key={s.id}
                className="bg-[#F6AD38] text-[#1d1430] px-2.5 py-1 rounded-lg font-bold text-xs"
              >
                {s.id}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* BOTONES */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-gray-300 hover:border-white/40 hover:text-white transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>

        <button
          onClick={() => onNext({ selectedSeats, ticketsNeeded, totalPrice })}
          disabled={!canContinue}
          className="
            px-8 py-3 bg-[#F6AD38] text-[#1d1430] font-bold rounded-xl text-sm uppercase tracking-widest
            disabled:opacity-30 disabled:cursor-not-allowed
            hover:brightness-110 active:scale-95 transition-all
            shadow-lg shadow-[#F6AD38]/30
          "
        >
          Continuar → Confitería
        </button>
      </div>
    </div>
  )
}
