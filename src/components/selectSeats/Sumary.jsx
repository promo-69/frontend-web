export default function Summary({
  showtime,
  ticketsNeeded,
  setTicketsNeeded,
  selectedSeats,
  onNext,
}) {
  const total = ticketsNeeded * Number(showtime.price)

  return (
    <div className="bg-[#2D1748]/50 border border-white/10 rounded-2xl p-6 space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-gray-300">Boletos:</span>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTicketsNeeded(Math.max(1, ticketsNeeded - 1))}
            className="text-[#F6AD38] font-bold text-xl"
          >
            −
          </button>

          <span className="text-white font-bold">{ticketsNeeded}</span>

          <button
            onClick={() => setTicketsNeeded(Math.min(8, ticketsNeeded + 1))}
            className="text-[#F6AD38] font-bold text-xl"
          >
            +
          </button>
        </div>
      </div>

      <p className="text-gray-300 text-sm">
        Selecciona exactamente {ticketsNeeded} asiento
        {ticketsNeeded > 1 ? 's' : ''}
      </p>

      <div className="text-right">
        <p className="text-[#F6AD38] text-3xl font-bold">
          {showtime.currency?.symbol}
          {total.toFixed(2)}
        </p>
      </div>

      <button
        disabled={selectedSeats.length !== ticketsNeeded}
        onClick={onNext}
        className="w-full py-3 rounded-xl bg-[#F6AD38] text-black font-bold disabled:opacity-40"
      >
        Continuar → Confitería
      </button>
    </div>
  )
}
