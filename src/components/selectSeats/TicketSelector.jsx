import React from 'react'

export default function TicketSelector({
  counts,
  onIncrement,
  onDecrement,
  maxAllowed = 10,
}) {
  const categories = [
    { id: 1, name: 'Adulto', description: 'Público general' },
    { id: 2, name: 'Niño', description: 'Menores de 12 años' },
    {
      id: 3,
      name: 'Tercera Edad',
      description: 'Mayores de 60 años',
    },
  ]

  const totalTickets = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="bg-[#2D1748]/40 border border-purple-900/30 p-5 rounded-xl text-white my-4 shadow-inner">
      <h3 className="text-sm font-bold text-[#F6AD38] uppercase tracking-wider mb-3">
        Selecciona la cantidad y tipo de boletos
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const currentCount = counts[cat.id] || 0
          return (
            <div
              key={cat.id}
              className="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-purple-900/20"
            >
              <div>
                <p className="font-semibold text-sm text-gray-100">
                  {cat.name}
                </p>
                <p className="text-xs text-gray-400">{cat.description}</p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => onDecrement(cat.id)}
                  disabled={currentCount === 0}
                  className="w-7 h-7 flex items-center justify-center bg-purple-900/40 rounded-full hover:bg-purple-800 border border-purple-500/30 disabled:opacity-30 disabled:cursor-not-allowed transition font-bold"
                >
                  -
                </button>
                <span className="font-bold text-base text-yellow-400 min-w-[12px] text-center">
                  {currentCount}
                </span>
                <button
                  type="button"
                  onClick={() => onIncrement(cat.id)}
                  disabled={totalTickets >= maxAllowed}
                  className="w-7 h-7 flex items-center justify-center bg-yellow-500 rounded-full hover:bg-yellow-600 text-black disabled:opacity-30 disabled:cursor-not-allowed transition font-bold"
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 text-right">
        <p className="text-xs text-purple-300 font-medium">
          Total boletos a seleccionar:{' '}
          <span className="text-white font-bold bg-purple-900/60 px-2 py-0.5 rounded ml-1">
            {totalTickets}
          </span>
        </p>
      </div>
    </div>
  )
}
