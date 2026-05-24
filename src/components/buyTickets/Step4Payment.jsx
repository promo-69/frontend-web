import { useState } from 'react'
import {
  ArrowLeft,
  CheckCircle,
  Ticket,
  ShoppingBag,
  DollarSign,
  Smartphone,
  CreditCard,
  Banknote,
} from 'lucide-react'

const PAYMENT_METHODS = [
  {
    id: 'pago_movil',
    label: 'Pago Móvil',
    icon: Smartphone,
    fields: ['Banco', 'Teléfono', 'Referencia'],
  },
  { id: 'efectivo', label: 'Efectivo', icon: Banknote, fields: [] },
  {
    id: 'tarjeta',
    label: 'Tarjeta',
    icon: CreditCard,
    fields: ['Últimos 4 dígitos', 'Referencia'],
  },
]

export default function Step4Payment({
  movie,
  showtime,
  selectedSeats,
  ticketsNeeded,
  totalTickets,
  concessionItems,
  concessionTotal,
  onConfirm,
  onBack,
}) {
  const [paymentMethod, setPaymentMethod] = useState('pago_movil')
  const [paymentFields, setPaymentFields] = useState({})
  const [confirmed, setConfirmed] = useState(false)

  const grandTotal = totalTickets + concessionTotal
  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === paymentMethod)

  const handleConfirm = () => {
    setConfirmed(true)
    onConfirm({
      paymentMethod,
      paymentFields,
      grandTotal,
    })
  }

  if (confirmed) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-[#F6AD38]/20 rounded-full scale-150 animate-ping" />
          <div className="relative w-24 h-24 rounded-full bg-[#F6AD38] flex items-center justify-center shadow-2xl shadow-[#F6AD38]/40">
            <CheckCircle
              className="w-12 h-12 text-[#1d1430]"
              strokeWidth={2.5}
            />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-[#F6AD38] mb-2 uppercase tracking-widest">
          ¡Venta Exitosa!
        </h2>
        <p className="text-gray-400 text-center max-w-sm">
          Los boletos han sido registrados correctamente. Entrega los tiquetes
          al cliente.
        </p>
        <div className="mt-6 bg-white/5 border border-[#F6AD38]/30 rounded-2xl p-6 text-center w-full max-w-sm">
          <p className="text-sm text-gray-400 mb-1">{movie.title}</p>
          <p className="text-white font-bold">
            {showtime.time} · {showtime.room}
          </p>
          <div className="flex gap-2 flex-wrap justify-center mt-2">
            {selectedSeats.map((s) => (
              <span
                key={s.id}
                className="bg-[#F6AD38] text-[#1d1430] px-2.5 py-1 rounded-lg font-bold text-xs"
              >
                {s.id}
              </span>
            ))}
          </div>
          <p className="text-2xl font-bold text-[#F6AD38] mt-4">
            ${grandTotal.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Pago: {selectedMethod?.label}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <h2 className="text-2xl font-bold text-[#F6AD38]">Resumen y Pago</h2>
        <p className="text-gray-400 text-sm mt-1">
          Confirma los detalles y selecciona el método de pago
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Resumen de compra ── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-[#F6AD38] flex items-center gap-2 text-sm uppercase tracking-wider">
            <Ticket className="w-4 h-4" /> Boletos
          </h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>{movie.title}</span>
              <span className="text-white font-bold">{ticketsNeeded}x</span>
            </div>
            <div className="text-xs text-gray-500 pl-2">
              <p>
                {showtime.time} · {showtime.room} · {showtime.date}
              </p>
              <div className="flex gap-1 flex-wrap mt-1">
                {selectedSeats.map((s) => (
                  <span
                    key={s.id}
                    className="bg-[#F6AD38]/20 text-[#F6AD38] px-1.5 py-0.5 rounded text-[10px] font-bold"
                  >
                    {s.id}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-between font-bold pt-1 border-t border-white/10">
              <span className="text-gray-300">Subtotal boletos</span>
              <span className="text-[#F6AD38]">${totalTickets.toFixed(2)}</span>
            </div>
          </div>

          {concessionItems.length > 0 && (
            <>
              <h3 className="font-bold text-[#F6AD38] flex items-center gap-2 text-sm uppercase tracking-wider pt-2 border-t border-white/10">
                <ShoppingBag className="w-4 h-4" /> Confitería
              </h3>
              <div className="space-y-1">
                {concessionItems.map((entry) => (
                  <div
                    key={entry.key}
                    className="flex justify-between text-sm text-gray-300"
                  >
                    <span>
                      {entry.item.emoji} {entry.item.name} ×{entry.qty}
                    </span>
                    <span>${(entry.item.price * entry.qty).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-1 border-t border-white/10">
                  <span className="text-gray-300">Subtotal confitería</span>
                  <span className="text-[#F6AD38]">
                    ${concessionTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-between text-xl font-bold pt-3 border-t-2 border-[#F6AD38]/30">
            <span className="text-white flex items-center gap-1">
              <DollarSign className="w-5 h-5 text-[#F6AD38]" /> Total a Pagar
            </span>
            <span className="text-[#F6AD38]">${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* ── Método de pago ── */}
        <div className="space-y-4">
          <h3 className="font-bold text-[#F6AD38] text-sm uppercase tracking-wider">
            Método de Pago
          </h3>
          <div className="space-y-2">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon
              const isSelected = paymentMethod === method.id
              return (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`
                    w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left
                    ${isSelected ? 'border-[#F6AD38] bg-[#F6AD38]/10' : 'border-white/10 hover:border-white/30 bg-white/5'}
                  `}
                >
                  <Icon
                    className={`w-5 h-5 ${isSelected ? 'text-[#F6AD38]' : 'text-gray-400'}`}
                  />
                  <span
                    className={`font-bold text-sm ${isSelected ? 'text-[#F6AD38]' : 'text-gray-300'}`}
                  >
                    {method.label}
                  </span>
                  {isSelected && (
                    <div className="ml-auto w-2.5 h-2.5 rounded-full bg-[#F6AD38]" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Campos del método seleccionado */}
          {selectedMethod?.fields?.length > 0 && (
            <div className="space-y-2 pt-2">
              {selectedMethod.fields.map((field) => (
                <div key={field} className="relative">
                  <label className="absolute top-1 left-3 text-[10px] font-bold text-[#F6AD38] uppercase tracking-wider">
                    {field}
                  </label>
                  <input
                    type="text"
                    placeholder={field}
                    onChange={(e) =>
                      setPaymentFields((p) => ({
                        ...p,
                        [field]: e.target.value,
                      }))
                    }
                    className="w-full bg-white/5 border border-white/20 rounded-xl px-3 pt-6 pb-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F6AD38]/60 transition-colors"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-gray-300 hover:border-white/40 hover:text-white transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>

        <button
          onClick={handleConfirm}
          className="
            px-10 py-4 bg-[#F6AD38] text-[#1d1430] font-black rounded-xl text-base uppercase tracking-widest
            hover:brightness-110 active:scale-95 transition-all
            shadow-xl shadow-[#F6AD38]/40
          "
        >
          Confirmar Venta · ${grandTotal.toFixed(2)}
        </button>
      </div>
    </div>
  )
}
