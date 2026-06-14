import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../../../context/CartContext'

import {
  createOrderCheckout,
  registerPayment,
  getOrderSessionDetails,
  deleteOrderSessionWithRetries,
} from '../../../services/orders.service'
import { io } from 'socket.io-client'

export default function Checkout() {
  const { movieId, showtimeId } = useParams()
  const navigate = useNavigate()
  const { cart, getTotals, clearCart } = useCart()

  const socketRef = useRef(null)

  // Estados de control del componente
  const [checkingOut, setCheckingOut] = useState(true)
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState(null)
  const [cancelAttempts, setCancelAttempts] = useState(0)
  const [hasCancelled, setHasCancelled] = useState(false)
  const [remainingBalance, setRemainingBalance] = useState(null)

  // Datos devueltos por el backend tras congelar la orden
  const [checkoutData, setCheckoutData] = useState(null)

  // Datos del formulario de pago
  const [paymentMethod, setPaymentMethod] = useState('transfer') // 'card', 'transfer', etc.
  const [referenceNumber, setReferenceNumber] = useState('')
  const [amountInput, setAmountInput] = useState('')
  const [paymentCurrency, setPaymentCurrency] = useState(null)

  // 🔄 Fase A: Bloquear e inicializar Checkout al cargar la pantalla
  const checkoutStartedRef = useRef(false)

  useEffect(() => {
    const initCheckout = async () => {
      try {
        setCheckingOut(true)
        setError(null)
        setCancelError(null)

        checkoutStartedRef.current = true

        // 🧠 Estructuramos el payload exactamente como lo exige tu Backend
        const payload = {
          tickets: (cart.tickets || []).map((t) => ({
            booking: 1, // Tu identificador o id base temporal de reserva
            seatId: t.originalId || t.id, // ID del asiento de base de datos
            audienceCategoryId: t.audienceCategoryId || 1, // 1 = General por defecto
          })),
          concessions: (cart.products || []).map((p) => ({
            line_type: p.type === 'product' ? 1 : 2, // 1 = Producto Simple, 2 = Combo
            ...(p.type === 'product'
              ? { product: p.productId }
              : { combo: p.productId }),
            quantity: p.quantity,
          })),
        }

        // Llamada a la API: POST /orders/checkout
        const response = await createOrderCheckout(payload)

        setCheckoutData(response)
        setRemainingBalance(null)
        // Prefer backend-provided base-currency totals when available.
        const respData = response?.data ?? response
        const totalBase =
          respData?.total_amount_base_currency ?? respData?.total_base_currency ?? respData?.total ?? response?.total
        const currencyFromResp =
          respData?.system_base_currency ?? respData?.currency ?? respData?.currency_id ?? null

        if (typeof totalBase !== 'undefined') {
          setAmountInput(parseFloat(totalBase))
        } else {
          setAmountInput(getTotals().total)
        }

        if (currencyFromResp) {
          setPaymentCurrency(Number(currencyFromResp))
        } else {
          // try to read from cart or fallback to 2
          setPaymentCurrency(2)
        }
      } catch (err) {
        console.error('Error en el checkout inicial:', err)
        setError('No pudimos procesar y asegurar tu orden. Inténtalo de nuevo.')
        await attemptCancelOrder('checkout_init_error')
      } finally {
        setCheckingOut(false)
      }
    }

    if (
      (!cart.tickets || cart.tickets.length === 0) &&
      (!cart.products || cart.products.length === 0)
    ) {
      navigate('/')
      return
    }

    if (!checkoutStartedRef.current) {
      initCheckout()
    }
  }, [cart.tickets.length, cart.products.length, cart.products, getTotals, navigate])

  // Fase B: Registrar el Pago definitivo
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const waitForCancellationConfirmation = async (attempts = 3, intervalMs = 1000) => {
    for (let tryIndex = 1; tryIndex <= attempts; tryIndex += 1) {
      const details = await getOrderSessionDetails()
      const session = details?.data?.session
      if (!session || session?.status !== 'pending_payment') {
        return true
      }
      if (tryIndex < attempts) {
        await sleep(intervalMs)
      }
    }
    return false
  }

  const releaseLocksAndLeave = () => {
    const socket = socketRef.current
    if (!socket) return

    (cart.tickets || []).forEach((t) => {
      const seatId = t.originalId || t.id
      socket.emit('unlockseat', { seatId })
    })
    socket.emit('leaveshowtime', { showtimeId: Number(showtimeId) })
  }

  const attemptCancelOrder = async (reason = 'manual') => {
    if (isCancelling) return false

    setIsCancelling(true)
    setCancelError(null)
    setCancelAttempts((prev) => prev + 1)

    try {
      releaseLocksAndLeave()
      const details = await getOrderSessionDetails()
      const orderId = details?.data?.order?.id
      const orderStatus = details?.data?.order?.order_status

      if (orderId && orderStatus != null) {
        console.log('Cancelación de orden detectada:', { orderId, orderStatus, reason })
      }

      await deleteOrderSessionWithRetries()
      const cancelled = await waitForCancellationConfirmation(5, 1200)

      if (!cancelled) {
        throw new Error('La cancelación no pudo confirmarse en el servidor')
      }

      clearCart()
      navigate('/')
      return true
    } catch (err) {
      console.error('Error cancelando orden:', err)
      setCancelError(
        'No fue posible cancelar automáticamente. Pulsa Forzar cancelación o contacta soporte.',
      )
      return false
    } finally {
      setIsCancelling(false)
    }
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    if (!referenceNumber.trim()) {
      setError('Por favor, ingresa el número de referencia de la transacción.')
      return
    }

    try {
      setPaying(true)
      setError(null)
      setCancelError(null)

      const paymentPayload = {
        payment_method: paymentMethod,
        amount: parseFloat(amountInput),
        currency: paymentCurrency ?? 2,
        reference_number: referenceNumber.trim(),
      }

      const response = await registerPayment(paymentPayload)
      console.log('registerPayment response:', response)

      // Normalize response shape: backend returns a wrapper { success, message, data: { ... } }
      const wrapper = response?.data ?? response
      const respData = wrapper?.data ?? wrapper

      const remainingBalance =
        respData?.remaining_balance ?? respData?.remainingBalance ?? wrapper?.remaining_balance ?? wrapper?.remainingBalance

      if (typeof remainingBalance !== 'undefined' && remainingBalance !== null) {
        setRemainingBalance(remainingBalance)
        setAmountInput(remainingBalance)
        setError(
          `Pago parcial registrado. Falta pagar $${parseFloat(remainingBalance).toFixed(2)}.`,
        )
        return
      }

      // Accept id under several possible keys, including `id` inside `data`
      const orderId =
        respData?.orderId ?? respData?.order_id ?? respData?.id ?? wrapper?.orderId ?? wrapper?.order_id ?? wrapper?.id
      const qrCode =
        respData?.qrCode ?? respData?.qr_code ?? respData?.qr_code ?? respData?.qrcode ?? respData?.qr ?? wrapper?.qrCode ?? wrapper?.qr_code ?? wrapper?.qrcode

      console.log('Normalized payment response:', { wrapper, respData, orderId, qrCode })

      if (orderId) {
        console.log('Payment registered, navigating to success:', { orderId, qrCode })
        // Persist last order to sessionStorage as a fallback in case location.state is lost
        try {
          sessionStorage.setItem('last_order', JSON.stringify({ orderId, qrCode }))
        } catch (e) {
          console.warn('Could not write last_order to sessionStorage', e)
        }
        clearCart()
        navigate('/order-success', { state: { orderId, qrCode } })
        return
      }

      // No identificador de orden: mostrar error y permitir acción manual del usuario
      console.warn('Payment registered but no order id found in response', { wrapper, respData })
      setError('No se recibió confirmación de pago. Verifica tu pago o pulsa Forzar cancelación.')
    } catch (err) {
      console.error('Error registrando el pago:', err)
      const status = err.response?.status
      const message = err.response?.data?.message

      if (status >= 500) {
        setError(
          `Fallo técnico al procesar el pago (${status}). Intentando cancelar la orden...`,
        )
      } else if (status >= 400) {
        setError(
          `Pago rechazado (${status}). Verifica la referencia e intenta nuevamente.`,
        )
      } else {
        setError('Error de red. Intentando cancelar la orden...')
      }

      await attemptCancelOrder('payment_error')
    } finally {
      setPaying(false)
    }
  }

  // Conectar socket para liberar asientos si es necesario y escuchar pagos en la room del usuario
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) return

    const socket = io(import.meta.env.VITE_WS_URL, {
      transports: ['websocket'],
      auth: { token: localStorage.getItem('token') },
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Checkout socket conectado:', socket.id)
      if (showtimeId) {
        socket.emit('joinshowtime', { showtime_id: Number(showtimeId) })
      }
    })

    socket.on('payment_success', (payload) => {
      console.log('socket payment_success payload:', payload)
      // Normalize payload (some backends wrap under `data` or use `id`)
      const wrapper = payload?.data ?? payload
      const orderId = payload?.orderId ?? payload?.order_id ?? payload?.id ?? wrapper?.orderId ?? wrapper?.order_id ?? wrapper?.id
      const qrCode = payload?.qrCode ?? payload?.qr_code ?? payload?.qrcode ?? wrapper?.qrCode ?? wrapper?.qr_code ?? wrapper?.qrcode
      try {
        sessionStorage.setItem('last_order', JSON.stringify({ orderId, qrCode }))
      } catch (e) {
        console.warn('Could not write last_order to sessionStorage (socket)', e)
      }
      clearCart()
      navigate('/order-success', { state: { orderId, qrCode } })
    })

    socket.on('billing_required', (payload) => {
      alert('Se requiere facturación para completar la compra.')
      console.log('billing_required', payload)
    })

    socket.on('seatlocksuccess', ({ seatId }) => {
      console.log('Seat lock success while in checkout:', seatId)
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveshowtime', { showtimeId: Number(showtimeId) })
        socketRef.current.disconnect()
      }
    }
  }, [navigate, clearCart, showtimeId])

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
                  Monto a pagar (Bs.)
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

          {(cancelError || remainingBalance != null) && (
            <div className="mt-6 space-y-3">
              {remainingBalance != null && (
                <div className="bg-yellow-500/10 border border-yellow-400/30 p-4 rounded-xl text-yellow-200">
                  Pago parcial detectado. Faltan <span className="font-bold">${parseFloat(remainingBalance).toFixed(2)}</span> por pagar.
                  Si ya realizaste el abono, vuelve a intentar o cancela la orden.
                </div>
              )}

              {cancelError && (
                <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-200">
                  <p>{cancelError}</p>
                  <div className="mt-3 flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      onClick={() => handlePaymentSubmit(new Event('submit'))}
                      disabled={paying || isCancelling}
                      className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-3 rounded-xl font-semibold"
                    >
                      Reintentar Pago
                    </button>
                    <button
                      type="button"
                      onClick={() => attemptCancelOrder('user_force')}
                      disabled={isCancelling}
                      className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl font-semibold"
                    >
                      Forzar Cancelación
                    </button>
                    <button
                      type="button"
                      onClick={() => window.open('mailto:soporte@cineflix.com?subject=Ayuda%20cancelación%20de%20orden', '_blank')}
                      className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-xl font-semibold"
                    >
                      Contactar Soporte
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
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
