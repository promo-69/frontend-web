import { useMemo } from 'react'
import { useCart } from '../../context/CartContext'
import { usePurchase } from '../../context/PurchaseContext'

export default function OrderSummary({
  onNext,
  onDirectCheckout,
  //mode = 'flow',
  mode = 'seats',
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
    console.log('=== [OrderSummary] Ejecutando ticketsCalculated ===')
    console.log('isPublicMode:', isPublicMode)
    console.log('selectedSeatsList longitud:', selectedSeatsList?.length)
    console.log(
      'pricing_matrix disponible:',
      !!currentShowtime?.pricing?.pricing_matrix,
    )
    console.log('Estructura completa de currentShowtime:', currentShowtime)

    if (
      isPublicMode ||
      !selectedSeatsList.length ||
      //!currentShowtime?.pricing?.pricing_matrix
      !selectedSeatsList.length
    ) {
      console.warn(
        '[OrderSummary] Salida prematura: No hay asientos seleccionados o es modo público.',
      )
      return { list: [], subtotal: 0 }
    }

    const matrix = currentShowtime?.pricing?.pricing_matrix || []
    if (matrix.length === 0) {
      console.warn(
        '[OrderSummary] ¡Alerta! La matriz de precios viene vacía de la API.',
      )
    }

    const list = selectedSeatsList.map((seat) => {
      const currentAudienceId = seat.assignedAudienceId || 1

      const seatCategoryId =
        seat.category?.id || seat.seat_category_id || seat.seatCategoryId || 1

      const priceMatch = matrix.find(
        (p) =>
          p.seat_category?.id === seatCategoryId &&
          p.audience_category?.id === currentAudienceId,
      )

      // Si no hay match en la matriz, usamos el precio base del showtime 
      const finalPrice = priceMatch
        ? priceMatch.final_price
        : seat.price || currentShowtime.pricing.base_price || 6.0;

        console.log(
          `Asiento ${seat.label || seat.id}: Precio asignado -> $${finalPrice}`,
        )

      return {
        id: seat.id || seat.seatId,
        label: seat.label || `${seat.row}${seat.column}`,
        categoryName:
          seat.category?.description || seat.categoryName || 'General',
        price: finalPrice,
        audienceCategoryId: currentAudienceId,
        audienceLabel: audienceNames[currentAudienceId] || 'Adulto',
      }
    })

    const subtotal = list.reduce((sum, ticket) => sum + ticket.price, 0)
    console.log('Subtotal final de boletos calculado:', subtotal)

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

  const isSelectionEmpty = !isPublicMode && selectedSeatsList.length === 0

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
        Resumen de Compra
      </h2>

      {/* 🎬 Render de Información de Película (Solo si está en flujo de boletos) */}
      {!isPublicMode && currentShowtime && (
        <div className="text-sm space-y-1 bg-black/20 p-3 rounded-lg">
          <p className="font-semibold text-base text-yellow-400">
            {currentShowtime.movie?.title || 'Película'}
          </p>
          <p className="text-gray-300">
            Sala id: {currentShowtime.booking?.room || currentShowtime.room_id}
          </p>
          <p className="text-gray-300">
            Hora:{' '}
            {currentShowtime?.booking?.start_time
              ? new Date(
                  currentShowtime.booking?.start_time.replace(' ', 'T'),
                ).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true,
                })
              : 'N/A'}
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

      {/* ========================================================
          🚀 BLOQUE DE BOTONES DE ACCIÓN CONFIGURABLE
         ======================================================== */}
      <div className="space-y-2 pt-2">
        {/* CASO A: desde Seleccion de asientos (Mostramos dos opciones) */}
        {mode === 'seats' && (
          <>
            {/* Botón Principal: Continuar agregando golosinas */}
            <button
              onClick={onNext}
              disabled={isSelectionEmpty}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black py-3 rounded-xl font-bold transition shadow-md uppercase tracking-wider text-sm"
            >
              🍿 Añadir Confitería
            </button>

            {/* Botón Secundario: Ir directo a pagar saltándose la dulcería */}
            <button
              onClick={onDirectCheckout}
              disabled={isSelectionEmpty}
              className="w-full border border-yellow-500 text-yellow-500 hover:bg-yellow-500/10 disabled:border-gray-600 disabled:text-gray-500 disabled:hover:bg-transparent disabled:cursor-not-allowed py-2.5 rounded-xl font-bold transition uppercase tracking-wider text-xs"
            >
              🎟️ Omitir e ir a Pagar
            </button>
          </>
        )}

        {/* CASO B: Esta en (Confitería)*/}
        {mode !== 'seats' && (
          <button
            onClick={onNext}
            disabled={
              isPublicMode ? cart.products.length === 0 : isSelectionEmpty
            }
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black py-3 rounded-xl font-bold transition shadow-md uppercase tracking-wider text-sm"
          >
            {isPublicMode ? 'Pagar' : 'Confirmar y Pagar'}
          </button>
        )}
      </div>
    </div>
  )
}
