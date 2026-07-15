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
      {/* Asientos */}
      <div className="bg-white flex flex-col items-center gap-3 p-6 rounded-xl">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-2">
            {byRow[row].map((seat) => {
              const seatCategoryId =
                seat.category?.id || seat.seat_category_id || seat.seatCategoryId || 1;
              const seatCondition =
                seat.seat_condition?.id || seat.seat_condition || seat.seatCondition || 1;

              // Para asiento fuera de servicio (seat_condition = 3)
              if (seatCondition === 3) {
                return (
                  <div
                    key={seat.id}
                    className="w-7 h-7 rounded-md border border-dashed border-[#37415199]"
                  />
                )
              }

              const isMaintenance = seatCondition === 2;
              const isBlue = seatCategoryId === 2;
              const isSold = seat.status === 'sold';

              let baseColor = 'bg-[#713182]';
              let icon = null;

              if (isMaintenance) {
                baseColor = 'bg-[#f97316]';
                icon = (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wrench w-3 h-3 mt-[1px]" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z"></path></svg>
                );
              } else if (isBlue) {
                baseColor = 'bg-[#2563eb]';
                icon = (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-accessibility w-3 h-3 mt-[1px]" aria-hidden="true"><circle cx="16" cy="4" r="1"></circle><path d="m18 19 1-7-6 1"></path><path d="m5 8 3-3 5.5 3-2.36 3.5"></path><path d="M4.24 14.5a5 5 0 0 0 6.88 6"></path><path d="M13.76 17.5a5 5 0 0 0-6.88-6"></path></svg>
                );
              }

              let stateStyles = '';
              let overlay = null;

              if (isSold) {
                // Cara grisácea que indique inhabilitación pero permita apreciar la categoría
                stateStyles = 'cursor-not-allowed';
                overlay = <div className="absolute inset-0 bg-[#97999c] rounded-md" />;
              } else if (seat.status === 'locked') {
                baseColor = 'bg-[#eab308]';
                stateStyles = 'cursor-not-allowed';
              } else if (seat.status === 'selected') {
                baseColor = 'bg-[#eab308]';
                stateStyles = 'cursor-pointer shadow-md shadow-[#eab308]/50';
              } else {
                stateStyles = 'cursor-pointer hover:brightness-110';
              }

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
                  className={`
                    relative
                    w-7 h-7 rounded-md
                    transition-all duration-200
                    flex flex-col items-center justify-center
                    text-[10px] font-bold text-white leading-none
                    ${baseColor} ${stateStyles}
                  `}
                >
                  {overlay}
                  <span className="relative z-10">{seat.row}{seat.column}</span>
                  {icon && <span className="relative z-10">{icon}</span>}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
