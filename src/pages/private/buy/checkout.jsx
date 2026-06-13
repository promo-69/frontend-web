import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../../../context/CartContext'

import {
  createOrderCheckout,
  registerPayment,
} from '../../../services/orders.service'

export default function Checkout() {
  const { movieId, showtimeId } = useParams()
  const navigate = useNavigate()
  const { cart, getTotals, clearCart } = useCart()

  // Estados de control del componente
  const [checkingOut, setCheckingOut] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState(null)

  // Datos devueltos por el backend tras congelar la orden
  const [checkoutData, setCheckoutData] = useState(null)

  // Datos del formulario de pago
  const [paymentMethod, setPaymentMethod] = useState('transfer') // 'card', 'transfer', etc.
  const [referenceNumber, setReferenceNumber] = useState('')
  const [amountInput, setAmountInput] = useState('')

  // 🔄 Fase A: Bloquear e inicializar Checkout al cargar la pantalla
  useEffect(() => {
    const initCheckout = async () => {
      try {
        setCheckingOut(true)
        setError(null)

        // 🧠 Estructuramos el payload exactamente como lo exige tu Backend
        const payload = {
          tickets: (cart.tickets || []).map((t) => ({
            booking: 1, // Tu identificador o id base temporal de reserva
            seatId: t.originalId || t.id, // ID del asiento de base de datos
            audienceCategoryId: t.audienceCategoryId || 1, // 1 = General por defecto
          })),
          concessions: (cart.products || []).map((p) => ({
            line_type: p.type === 'product' ? 1 : 2, // 1 = Producto Simple, 2 = Combo
            // Enviamos la propiedad correspondiente anulando la otra
            ...(p.type === 'product'
              ? { product: p.productId }
              : { combo: p.productId }),
            quantity: p.quantity,
          })),
        }

        // Llamada a la API: POST /api/v1/orders/checkout
        const response = await createOrderCheckout(payload)

        setCheckoutData(response)
        // Inicializamos el input del monto con el total real que calculó el backend
        setAmountInput(response?.total || getTotals().total)
      } catch (err) {
        console.error('Error en el checkout inicial:', err)
        setError('No pudimos procesar y asegurar tu orden. Inténtalo de nuevo.')
      } finally {
        setCheckingOut(false)
      }
    }

    // Protección: Si no hay entradas ni productos en el carrito, no tiene sentido estar en Checkout
    if (
      (!cart.tickets || cart.tickets.length === 0) &&
      (!cart.products || cart.products.length === 0)
    ) {
      navigate('/')
    } else {
      initCheckout()
    }
  }, [cart, navigate])

  // Fase B: Registrar el Pago definitivo
  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    if (!referenceNumber.trim()) {
      setError('Por favor, ingresa el número de referencia de la transacción.')
      return
    }

    try {
      setPaying(true)
      setError(null)

      const paymentPayload = {
        payment_method: paymentMethod,
        amount: parseFloat(amountInput),
        currency: 2, 
        reference_number: referenceNumber.trim(),
      }

      // Llamada a la API: POST /api/v1/orders/payments
      const response = await registerPayment(paymentPayload)

      if (response && response.orderId) {
        // Limpiamos el carrito global para que quede listo para otra compra
        clearCart()
        // Navegamos a la vista de éxito con el QR code recibido
        navigate('/order-success', {
          state: { orderId: response.orderId, qrCode: response.qrCode },
        })
      }
    } catch (err) {
      console.error('Error registrando el pago:', err)
      setError(
        'El pago no pudo ser validado. Verifica los datos e intenta nuevamente.',
      )
    } finally {
      setPaying(false)
    }
  }

  // Pantalla de carga inicial (Congelando la orden en Redis / Base de datos)
  if (checkingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#231640]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-yellow-500 border-purple-900 rounded-full animate-spin mx-auto"></div>
          <p className="text-xl font-semibold animate-pulse">
            Asegurando tus asientos y congelando precios...
          </p>
        </div>
      </div>
    )
  }

  // Totales finales (Prioriza lo calculado por el backend o usa el fallback del Context)
  const finalTotal = checkoutData?.total ?? getTotals().total
  const finalSubtotal = checkoutData?.subtotal ?? getTotals().subtotal
  const finalIva = checkoutData?.iva ?? getTotals().iva

  return (
    <div
      className="min-h-screen p-6 text-white grid grid-cols-1 lg:grid-cols-3 gap-8"
      style={{
        background:
          'linear-gradient(to bottom, #231640 0%, #4c115c 50%, #231640 100%)',
      }}
    >
      {/* 💳 COLUMNA IZQUIERDA: Formulario de Facturación y Pago (Toma 2 columnas) */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-[#1f1533]/90 border border-gray-700 p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
            <span>💳</span> Información de Pago
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/40 text-red-400 p-4 rounded-xl text-sm mb-4">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            {/* Selector de Método de Pago */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Método de Pago
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  {
                    id: 'transfer',
                    name: 'Transferencia Bancaria',
                    icon: '🏦',
                  },
                  { id: 'mobile', name: 'Pago Móvil', icon: '📱' },
                  { id: 'card', name: 'Tarjeta de Crédito', icon: '💳' },
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all font-medium ${
                      paymentMethod === method.id
                        ? 'bg-yellow-500/20 border-yellow-400 text-yellow-400 shadow-md shadow-yellow-500/10'
                        : 'bg-[#2a1b4e]/50 border-gray-700 hover:border-gray-500 text-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{method.icon}</span>
                    <span className="text-xs text-center">{method.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Datos de la transacción */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Número de Referencia
                </label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Ej: TRX12345678"
                  className="w-full bg-[#2a1b4e] border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-colors placeholder:text-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Monto a pagar (USD)
                </label>
                <input
                  type="number"
                  value={amountInput}
                  disabled // Deshabilitado para que pague exactamente la orden congelada
                  className="w-full bg-[#2a1b4e]/50 border border-gray-700 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed font-semibold focus:outline-none"
                />
              </div>
            </div>

            {/* Instrucciones Dinámicas según el método seleccionado */}
            <div className="bg-black/20 border border-gray-700/50 p-4 rounded-xl text-xs text-gray-300 space-y-1">
              <p className="font-bold text-yellow-400/90 mb-1">
                📌 Instrucciones de transferencia:
              </p>
              {paymentMethod === 'transfer' && (
                <>
                  <p>Banco: Banco Mercantil (0105)</p>
                  <p>Cuenta: 0105-XXXX-XX-XXXXXXXXXX</p>
                  <p>A nombre de: Cineflix S.A.</p>
                </>
              )}
              {paymentMethod === 'mobile' && (
                <>
                  <p>Banco: Banco Mercantil (0105)</p>
                  <p>Teléfono: 0412-5555555</p>
                  <p>Cédula: V-12345678</p>
                </>
              )}
              {paymentMethod === 'card' && (
                <p>
                  Introduce tu referencia de pasarela internacional o punto
                  virtual.
                </p>
              )}
            </div>

            {/* Botón de Confirmar Acción */}
            <button
              type="submit"
              disabled={paying}
              className={`w-full py-4 rounded-xl font-bold text-black text-lg shadow-lg transition-all ${
                paying
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-yellow-500 hover:bg-yellow-600 active:scale-[0.99] shadow-yellow-500/10'
              }`}
            >
              {paying
                ? 'Procesando Transacción...'
                : `Pagar Orden $${parseFloat(finalTotal).toFixed(2)}`}
            </button>
          </form>
        </div>
      </div>

      {/* 📋 COLUMNA DERECHA: Desglose Final Estático (Toma 1 columna) */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-[#2D1748]/50 border border-purple-900/40 p-6 rounded-2xl shadow-xl space-y-4 sticky top-6">
          <h3 className="text-xl font-bold text-yellow-400 border-b border-white/10 pb-2">
            Resumen Final
          </h3>

          {/* Listado de Entradas */}
          {cart.tickets && cart.tickets.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Boletos Seleccionados
              </h4>
              <ul className="text-sm space-y-1 max-h-32 overflow-y-auto pr-1">
                {cart.tickets.map((t, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between bg-black/20 p-2 rounded-lg text-xs"
                  >
                    <span>
                      Asiento {t.row}
                      {t.column}
                    </span>
                    <span className="font-semibold text-gray-200">
                      ${parseFloat(t.price).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Listado de Dulces/Combos */}
          {cart.products && cart.products.length > 0 && (
            <div className="pt-2">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Artículos de Confitería
              </h4>
              <ul className="text-sm space-y-2 max-h-40 overflow-y-auto pr-1">
                {cart.products.map((p, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between bg-black/20 p-2 rounded-lg text-xs"
                  >
                    <div>
                      <p className="font-medium text-gray-200">{p.name}</p>
                      <span className="text-gray-400">x{p.quantity}</span>
                    </div>
                    <span className="font-semibold self-center">
                      ${(p.price * p.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Desglose de Totales Definitivos de Backend */}
          <div className="border-t border-white/20 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal:</span>
              <span>${parseFloat(finalSubtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>IVA (16%):</span>
              <span>${parseFloat(finalIva).toFixed(2)}</span>
            </div>
            <div className="text-xl font-bold text-yellow-400 flex justify-between pt-2 border-t border-white/5">
              <span>Total a Pagar:</span>
              <span>${parseFloat(finalTotal).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
