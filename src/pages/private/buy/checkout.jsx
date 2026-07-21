import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../../../context/CartContext'

import {
  createOrderCheckout,
  registerPayment,
  getOrderSessionDetails,
  deleteOrderSessionWithRetries,
  getOrderById,
} from '../../../services/orders.service'
import socketService from '../../../services/socket.service'
import useDocumentTitle from '../../../hooks/useDocumentTitle';


export default function Checkout() {
  useDocumentTitle('Pago');

  const { movieId, showtimeId } = useParams()
  const navigate = useNavigate()
  const { cart, getTotals, clearCart } = useCart()

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
  const [referenceError, setReferenceError] = useState(null)
  const [amountInput, setAmountInput] = useState('')
  const [paymentCurrency, setPaymentCurrency] = useState(null)

  const getAmountForCurrency = (data, currency) => {
    const totalBase = parseFloat(
      data?.total_amount_base_currency ??
      data?.total_base_currency ??
      data?.total ??
      data?.subtotal_base_currency ??
      0,
    )

    if (Number.isNaN(totalBase) || !currency) {
      return totalBase || 0
    }

    const rateEntry = data?.exchange_rates?.[currency]
    const rate = rateEntry ? parseFloat(rateEntry.rate ?? rateEntry?.value ?? 0) : currency === data?.system_base_currency ? 1 : 1
    if (Number.isNaN(rate) || rate <= 0) {
      return totalBase
    }

    return totalBase / rate
  }

  useEffect(() => {
    if (!checkoutData) return

    const targetCurrency = paymentMethod === 'loyalty' ? 3 : checkoutData?.system_base_currency ?? 2
    setPaymentCurrency(targetCurrency)
    setAmountInput(getAmountForCurrency(checkoutData, targetCurrency))
  }, [checkoutData, paymentMethod])

  // 🔄 Fase A: Bloquear e inicializar Checkout al cargar la pantalla
  const checkoutStartedRef = useRef(false)
  const lockedByClientRef = useRef(new Set())

  useEffect(() => {
    const initCheckout = async () => {
      try {
        setCheckingOut(true)
        setError(null)
        setCancelError(null)

        checkoutStartedRef.current = true

        // 🧠 Paylod para la peticion
        const payload = {
          tickets: (cart.tickets || []).map((t) => {
            if (!t.bookingId) {
              console.warn(
                '[CHECKOUT INIT] Ticket sin bookingId, revisa si SelectSeats está agregando bookingId correctamente:',
                t,
              )
            }

            return {
              booking: t.bookingId ?? Number(showtimeId),
              seatId: t.originalId || t.id, // ID del asiento de base de datos
              audienceCategoryId: t.audienceCategoryId || 1, // 1 = General por defecto
            }
          }),
          concessions: (cart.products || []).map((p) => ({
            line_type: p.type === 'product' ? 1 : 2, // 1 = Producto Simple, 2 = Combo
            ...(p.type === 'product'
              ? { product: p.productId }
              : { combo: p.productId }),
            quantity: p.quantity,
          })),
        }


        // Asegurar que los locks siguen vigentes: reemitir `lock_seat` y esperar confirmación
        // Inicializar el set local de locks detectados desde el carrito
        try {
          lockedByClientRef.current = new Set((cart.tickets || []).map((t) => t.originalId || t.id))
        } catch (e) {
          lockedByClientRef.current = new Set()
        }

        const seatIds = (payload.tickets || []).map((t) => t.seatId).filter(Boolean)
        if (seatIds.length > 0) {
          try {
            if (!socketService.getSocket()) {
              socketService.connect()
            }
            if (checkoutData) {
              try { await deleteOrderSessionWithRetries() } catch {}
              await initializeOrderQuote({ cinema: showtime?.cinema?.id || 2 })
            }

            // Bloquear todos los asientos en paralelo (backend no admite array todavía, usamos Promise.all)
            // PERO manejando errores silenciosamente para poder identificar cuáles fallaron.
            const waitForSeatLocks = (ids, timeoutMs = 4000) =>
              new Promise(async (resolve) => {
                const pending = new Set(ids)
                const succeeded = new Set()
                const failed = new Set()

                const cleanup = () => {
                  socketService.off('seat_lock_success', onSuccess)
                  socketService.off('seat_lock_error', onError)
                  socketService.off('seat_locked_by_other', onLockedByOther)
                }

                const onSuccess = ({ seatId }) => {
                  if (pending.has(seatId)) {
                    pending.delete(seatId)
                    succeeded.add(seatId)
                    try {
                      lockedByClientRef.current.add(seatId)
                    } catch (e) {}
                  }
                  if (pending.size === 0) {
                    cleanup()
                    resolve({ lockedIds: Array.from(succeeded), failedIds: Array.from(failed) })
                  }
                }

                const onError = ({ seatId }) => {
                  if (pending.has(seatId)) {
                    pending.delete(seatId)
                    failed.add(seatId)
                  }
                  if (pending.size === 0) {
                    cleanup()
                    resolve({ lockedIds: Array.from(succeeded), failedIds: Array.from(failed) })
                  }
                }

                const onLockedByOther = ({ seatId }) => {
                  if (pending.has(seatId)) {
                    pending.delete(seatId)
                    failed.add(seatId)
                  }
                  if (pending.size === 0) {
                    cleanup()
                    resolve({ lockedIds: Array.from(succeeded), failedIds: Array.from(failed) })
                  }
                }

                socketService.on('seat_lock_success', onSuccess)
                socketService.on('seat_lock_error', onError)
                socketService.on('seat_locked_by_other', onLockedByOther)

                // Refrescar locks: los que ya teníamos, marcar como OK.
                // Para los nuevos (o TTL expirado), reenviar lock_seat.
                ids.forEach((id) => {
                  try {
                    socketService.emit('lock_seat', { seatId: id })
                  } catch (e) {
                    console.warn('[CHECKOUT] emit lock_seat fallo para', id, e)
                    // No marcar como fallido — intentar checkout de todos modos
                  }
                })

                // Dar tiempo al backend pero no bloquear por errores de lock
                await new Promise((r) => setTimeout(r, 600))
                cleanup()
                resolve({ lockedIds: ids, failedIds: [] })
              })

            const { lockedIds, failedIds } = await waitForSeatLocks(seatIds, 4000)
            if (failedIds && failedIds.length > 0) {
              console.warn('[CHECKOUT] Algunos asientos no pudieron bloquearse:', failedIds)
              setError('Uno o más asientos ya no están disponibles. Por favor revisa tu selección.')
              await attemptCancelOrder('locks_failed')
              setCheckingOut(false)
              return
            }
          } catch (e) {
            console.warn('[CHECKOUT] error al esperar seat_lock_success:', e)
          }
        }
        let response;
        try {
          response = await createOrderCheckout(payload)
        } catch (checkErr) {
          if (checkErr?.response?.status === 409 && checkErr?.response?.data?.message?.includes('cotización')) {
            try { await deleteOrderSessionWithRetries() } catch {}
            await initializeOrderQuote({ cinema: showtime?.cinema?.id || 2 })
            // Reintentar el checkout con la nueva cotización
            response = await createOrderCheckout(payload)
          } else {
            throw checkErr
          }
        }

        setCheckoutData(response)
        setRemainingBalance(null)
        // Prefer backend-provided base-currency totals when available.
        const respData = response?.data ?? response
        const totalBase =
          respData?.total_amount_base_currency ??
          respData?.total_base_currency ??
          respData?.total ??
          response?.total
        const currencyFromResp =
          respData?.system_base_currency ??
          respData?.currency ??
          respData?.currency_id ??
          null



        if (typeof totalBase !== 'undefined') {
          setAmountInput(getAmountForCurrency(respData, Number(currencyFromResp ?? 2)))
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

        console.error('Error detallado en el checkout inicial:', err)
        console.error('Mensaje del error:', err?.message)
        console.error('Respuesta del servidor:', err?.response?.data)

        // No cancelar la sesión — el usuario puede reintentar
        const status = err?.response?.status
        if (status === 409) {
          setError('Uno o más asientos ya no están disponibles. Vuelve a seleccionar.')
          // No cancelamos — dejamos que el usuario decida
        } else {
          setError('No pudimos procesar tu orden. Inténtalo de nuevo o regresa.')
        }
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
  }, [
    cart.tickets.length,
    cart.products.length,
    cart.products,
    getTotals,
    navigate,
  ])

  // Fase B: Registrar el Pago definitivo
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  const normalizeOrderResponse = (payload) => payload?.data ?? payload

  const isOrderComplete = (order) => {
    if (!order) return false
    const statusValue = order?.order_status ?? order?.status
    const hasQr = Boolean(order?.qr_code || order?.qrCode || order?.qr)

    // order_status values:
    // 1 = Pendiente de Pago
    // 2 = Pagada
    // 3 = Cancelada
    // 4 = Completada
    return Boolean(hasQr || Number(statusValue) === 4)
  }

  const waitForCompletedOrder = async (
    orderId,
    attempts = 6,
    intervalMs = 1200,
  ) => {
    let lastOrder = null

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const response = await getOrderById(orderId)
        const order = normalizeOrderResponse(response)
        lastOrder = order

        if (isOrderComplete(order)) {
          return order
        }
      } catch (err) {
        console.warn(
          `[CHECKOUT] getOrderById attempt ${attempt} failed for order ${orderId}:`,
          err?.message ?? err,
        )
      }

      if (attempt < attempts) {
        await sleep(intervalMs)
      }
    }

    return lastOrder
  }

  const waitForCancellationConfirmation = async (
    attempts = 3,
    intervalMs = 1000,
  ) => {
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
    // Emitir unlock_seat para cada butaca (el servidor espera `unlock_seat`)
    ;(cart.tickets || []).forEach((t) => {
      const seatId = t.originalId || t.id
      socketService.emit('unlock_seat', { seatId })
    })
    socketService.leaveShowtime(showtimeId)
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
    e.preventDefault?.()
    setReferenceError(null)

    const { valid, message } = validateReference(paymentMethod, referenceNumber)
    if (!valid) {
      setReferenceError(message)
      setError(message)
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


      // Normalize response shape: backend returns a wrapper { success, message, data: { ... } }
      const wrapper = response?.data ?? response
      const respData = wrapper?.data ?? wrapper

      const remainingBalance =
        respData?.remaining_balance ??
        respData?.remainingBalance ??
        wrapper?.remaining_balance ??
        wrapper?.remainingBalance

      if (
        typeof remainingBalance !== 'undefined' &&
        remainingBalance !== null
      ) {
        setRemainingBalance(remainingBalance)
        setAmountInput(remainingBalance)
        setError(
          `Pago parcial registrado. Falta pagar $${parseFloat(remainingBalance).toFixed(2)}.`,
        )
        return
      }

      // Accept id under several possible keys, including `id` inside `data`
      const orderId =
        respData?.orderId ??
        respData?.order_id ??
        respData?.id ??
        wrapper?.orderId ??
        wrapper?.order_id ??
        wrapper?.id
      const qrCode =
        respData?.qrCode ??
        respData?.qr_code ??
        respData?.qr_code ??
        respData?.qrcode ??
        respData?.qr ??
        wrapper?.qrCode ??
        wrapper?.qr_code ??
        wrapper?.qrcode



      if (orderId) {

        setError('Pago registrado. Confirmando estado final de la orden...')

        const completedOrder = await waitForCompletedOrder(orderId)
        const resolvedQrCode =
          completedOrder?.qr_code ??
          completedOrder?.qrCode ??
          completedOrder?.qr ??
          qrCode

        if (!completedOrder) {
          setError(
            'Pago registrado, pero no pudimos confirmar la orden finalizada. Por favor espera unos segundos e intenta de nuevo.',
          )
          return
        }

        const orderState = { orderId, qrCode: resolvedQrCode }
        try {
          sessionStorage.setItem('last_order', JSON.stringify(orderState))
        } catch (e) {
          console.warn('Could not write last_order to sessionStorage', e)
        }

        navigate('/order-success', { state: orderState })
        setTimeout(() => clearCart(), 300)
        return
      }

      // No identificador de orden: mostrar error y permitir acción manual del usuario
      console.warn('Payment registered but no order id found in response', {
        wrapper,
        respData,
      })
      setError(
        'No se recibió confirmación de pago. Verifica tu pago o pulsa Forzar cancelación.',
      )
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

  const validateReference = (method, ref) => {
    const value = (ref || '').toString().trim()
    if (!value) {
      return {
        valid: false,
        message:
          'Por favor, ingresa el número de referencia de la transacción.',
      }
    }

    if (method === 'transfer') {
      // Sólo dígitos, 10-12 caracteres
      if (!/^\d{10,12}$/.test(value)) {
        return {
          valid: false,
          message:
            'Referencia de transferencia inválida. Debe contener entre 10 y 12 dígitos.',
        }
      }
    }

    if (method === 'mobile') {
      // Sólo dígitos, 7-11 caracteres
      if (!/^\d{7,11}$/.test(value)) {
        return {
          valid: false,
          message:
            'Referencia de Pago Móvil inválida. Debe contener entre 7 y 11 dígitos.',
        }
      }
    }

    if (method === 'card') {
      // Alfanumérico aceptado, 6-30 caracteres
      if (!/^[A-Za-z0-9\-\_\s]{6,30}$/.test(value)) {
        return {
          valid: false,
          message:
            'Referencia de tarjeta inválida. Use 6-30 caracteres alfanuméricos.',
        }
      }
    }

    return { valid: true }
  }

  const handleReferenceChange = (val) => {
    // Sanitize input depending on payment method
    if (paymentMethod === 'transfer' || paymentMethod === 'mobile') {
      // Keep only digits
      const digits = (val || '').replace(/\D/g, '')
      setReferenceNumber(digits)
      setReferenceError(null)
      setError(null)
      return
    }
    setReferenceNumber(val)
    setReferenceError(null)
    setError(null)
  }

  // Conectar socket desde el servicio para liberar asientos si es necesario
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) return

    socketService.connect()
    socketService.joinShowtime(showtimeId)

    // Conectar handlers usando socketService (evitar nombres de evento inconsistentes)
    const handleSocketPaymentSuccess = async (payload) => {

      const wrapper = payload?.data ?? payload
      const orderId =
        payload?.orderId ??
        payload?.order_id ??
        payload?.id ??
        wrapper?.orderId ??
        wrapper?.order_id ??
        wrapper?.id
      const qrCode =
        payload?.qrCode ??
        payload?.qr_code ??
        payload?.qrcode ??
        wrapper?.qrCode ??
        wrapper?.qr_code ??
        wrapper?.qrcode

      if (!orderId) {
        console.warn('Socket payment_success arrived without orderId', payload)
        return
      }

      const completedOrder = await waitForCompletedOrder(orderId)
      const resolvedQrCode =
        completedOrder?.qr_code ??
        completedOrder?.qrCode ??
        completedOrder?.qr ??
        qrCode

      const orderState = { orderId, qrCode: resolvedQrCode }
      try {
        sessionStorage.setItem('last_order', JSON.stringify(orderState))
      } catch (e) {
        console.warn('Could not write last_order to sessionStorage (socket)', e)
      }

      navigate('/order-success', { state: orderState })
      setTimeout(() => clearCart(), 300)
    }

    socketService.on('payment_success', handleSocketPaymentSuccess)

    socketService.on('billing_required', (payload) => {
      alert('Se requiere facturación para completar la compra.')

    })
    // NOTE: no registrar aquí `seat_lock_success` para logging; el flujo
    // de checkout espera confirmaciones puntuales cuando es necesario.

    return () => {
      // NO llamar leaveShowtime — mantener contexto para reintentos
      socketService.off('payment_success')
      socketService.off('billing_required')
      socketService.off('seat_lock_success')
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
                    onClick={() => {
                      setPaymentMethod(method.id)
                      setReferenceNumber('')
                      setReferenceError(null)
                      setError(null)
                    }}
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
                  inputMode={paymentMethod === 'card' ? 'text' : 'numeric'}
                  pattern={paymentMethod === 'card' ? undefined : '\\d*'}
                  value={referenceNumber}
                  onChange={(e) => handleReferenceChange(e.target.value)}
                  placeholder={
                    paymentMethod === 'transfer'
                      ? 'Ej: 0123456789 (10-12 dígitos)'
                      : paymentMethod === 'mobile'
                        ? 'Ej: 04125555555 (7-11 dígitos)'
                        : 'Ej: TRX-1234AB (6-30 caracteres)'
                  }
                  aria-invalid={referenceError ? 'true' : 'false'}
                  className="w-full bg-[#2a1b4e] border border-gray-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-colors placeholder:text-gray-500"
                  required
                />
                {referenceError && (
                  <p className="mt-2 text-xs text-red-300">{referenceError}</p>
                )}
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
                  Pago parcial detectado. Faltan{' '}
                  <span className="font-bold">
                    ${parseFloat(remainingBalance).toFixed(2)}
                  </span>{' '}
                  por pagar. Si ya realizaste el abono, vuelve a intentar o
                  cancela la orden.
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
                      onClick={() =>
                        window.open(
                          'mailto:soporte@cineflix.com?subject=Ayuda%20cancelación%20de%20orden',
                          '_blank',
                        )
                      }
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
