import { useCart } from '../../context/CartContext'
import { useNavigate } from 'react-router-dom'

export default function OrderSummary({
  onNext,
  mode = 'flow',
  currentShowtime = null,
  selectedSeatsList = [],
}) {
  const { cart, getTotals } = useCart()
  const totals = getTotals()
  const navigate = useNavigate()

  const isPublicMode = mode === 'public'

  // Si nos pasan los datos por props (flujo de asientos), usamos esos; si no, usamos el cart global (confitería)
  const movieTitle = !isPublicMode
    ? currentShowtime?.movie?.title || cart.movie?.title
    : null
  const cinemaName = !isPublicMode
    ? currentShowtime?.cinemaName || cart.showtime?.cinemaName
    : null
  const sessionDate = !isPublicMode
    ? currentShowtime?.date || cart.showtime?.date
    : null
  const sessionTime = !isPublicMode
    ? currentShowtime?.time || cart.showtime?.time
    : null

  // Mapeamos las butacas reales acumuladas
  const ticketsToRender =
    !isPublicMode && selectedSeatsList.length > 0
      ? selectedSeatsList
      : cart.tickets

  return (
    <div className="bg-[#2D1748]/50 p-6 rounded-xl text-white space-y-4 shadow-lg h-fit border border-purple-900/40">
      <h2 className="text-2xl font-bold text-[#F6AD38]">Resumen de Compra</h2>

      {/* 🎬 Película */}
      {movieTitle && (
        <div>
          <p className="font-semibold text-lg">{movieTitle}</p>
        </div>
      )}

      {/* 🕒 Función */}
      {cinemaName && (
        <div className="text-sm opacity-80 mb-2">
          <p>{cinemaName}</p>
          <p>
            {sessionDate} — {sessionTime}
          </p>
        </div>
      )}

      {/* 🎟️ Tickets */}
      {ticketsToRender.length > 0 && (
        <div className="border-b border-white/10 pb-3">
          <h3 className="font-semibold text-sm text-gray-300">Boletos</h3>
          <ul className="text-sm space-y-1 max-h-24 overflow-y-auto">
            {ticketsToRender.map((t, i) => (
              <li key={i} className="flex justify-between">
                <span>
                  Asiento {t.row || t.number || t.id}{' '}
                </span>
                <span>${t.price || 0}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 🍿 Confitería (Se muestra en AMBOS modos si hay productos) */}
      {cart.products.length > 0 ? (
        <div className="pt-2">
          <h3 className="font-semibold text-sm text-gray-300">Confitería</h3>
          <ul className="text-sm space-y-2 max-h-40 overflow-y-auto pr-1">
            {cart.products.map((p, i) => (
              <li
                key={i}
                className="flex justify-between bg-black/20 p-2 rounded-lg text-xs"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <span className="text-gray-400">x{p.quantity}</span>
                </div>
                <span className="font-semibold self-center">
                  ${(p.price * p.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        isPublicMode && (
          <p className="text-gray-400 text-sm text-center py-4">
            No has añadido antojos al carrito todavía.
          </p>
        )
      )}

      {/* 💰 Totales de Venta */}
      <div className="border-t border-white/20 pt-4 space-y-1 text-sm">
        <p className="flex justify-between">
          <span>Subtotal:</span> <span>${totals.subtotal.toFixed(2)}</span>
        </p>
        <p className="flex justify-between">
          <span>IVA (16%):</span> <span>${totals.iva.toFixed(2)}</span>
        </p>
        <p className="text-xl font-bold text-[#F6AD38] flex justify-between pt-1">
          <span>Total:</span> <span>${totals.total.toFixed(2)}</span>
        </p>
      </div>

      {/* 🔘 Control Condicional de Botones de Navegación */}
      <div className="pt-4 space-y-3">
        {isPublicMode ? (
          /* Vista desde el Header */
          <>
            <button
              onClick={() => navigate('/checkout')}
              disabled={cart.products.length === 0}
              className={`w-full py-3 rounded-lg font-bold transition-all text-black ${
                cart.products.length === 0
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-[#F6AD38] hover:bg-[#d9982f]'
              }`}
            >
              Proceder al Pago →
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-transparent border border-white/30 py-2 rounded-lg text-sm text-gray-300 hover:text-white"
            >
              Ver Cartelera
            </button>
          </>
        ) : (
          /* Vista desde el Flujo de Compra */
          <>
            <button
              onClick={onNext}
              className="w-full bg-[#D9982F] text-black py-2 rounded-lg font-bold hover:bg-[#be8225] transition-colors"
            >
              Continuar → Confiteria
            </button>

            <button
              onClick={() => navigate('checkout')}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition-colors"
            >
              Omitir confitería
            </button>

            <button
              onClick={() => navigate(-1)} // Retorna de forma segura al paso de los asientos
              className="w-full bg-transparent border border-white/40 py-2 rounded-lg text-white text-sm hover:bg-white/5"
            >
              ← Atrás
            </button>
          </>
        )}
      </div>
    </div>
  )
}
