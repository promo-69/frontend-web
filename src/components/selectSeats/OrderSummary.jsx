import { useMemo } from 'react'
import { useCart } from '../../context/CartContext'
import { usePurchase } from '../../context/PurchaseContext'

export default function OrderSummary({
  onNext,
  mode = 'flow',
  currentShowtime = null,
  selectedSeatsList = [],
}) {
  const { cart } = useCart()
  const { selectedSeats } = usePurchase()

  const isPublicMode = mode === 'public'

  const audienceNames = {
    1: 'Adulto',
    2: 'Niño',
    3: 'Tercera Edad',
  }

  // ========================================================
  // 💸 CÁLCULO DE BOLETOS BASADO EN LA MATRIZ DE PRECIOS
  // ========================================================
  const ticketsCalculated = useMemo(() => {
    if (
      isPublicMode ||
      !selectedSeatsList.length ||
      !currentShowtime?.pricing?.pricing_matrix
    ) {
      return { list: [], subtotal: 0 }
    }

    const matrix = currentShowtime.pricing.pricing_matrix

    const list = selectedSeatsList.map((seat) => {

      const currentAudienceId = seat.assignedAudienceId || 1
      // Cruzamos el ID de categoría del asiento con el ID 
      const priceMatch = matrix.find(
        (p) =>
          p.seat_category.id === seat.category.id &&
          p.audience_category.id === currentAudienceId,
      )

      const finalPrice = priceMatch
        ? priceMatch.final_price
        : currentShowtime.pricing.base_price || 6.0

      return {
        id: seat.id,
        label: seat.label,
        categoryName: seat.category.description,
        price: finalPrice,
        audienceCategoryId: currentAudienceId,
        audienceLabel: audienceNames[currentAudienceId] || 'Adulto',
      }
    })

    const subtotal = list.reduce((sum, ticket) => sum + ticket.price, 0)

    return { list, subtotal }
  }, [selectedSeatsList, currentShowtime, isPublicMode])

  // ========================================================
  // 🍿 CÁLCULO DE CONFITERÍA
  // ========================================================
  const confectionerySubtotal = useMemo(() => {
    return cart.products.reduce((sum, p) => sum + p.price * p.quantity, 0)
  }, [cart.products])

  // ========================================================
  // 💰 TOTALES UNIFICADOS Y LOGS PARA EL CHECKOUT
  // ========================================================
  const globalSubtotal = ticketsCalculated.subtotal + confectionerySubtotal
  const globalIva = globalSubtotal * 0.16 // IVA del 16%
  const globalTotal = globalSubtotal + globalIva

  // 📝 CONSOLE.LOG EXCLUSIVO PARA RECTIFICAR LA ESTRUCTURA QUE SE ENVIARÁ AL CHECKOUT
  console.log('--- 🛒 INFORMACIÓN PREPARADA PARA EL CHECKOUT ---', {
    showtimeId: currentShowtime?.id || 'No definido',
    ticketsPayload: ticketsCalculated.list.map((t) => ({
      seatId: t.id,
      label: t.label,
      priceApplied: t.price,
      audienceCategoryId: t.audienceCategoryId,
    })),
    concessionsPayload: cart.products.map((p) => ({
      line_type: p.isCombo ? 2 : 1,
      product: p.id,
      quantity: p.quantity,
      price: p.price,
    })),
    summary: {
      subtotal: globalSubtotal.toFixed(2),
      iva: globalIva.toFixed(2),
      total: globalTotal.toFixed(2),
    },
  })

  return (
    <div className="bg-[#2D1748]/50 p-6 rounded-xl text-white space-y-5 shadow-lg border border-purple-900/40 h-fit">
      <h2 className="text-xl font-bold border-b border-white/10 pb-2 text-[#F6AD38]">
        Resumen de la Orden
      </h2>

      {/* 🎬 Render de Información de Película (Solo si está en flujo de boletos) */}
      {!isPublicMode && currentShowtime && (
        <div className="text-sm space-y-1 bg-black/20 p-3 rounded-lg">
          <p className="font-semibold text-base text-yellow-400">
            {currentShowtime.movie?.title || 'Película'}
          </p>
          <p className="text-gray-300">
            Sala: {currentShowtime.room_id || 'N/A'}
          </p>
          <p className="text-gray-300">
            Hora:{' '}
            {new Date(currentShowtime.start_time).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      )}

      {/* 🎟️ SECCIÓN DE TICKETS SELECCIONADOS */}
      {!isPublicMode && ticketsCalculated.list.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-300">
            Tickets Seleccionados
          </p>
          <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {ticketsCalculated.list.map((ticket) => (
              <div
                key={ticket.id}
                className="flex justify-between text-sm bg-purple-950/40 p-2 rounded border border-purple-800/20"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <div>
                    <span className="font-bold text-[#F6AD38] mr-1">
                      Asiento {ticket.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({ticket.categoryName})
                    </span>
                  </div>
                  <span className="text-[10px] bg-purple-900/80 text-yellow-300 px-1.5 py-0.5 rounded font-semibold w-fit border border-purple-700/30">
                    {ticket.audienceLabel}
                  </span>
                </div>
                <span className="font-medium">${ticket.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🍿 SECCIÓN DE CONFITERÍA */}
      {cart.products.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-300">
            Confitería
          </p>
          <div className="max-h-28 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
            {cart.products.map((p) => (
              <div
                key={p.id}
                className="flex justify-between text-sm bg-purple-950/40 p-2 rounded border border-purple-800/20"
              >
                <span className="text-gray-200">
                  {p.name}{' '}
                  <span className="text-xs text-yellow-500 font-bold">
                    x{p.quantity}
                  </span>
                </span>
                <span className="font-medium">
                  ${(p.price * p.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 💰 MATRIZ DE TOTALES FINALES */}
      <div className="border-t border-white/10 pt-4 space-y-2 text-sm bg-black/10 p-3 rounded-lg">
        <div className="flex justify-between text-gray-300">
          <span>Subtotal:</span>
          <span>${globalSubtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-300">
          <span>IVA (16%):</span>
          <span>${globalIva.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xl font-bold text-[#F6AD38] pt-1 border-t border-white/5">
          <span>Total:</span>
          <span>${globalTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* 🚀 BOTÓN ACCIÓN */}
      <button
        onClick={onNext}
        disabled={
          !isPublicMode &&
          selectedSeats.length === 0 &&
          cart.products.length === 0
        }
        className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black py-3 rounded-xl font-bold transition shadow-md uppercase tracking-wider text-sm"
      >
        {isPublicMode ? 'Proceder al Pago' : 'Siguiente Paso'}
      </button>
    </div>
  )
}
