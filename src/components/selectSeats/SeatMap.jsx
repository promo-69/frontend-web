export default function SeatMap({ seats, onToggle }) {
  const rows = [...new Set(seats.map((s) => s.row))].sort()
  const byRow = rows.reduce((acc, row) => {
    acc[row] = seats
      .filter((s) => s.row === row)
      .sort((a, b) => a.column - b.column)
    return acc
  }, {})

  return (
    <div className="bg-[#2D1748]/50 border border-white/20 rounded-2xl p-6 shadow-xl">
      {/* Pantalla */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-3/4 h-2 bg-gradient-to-b from-[#F6AD38]/60 to-transparent rounded-full" />
        <p className="text-[10px] text-[#F6AD38]/60 uppercase tracking-widest font-bold mt-1">
          Pantalla
        </p>
      </div>

      {/* Asientos */}
      <div className="bg-white/70 flex flex-col items-center gap-3 p-6 rounded-xl">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-2">
            <span className="w-6 text-[#F6AD38] font-bold">{row}</span>

            {byRow[row].map((seat) => {
              const color =
                seat.status === 'sold'
                  ? 'bg-gray-600 cursor-not-allowed'
                  : seat.status === 'locked'
                    ? 'bg-yellow-500 cursor-not-allowed'
                    : seat.status === 'selected'
                      ? 'bg-[#F6AD38]'
                      : 'bg-[#713182] hover:bg-[#913a9e] cursor-pointer'


              return (
                <div
                  key={seat.id}
                  onClick={() => {
                    if (
                      seat.status === 'available' ||
                      seat.status === 'selected'
                    ) {
                      onToggle(seat.id)
                    }
                  }}
                  className={`w-7 h-7 rounded-md transition-transform ${color}`}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
