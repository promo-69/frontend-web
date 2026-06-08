import { useCart } from '../../context/CartContext'

export default function OrderSummary() {
  const { cart, getTotals } = useCart()
  const totals = getTotals()

  return (
    <div className="bg-[#2D1748]/50 p-6 rounded-xl text-white space-y-4 shadow-lg">
      <h2 className="text-2xl font-bold text-[#F6AD38]">Resumen de Compra</h2>

      {/* Película */}
      {cart.movie && (
        <div>
          <p className="font-semibold text-lg">{cart.movie.title}</p>
        </div>
      )}

      {/* Showtime */}
      {cart.showtime && (
        <div className="text-sm opacity-80">
          <p>{cart.showtime.cinemaName}</p>
          <p>
            {cart.showtime.date} — {cart.showtime.time}
          </p>
        </div>
      )}

      {/* Tickets */}
      {cart.tickets.length > 0 && (
        <div>
          <h3 className="font-semibold">Boletos</h3>
          <ul className="text-sm space-y-1">
            {cart.tickets.map((t, i) => (
              <li key={i}>
                Asiento {t.row}
                {t.column} — ${t.price}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Confitería */}
      {cart.products.length > 0 && (
        <div>
          <h3 className="font-semibold">Confitería</h3>
          <ul className="text-sm space-y-1">
            {cart.products.map((p, i) => (
              <li key={i}>
                {p.name} x{p.quantity} — ${p.price * p.quantity}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Totales */}
      <div className="border-t border-white/20 pt-4 space-y-1 text-sm">
        <p>Subtotal: ${totals.subtotal.toFixed(2)}</p>
        <p>IVA (16%): ${totals.iva.toFixed(2)}</p>
        <p className="text-xl font-bold text-[#F6AD38]">
          Total: ${totals.total.toFixed(2)}
        </p>
      </div>
    </div>
  )
}
