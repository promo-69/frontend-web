import { useState, useEffect, useMemo, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getShowtimeById,
  getSeatMap,
} from '../../../services/showtimes.service'
import {
  getConcessionProducts,
  getConcessionCombos,
} from '../../../services/concessions.service'
import {
  initializeOrderQuote,
  createOrderCheckout,
  registerPayment,
  getOrderSession,
  getOrderSessionDetails,
  deleteOrderSessionWithRetries,
  getOrderById,
} from '../../../services/orders.service'
import socketService from '../../../services/socket.service'
import SeatMap from '../../../components/selectSeats/SeatMap'
import SeatLegend from '../../../components/selectSeats/SeatLegend'
import placeholderImg from '../../../assets/images/cinema-stuff-around-popcorn-heart.webp'
import api from '../../../api/axios'

const CATEGORIES = ['Todos', 'Palomitas', 'Bebidas', 'Combos', 'Dulces']
const SEAT_BASE_PRICE = 6

function mapCategory(catId) {
  switch (catId) {
    case 1: return 'Bebidas'
    case 2: return 'Palomitas'
    case 3: return 'Dulces'
    default: return 'Palomitas'
  }
}

export default function UnifiedPurchase() {
  const { movieId, showtimeId } = useParams()
  const navigate = useNavigate()

  // ── Steps ──
  const [step, setStep] = useState(1) // 1=showtime, 2=seats, 3=confect, 4=payment
  const stoppedRef = useRef(false)

  // ── Showtime data ──
  const [showtime, setShowtime] = useState(null)
  const [seats, setSeats] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ── Quote / Session ──
  const [quoteReady, setQuoteReady] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const quoteTimerRef = useRef(null)
  const lastSessionReset = useRef(0)

  // ── Ticket selection ──
  const [ticketCounts, setTicketCounts] = useState({ 1: 0, 2: 0, 3: 0 })
  const totalTickets = useMemo(() => Object.values(ticketCounts).reduce((a, b) => a + b, 0), [ticketCounts])
  const selectedSeatIds = useRef([])
  const savedGrandTotalRef = useRef(0)
  const savedGrandTotalBsRef = useRef(0)
  const savedSeatsRef = useRef([])
  const savedCartItemsRef = useRef([])
  const savedSeatPriceRef = useRef(SEAT_BASE_PRICE)
  const paymentSnapshotRef = useRef(null)

  // ── Confectionery ──
  const [products, setProducts] = useState([])
  const [combos, setCombos] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [cartItems, setCartItems] = useState([])

  // ── Payment ──
  const [checkoutData, setCheckoutData] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('transfer')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [referenceError, setReferenceError] = useState(null)
  const [amountInput, setAmountInput] = useState('')
  const [paymentCurrency, setPaymentCurrency] = useState(2)
  const [exchangeRate, setExchangeRate] = useState(600)
  const [paymentError, setPaymentError] = useState(null)

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
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [paymentResult, setPaymentResult] = useState(null)
  const [paymentSnapshot, setPaymentSnapshot] = useState(null)
  const [selectedBank, setSelectedBank] = useState('')
  const [bankAccounts, setBankAccounts] = useState([])

  const normalizeOrderResponse = (payload) => payload?.data ?? payload

  const extractOrderId = (payload) => {
    if (!payload) return null
    const raw = payload?.data ?? payload
    return (
      raw?.orderId ??
      raw?.order_id ??
      raw?.id ??
      raw?.order?.id ??
      raw?.order?.order_id ??
      raw?.order?.orderId ??
      null
    )
  }

  const extractQrCode = (payload) => {
    if (!payload) return null
    const raw = payload?.data ?? payload
    return (
      raw?.qrCode ??
      raw?.qr_code ??
      raw?.qrcode ??
      raw?.qr ??
      raw?.order?.qr_code ??
      raw?.order?.qrCode ??
      raw?.order?.qr ??
      null
    )
  }

  const resolveOrderIdFromSessionDetails = async () => {
    try {
      const details = await getOrderSessionDetails()
      const order = details?.data?.order ?? details?.data
      return extractOrderId(order)
    } catch (err) {
      console.warn('[UnifiedPurchase] getOrderSessionDetails fallback failed:', err?.message ?? err)
      return null
    }
  }

  const isOrderComplete = (order) => {
    if (!order) return false
    const statusValue = order?.order_status ?? order?.status
    return Number(statusValue) === 4 || Boolean(order?.qr_code || order?.qrCode || order?.qr)
  }

  const waitForCompletedOrder = async (orderId, attempts = 6, intervalMs = 1200) => {
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
          `[UnifiedPurchase] getOrderById attempt ${attempt} failed for order ${orderId}:`,
          err?.message ?? err,
        )
      }
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs))
      }
    }
    return lastOrder
  }

  // ── Load showtime + seat map + init quote ──
  useEffect(() => {
    if (!showtimeId || stoppedRef.current) return
    let cancelled = false
    async function init() {
      try {
        setLoading(true)
        const [st, map] = await Promise.all([
          getShowtimeById(showtimeId),
          getSeatMap(showtimeId),
        ])
        if (cancelled) return
        setShowtime(st)
        setSeats(map.seats || [])

        const cinemaId = st?.cinema?.id || 2
        // Cancelar sesión previa si existe
        socketService.suppressExpiredToast()
        try { await deleteOrderSessionWithRetries() } catch {}
        await initializeOrderQuote({ cinema: cinemaId })
        lastSessionReset.current = Date.now()
        setTimeout(() => socketService.unsuppressExpiredToast(), 3000)
        if (cancelled) return

        // Obtener tasa de cambio de la sesión
        const sessionState = await getOrderSession().catch(() => null)
        const usdRate = sessionState?.data?.exchange_rates?.["1"]?.rate || sessionState?.exchange_rates?.["1"]?.rate
        if (usdRate) setExchangeRate(Number(usdRate))

        socketService.connect()
        socketService.on('quote_expired', () => {
          if (lastSessionReset.current && Date.now() - lastSessionReset.current < 8000) return
          setError('Tu tiempo de compra expiró')
          cancelAll('ttl_expired')
        })

        // Payment WebSocket events
        socketService.off('payment_success')
        socketService.on('payment_success', async (data) => {
          const orderId = extractOrderId(data)
          const qrCode = extractQrCode(data)
          const remainingBalance = data?.remaining_balance ?? data?.remainingBalance

          const resolvedOrderId = orderId || (await resolveOrderIdFromSessionDetails())
          // Tolerancia de redondeo: saldo < 0.10 se considera pago completo
          if (resolvedOrderId && (remainingBalance == null || Number(remainingBalance) < 0.10)) {
            const completedOrder = await waitForCompletedOrder(resolvedOrderId)
            const resolvedQrCode = extractQrCode(completedOrder) || qrCode
            if (completedOrder && isOrderComplete(completedOrder)) {
              navigate('/order-success', { state: { orderId: resolvedOrderId, qrCode: resolvedQrCode, summary: getOrderSummary() } })
              return
            }
          }

          setPaymentProcessing(false)
          setPaymentResult({ success: true, partial: true, remainingBalance, message: data.message })
        })
        socketService.off('payment_completed')
        socketService.on('payment_completed', async (data) => {
          const orderId = extractOrderId(data)
          const qrCode = extractQrCode(data)

          const resolvedOrderId = orderId || (await resolveOrderIdFromSessionDetails())
          if (resolvedOrderId) {
            const completedOrder = await waitForCompletedOrder(resolvedOrderId)
            const resolvedQrCode = extractQrCode(completedOrder) || qrCode
            if (completedOrder && isOrderComplete(completedOrder)) {
              navigate('/order-success', { state: { orderId: resolvedOrderId, qrCode: resolvedQrCode, summary: getOrderSummary() } })
              return
            }
          }

          setPaymentProcessing(false)
          setPaymentResult({ success: true, ...data })
        })
        socketService.off('payment_failed')
        socketService.on('payment_failed', (data) => {
          setPaymentProcessing(false)
          setPaymentResult({ success: false, ...data })
        })
        socketService.off('billing_required')
        socketService.on('billing_required', (data) => {
          setPaymentProcessing(false)
          setPaymentResult({ success: true, billing: true, ...data })
        })

        setQuoteReady(true)
        setStep(2)
      } catch (e) {
        if (!cancelled) setError('No se pudo iniciar la sesión de compra')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()
    return () => { cancelled = true }
  }, [showtimeId])

  // ── Timer ──
  useEffect(() => {
    if (!quoteReady) return
    getOrderSession().then(s => {
      const ttl = s?.data?.expires_in || 600
      setTimeLeft(ttl)
    }).catch(() => {})
  }, [quoteReady])

  useEffect(() => {
    if (timeLeft <= 0) return
    quoteTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(quoteTimerRef.current); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(quoteTimerRef.current)
  }, [timeLeft > 0])

  // ── Join showtime room + seat events ──
  useEffect(() => {
    if (!quoteReady || !showtimeId) return
    socketService.connect()
    socketService.joinShowtime(showtimeId)

    const onJoinError = ({ message }) => {
      console.warn('[Socket] join_error:', message)
      setTimeout(() => socketService.joinShowtime(showtimeId, true), 800)
    }

    const onSeatLockSuccess = ({ seatId }) => {
      setSeats(prev => prev.map(s => s.id === seatId ? { ...s, status: 'selected' } : s))
    }

    const onSeatLockError = ({ seatId }) => {
      setSeats(prev => prev.map(s => s.id === seatId ? { ...s, status: 'sold' } : s))
    }

    const onSeatLockedByOther = ({ seatId }) => {
      setSeats(prev => prev.map(s => s.id === seatId ? { ...s, status: 'sold' } : s))
    }

    const onSeatUnlocked = ({ seatId }) => {
      setSeats(prev => prev.map(s => s.id === seatId ? { ...s, status: 'available' } : s))
    }

    const onSeatsUnlocked = ({ seatIds }) => {
      const idSet = new Set(seatIds)
      setSeats(prev => prev.map(s => idSet.has(s.id) ? { ...s, status: 'available' } : s))
    }

    socketService.on('join_error', onJoinError)
    socketService.on('seat_lock_success', onSeatLockSuccess)
    socketService.on('seat_lock_error', onSeatLockError)
    socketService.on('seat_locked_by_other', onSeatLockedByOther)
    socketService.on('seat_unlocked', onSeatUnlocked)
    socketService.on('seats_unlocked', onSeatsUnlocked)

    return () => {
      socketService.off('join_error', onJoinError)
      socketService.off('seat_lock_success', onSeatLockSuccess)
      socketService.off('seat_lock_error', onSeatLockError)
      socketService.off('seat_locked_by_other', onSeatLockedByOther)
      socketService.off('seat_unlocked', onSeatUnlocked)
      socketService.off('seats_unlocked', onSeatsUnlocked)
    }
  }, [quoteReady, showtimeId])

  // ── Load bank accounts for payment ──
  useEffect(() => {
    if (!quoteReady) return
    api.get('/payments/options').then(res => {
      const options = res?.data?.data || []
      const allBanks = []
      options.forEach(opt => {
        (opt._BankAccounts || []).forEach(ba => {
          allBanks.push({
            id: ba.id,
            bank: ba.bank,
            payment_method: opt.id,
            name: ba._Banks?.name || ('Banco ' + ba.bank),
            payment_details: ba.payment_details
          })
        })
      })
      setBankAccounts(allBanks)
    }).catch(() => {})
  }, [quoteReady])

  // ── Load confectionery ──
  useEffect(() => {
    if (step !== 3) return
    const cinemaId = showtime?.cinema?.id || 2
    Promise.all([
      getConcessionProducts(cinemaId),
      getConcessionCombos(cinemaId),
    ]).then(([prods, cmbs]) => {
      const norm = (resp) => {
        if (!resp) return []
        if (Array.isArray(resp)) return resp
        if (Array.isArray(resp.data)) return resp.data
        return []
      }
      const productList = norm(prods)
      const productStockMap = {}
      productList.forEach(p => { productStockMap[p.id] = p.stock ?? 0 })

      setProducts(productList.map(p => ({
        id: p.id, name: p.name, uniqueId: `prod-${p.id}`,
        price: Number(p.pricing?.final_price ?? p.price ?? 0),
        category: mapCategory(p.product_category),
        image: p.image_url, type: 'product',
        available: (p.stock ?? 0) > 0,
      })))
      setCombos(norm(cmbs).map(c => {
        const parts = c._ComboProducts || []
        const hasStock = parts.length === 0 || parts.every(cp => (productStockMap[cp.product] || 0) >= cp.quantity)
        return {
          id: c.id, name: c.name, uniqueId: `combo-${c.id}`,
          price: Number(c.pricing?.final_price ?? c.price ?? 0),
          category: 'Combos', image: c.image_url, type: 'combo',
          available: hasStock,
        }
      }))
    }).catch(() => {})
  }, [step, showtime])

  // Helper para resumen de orden
  const getOrderSummary = () => {
    const snap = paymentSnapshotRef.current
    if (snap) return snap
    return {
      movie: showtime?.movie?.title,
      showtime: showtime?.booking?.start_time ? new Date(showtime.booking.start_time).toLocaleString('es-VE', { hour: '2-digit', minute: '2-digit' }) + ' · Sala ' + showtime?.booking?.room : '',
      seats: selectedSeatsList.map(s => s.label || s.id),
      concessions: cartItems.map(c => ({ name: c.name, qty: c.qty, subtotal: c.price * c.qty })),
      total: grandTotal,
      totalBs: grandTotalBs,
    }
  }

  // ── Cancel ──
  const cancelAll = async (reason) => {
    stoppedRef.current = true
    try { await deleteOrderSessionWithRetries() } catch {}
    socketService.disconnect()
    navigate('/')
  }

  // ── Seat toggle ──
  const toggleSeat = (seatId) => {
    const seat = seats.find(s => s.id === seatId)
    if (!seat || seat.status === 'sold' || seat.status === 'maintenance') return
    if (seat.status === 'selected') {
      socketService.emit('unlock_seat', { seatId })
      setSeats(prev => prev.map(s => s.id === seatId ? { ...s, status: 'available' } : s))
      selectedSeatIds.current = selectedSeatIds.current.filter(id => id !== seatId)
    } else {
      if (selectedSeatIds.current.length >= totalTickets) return
      socketService.emit('lock_seat', { seatId })
      setSeats(prev => prev.map(s => s.id === seatId ? { ...s, status: 'selected' } : s))
      selectedSeatIds.current.push(seatId)
    }
  }

  const handleTicketIncrement = (catId) => setTicketCounts(prev => ({ ...prev, [catId]: prev[catId] + 1 }))
  const handleTicketDecrement = (catId) => setTicketCounts(prev => {
    if (prev[catId] <= 0) return prev
    return { ...prev, [catId]: prev[catId] - 1 }
  })

  // ── Confectionery actions ──
  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.uniqueId === item.uniqueId)
      if (existing) return prev.map(i => i.uniqueId === item.uniqueId ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...item, qty: 1 }]
    })
  }
  const removeFromCart = (uniqueId) => setCartItems(prev => prev.filter(i => i.uniqueId !== uniqueId))
  const updateCartQty = (uniqueId, delta) => setCartItems(prev => prev.map(i => {
    if (i.uniqueId !== uniqueId) return i
    const newQty = Math.max(1, i.qty + delta)
    return { ...i, qty: newQty }
  }))

  const allItems = [...products, ...combos]
  const filteredItems = selectedCategory === 'Todos' ? allItems : allItems.filter(i => i.category === selectedCategory)

  const confectioneryTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0)

  // ── Ticket prices ──
  const selectedSeatsList = seats.filter(s => s.status === 'selected')

  const getSeatPrice = (index) => {
    const audienceQueue = []
    Object.entries(ticketCounts).forEach(([catId, count]) => {
      for (let i = 0; i < count; i++) audienceQueue.push(Number(catId))
    })
    const catId = audienceQueue[index] || 1
    if (catId === 2) return SEAT_BASE_PRICE * 0.8
    if (catId === 3) return SEAT_BASE_PRICE * 0.9
    return SEAT_BASE_PRICE
  }

  const ticketsTotal = selectedSeatsList.reduce((sum, _, index) => sum + getSeatPrice(index), 0)
  const grandTotal = ticketsTotal + confectioneryTotal
  const safeExchangeRate = exchangeRate && exchangeRate > 0 ? exchangeRate : 600
  const grandTotalBs = grandTotal > 0 ? grandTotal * safeExchangeRate : (parseFloat(amountInput) || grandTotal * safeExchangeRate)

  const handleSeatsConfirm = () => {
    if (selectedSeatsList.length !== totalTickets || totalTickets === 0) return
    setStep(3)
  }

  // ── Checkout ──
  const handleGoToPayment = async () => {
    setStep(4)
    setLoading(true)
    setPaymentError(null)
    try {
      if (checkoutData) {
        socketService.off('quote_expired')
        socketService.suppressExpiredToast()
        try {
          try { await deleteOrderSessionWithRetries() } catch {}
          await initializeOrderQuote({ cinema: showtime?.cinema?.id || 2 })
        } finally {
          lastSessionReset.current = Date.now()
          socketService.on('quote_expired', () => {
            if (Date.now() - lastSessionReset.current < 5000) return
            setError('Tu tiempo de compra expiró')
            cancelAll('ttl_expired')
          })
          setTimeout(() => socketService.unsuppressExpiredToast(), 3000)
        }
      }

      // Refrescar locks antes del checkout
      selectedSeatsList.forEach(s => socketService.emit('lock_seat', { seatId: s.id }))
      await new Promise(r => setTimeout(r, 300))

      const audienceQueue = []
      Object.entries(ticketCounts).forEach(([catId, count]) => {
        for (let i = 0; i < count; i++) audienceQueue.push(Number(catId))
      })
      const payload = {
        tickets: selectedSeatsList.map((s, i) => ({
          booking: showtime?.booking?.id || showtime?.room_booking_id,
          seatId: s.id,
          audienceCategoryId: audienceQueue[i] || 1,
        })),
        concessions: cartItems.map(i => ({
          line_type: i.type === 'combo' ? 2 : 1,
          ...(i.type === 'combo' ? { combo: i.id } : { product: i.id }),
          quantity: i.qty,
        })),
      }
      let resp
      try {
        resp = await createOrderCheckout(payload)
      } catch (checkErr) {
        // Si el servidor indica que la cotización ya no está disponible (ej. por un intento anterior que quedó en PENDING_PAYMENT)
        if (checkErr?.response?.status === 409) {
          socketService.off('quote_expired')
          socketService.suppressExpiredToast()
          try {
            try { await deleteOrderSessionWithRetries() } catch {}
            await initializeOrderQuote({ cinema: showtime?.cinema?.id || 2 })
          } finally {
            lastSessionReset.current = Date.now()
            socketService.on('quote_expired', () => {
              if (Date.now() - lastSessionReset.current < 5000) return
              setError('Tu tiempo de compra expiró')
              cancelAll('ttl_expired')
            })
            setTimeout(() => socketService.unsuppressExpiredToast(), 3000)
          }
          // Volver a asegurar los locks
          selectedSeatsList.forEach(s => socketService.emit('lock_seat', { seatId: s.id }))
          await new Promise(r => setTimeout(r, 300))
          // Reintentar el checkout con la nueva cotización
          resp = await createOrderCheckout(payload)
        } else {
          throw checkErr
        }
      }

      const data = resp?.data ?? resp
      setCheckoutData(data)
      setAmountInput(getAmountForCurrency(data, data?.system_base_currency ?? 2))
      setPaymentCurrency(data?.system_base_currency ?? 2)
    } catch (e) {
      setPaymentError(e?.response?.data?.message || 'Error al procesar la orden')
      setStep(3)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (e) => {
    e?.preventDefault()
    if (paymentMethod !== 'loyalty' && !referenceNumber.trim()) { setReferenceError('Ingresa la referencia'); return }
    setPaymentProcessing(true)
    setPaymentResult(null)
    setPaymentError(null)
    // Guardar totales al momento del pago
    savedGrandTotalRef.current = grandTotal
    savedGrandTotalBsRef.current = grandTotalBs
    savedSeatsRef.current = selectedSeatsList.map((s, i) => ({ label: s.label || s.id, id: s.id, price: getSeatPrice(i) }))
    savedCartItemsRef.current = [...cartItems]
    savedSeatPriceRef.current = SEAT_BASE_PRICE
    setPaymentSnapshot({
      movie: showtime?.movie?.title,
      showtimeInfo: showtime?.booking?.start_time ? new Date(showtime.booking.start_time).toLocaleString('es-VE', { hour: '2-digit', minute: '2-digit' }) + ' · Sala ' + (showtime?.booking?.room || '') : '',
      seats: selectedSeatsList.map((s, i) => ({ label: s.label || s.id, id: s.id, price: getSeatPrice(i) })),
      cartItems: [...cartItems],
      seatPrice: SEAT_BASE_PRICE,
      grandTotal,
      grandTotalBs,
      paymentMethod,
      referenceNumber,
      ticketsTotal,
      confectioneryTotal,
    })
    paymentSnapshotRef.current = {
      movie: showtime?.movie?.title,
      showtime: showtime?.booking?.start_time ? new Date(showtime.booking.start_time).toLocaleString('es-VE', { hour: '2-digit', minute: '2-digit' }) + ' · Sala ' + (showtime?.booking?.room || '') : '',
      seats: selectedSeatsList.map(s => s.label || s.id),
      concessions: cartItems.map(c => ({ name: c.name, qty: c.qty, subtotal: c.price * c.qty })),
      total: grandTotal,
      totalBs: grandTotalBs,
    }
    try {
      const payload = {
        payment_method: paymentMethod === 'transfer' ? 3 : paymentMethod === 'mobile' ? 4 : 5,
        amount: parseFloat(amountInput),
        currency: paymentCurrency,
      }
      if (paymentMethod !== 'loyalty') {
        payload.reference_number = referenceNumber.trim()
        if (selectedBank) payload.bank = selectedBank
      }
      const resp = await registerPayment(payload)
      const wrapper = resp?.data ?? resp
      const data = wrapper?.data ?? wrapper
      let orderId = extractOrderId(data)
      const qrCode = extractQrCode(data)

      if (!orderId) {
        orderId = await resolveOrderIdFromSessionDetails()
        if (orderId) {

        }
      }



      if (orderId) {
        const completedOrder = await waitForCompletedOrder(orderId)
        const resolvedQrCode = extractQrCode(completedOrder) || qrCode

        if (completedOrder && isOrderComplete(completedOrder)) {
          navigate('/order-success', { state: { orderId, qrCode: resolvedQrCode, summary: getOrderSummary() } })
          return
        }
      }

      // Si la orden aún no está completamente procesada, dejamos que el WebSocket maneje el resultado

    } catch (e) {
      setPaymentProcessing(false)
      setPaymentError(e?.response?.data?.message || 'Error al registrar el pago')
    }
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gradient-to-b from-[#231640] via-[#7B1A82] to-[#231640]">
        <p className="animate-pulse text-lg">Cargando...</p>
      </div>
    )
  }

  // ── Error ──
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white bg-gradient-to-b from-[#231640] via-[#7B1A82] to-[#231640] px-6">
        <h1 className="text-2xl font-bold mb-4">Error</h1>
        <p className="text-center mb-6">{error}</p>
        <button onClick={() => navigate('/')} className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-bold">
          Volver al inicio
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white pb-20" style={{ background: 'linear-gradient(to bottom, #231640 0%, #7B1A82 50%, #231640 100%)' }}>
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Timer */}
        {timeLeft > 0 && (
          <div className={`text-right text-sm font-bold ${timeLeft <= 60 ? 'text-red-400' : 'text-white/60'}`}>
            ⏱ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
        )}

        {/* Step 2: Seats */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in">
            {/* Header */}
            <div className="flex items-start justify-between bg-white/10 rounded-2xl p-6">
              <div>
                <h2 className="text-2xl font-bold text-yellow-400">{showtime?.movie?.title || 'Película'}</h2>
                <p className="text-white/70 text-sm mt-1">{showtime?.booking?.start_time ? new Date(showtime.booking.start_time).toLocaleString('es-VE', { hour: '2-digit', minute: '2-digit' }) : ''} · Sala {showtime?.booking?.room || ''}</p>
              </div>
              <div className="text-right">
                <p className="text-yellow-400 font-bold text-2xl">${ticketsTotal.toFixed(2)}</p>
                <p className="text-white/60 text-xs">{totalTickets} boleto{totalTickets !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Ticket counters */}
            <div className="bg-white/10 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider">Cantidad de boletos</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 1, label: 'Adulto', price: `$${SEAT_BASE_PRICE.toFixed(2)}` },
                  { id: 2, label: 'Niño', price: `$${(SEAT_BASE_PRICE * 0.8).toFixed(2)}` },
                  { id: 3, label: '3ra Edad', price: `$${(SEAT_BASE_PRICE * 0.9).toFixed(2)}` },
                ].map(cat => (
                  <div key={cat.id} className="bg-white/5 rounded-xl p-4 text-center space-y-2">
                    <p className="text-sm font-bold">{cat.label}</p>
                    <p className="text-xs text-white/50">{cat.price}</p>
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => handleTicketDecrement(cat.id)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 font-bold">-</button>
                      <span className="font-bold w-6 text-center">{ticketCounts[cat.id]}</span>
                      <button onClick={() => handleTicketIncrement(cat.id)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 font-bold">+</button>
                    </div>
                  </div>
                ))}
              </div>
              {totalTickets === 0 && <p className="text-xs text-white/50 text-center">Selecciona cuántos boletos de cada tipo</p>}
            </div>

            {/* Screen */}
            <div className="flex flex-col items-center">
              <div className="mt-5" />

              <SeatMap seats={seats} onToggle={toggleSeat} />
              <SeatLegend />
            </div>

            {/* Selected seats */}
            {selectedSeatsList.length > 0 && (
              <div className="bg-white/10 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-white/70">Asientos seleccionados:</p>
                {selectedSeatsList.map((s, index) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <span className="bg-yellow-400 text-[#1d1430] px-2.5 py-1 rounded-lg font-bold text-xs">{s.label}</span>
                    <span className="text-xs text-yellow-400 font-bold">${getSeatPrice(index).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-between pt-4">
              <button onClick={() => navigate('/')} className="px-6 py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 text-sm">Cancelar</button>
              <button
                onClick={handleSeatsConfirm}
                disabled={selectedSeatsList.length !== totalTickets || totalTickets === 0}
                className="px-8 py-3 bg-yellow-500 text-black font-bold rounded-xl text-sm uppercase tracking-wider disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all"
              >
                Continuar → Confitería
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confectionery */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold text-yellow-400">Confitería</h2>

            {paymentError && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-300 p-4 rounded-xl text-sm">
                {paymentError}
              </div>
            )}

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-t-lg transition-all whitespace-nowrap font-medium ${
                    selectedCategory === cat ? 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-400' : 'text-white/60 hover:text-white'
                  }`}
                >{cat}</button>
              ))}
            </div>

            {/* Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredItems.map(p => {
                const inCart = cartItems.find(i => i.uniqueId === p.uniqueId)
                return (
                  <div key={p.uniqueId} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                    <div className="h-36 bg-black/30 flex items-center justify-center">
                      <img src={p.image || placeholderImg} alt={p.name} className="w-full h-full object-cover" onError={e => { e.target.onerror = null; e.target.src = placeholderImg }} />
                    </div>
                    <div className="p-4 flex flex-col flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-sm">{p.name}</h3>
                        <span className="text-yellow-400 font-bold whitespace-nowrap">${p.price.toFixed(2)}</span>
                      </div>
                      {p.available === false ? (
                        <span className="mt-auto w-full bg-red-500/20 text-red-400 py-2 rounded-xl font-semibold text-sm text-center">No disponible</span>
                      ) : inCart ? (
                        <div className="flex items-center justify-between bg-white/10 rounded-xl p-1 mt-auto">
                          <button onClick={() => inCart.qty <= 1 ? removeFromCart(p.uniqueId) : updateCartQty(p.uniqueId, -1)}
                            className="px-4 py-1 bg-red-500/30 hover:bg-red-500 text-red-300 rounded-lg font-bold">-</button>
                          <span className="font-bold text-yellow-400">{inCart.qty}</span>
                          <button onClick={() => addToCart(p)}
                            className="px-4 py-1 bg-green-500/30 hover:bg-green-500 text-green-300 rounded-lg font-bold">+</button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(p)}
                          className="mt-auto w-full bg-yellow-500 hover:bg-yellow-600 text-black py-2 rounded-xl font-semibold text-sm">Agregar</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Cart summary + buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/10 rounded-xl p-4">
              <div>
                <p className="text-white/70 text-sm">Tickets: <span className="font-bold">${ticketsTotal.toFixed(2)}</span></p>
                <p className="text-white/70 text-sm">Confitería: <span className="font-bold">${confectioneryTotal.toFixed(2)}</span></p>
                <p className="text-yellow-400 text-lg font-bold">Total: ${(savedGrandTotalRef.current || grandTotal).toFixed(2)}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="px-6 py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 text-sm">← Asientos</button>
                <button onClick={handleGoToPayment} disabled={loading}
                  className="px-8 py-3 bg-yellow-500 text-black font-bold rounded-xl text-sm uppercase disabled:opacity-50 hover:brightness-110 transition-all">
                  Continuar → Pago
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Payment */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in max-w-lg mx-auto">
            {paymentProcessing ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-6" />
                <h2 className="text-xl font-bold text-yellow-400">Procesando Pago</h2>
                <p className="text-white/60 text-sm mt-2">Esperando confirmación del sistema...</p>
              </div>
            ) : paymentResult ? (
              paymentResult.success ? (
                paymentResult.partial ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center mb-6 text-3xl">$</div>
                    <h2 className="text-xl font-bold text-amber-400">Pago Parcial</h2>
                    <p className="text-white/60 text-sm mt-2">{paymentResult.message || 'Pago parcial registrado'}</p>
                    {paymentResult.remainingBalance != null && (
                      <p className="text-red-400 font-bold mt-2">Saldo pendiente: ${Number(paymentResult.remainingBalance).toFixed(2)}</p>
                    )}
                    <button onClick={() => navigate('/')} className="mt-6 px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold">Volver al inicio</button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4 text-3xl">✓</div>
                    <h2 className="text-xl font-bold text-green-400">¡Compra Exitosa!</h2>

                    {/* Saved state for display */}
                    {paymentSnapshot && (
                      <div className="mt-5 bg-white/10 rounded-2xl p-5 w-full max-w-sm space-y-3 text-left">
                        {paymentSnapshot.movie && (
                          <div className="pb-3 border-b border-white/10">
                            <p className="font-bold text-yellow-400 text-sm">{paymentSnapshot.movie}</p>
                            <p className="text-white/50 text-xs">{paymentSnapshot.showtimeInfo}</p>
                            {paymentSnapshot.seats.length > 0 && (
                              <div className="flex gap-1 flex-wrap mt-1">
                                {paymentSnapshot.seats.map(s => (
                                  <span key={s.id} className="bg-yellow-400/20 text-yellow-400 px-1.5 py-0.5 rounded text-[10px] font-bold">{s.label}</span>
                                ))}
                              </div>
                            )}
                            <div className="flex justify-between text-xs text-white/50 mt-1">
                              <span>{paymentSnapshot.seats.length} × ${paymentSnapshot.seatPrice.toFixed(2)}</span>
                              <span>${paymentSnapshot.ticketsTotal.toFixed(2)}</span>
                            </div>
                          </div>
                        )}

                        {paymentSnapshot.cartItems.length > 0 && (
                          <div className="pb-3 border-b border-white/10">
                            <p className="text-xs font-semibold text-white/70 mb-1">Confitería</p>
                            {paymentSnapshot.cartItems.map((item, i) => (
                              <div key={i} className="flex justify-between text-xs text-white/50">
                                <span>{item.name} ×{item.qty}</span>
                                <span className="font-medium">${(item.price * item.qty).toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between text-xs text-white/50 mt-1 pt-1 border-t border-white/5">
                              <span>Subtotal confitería</span>
                              <span>${paymentSnapshot.confectioneryTotal.toFixed(2)}</span>
                            </div>
                          </div>
                        )}

                        <div className="pb-3 border-b border-white/10">
                          <p className="text-xs font-semibold text-white/70 mb-1">Método de Pago</p>
                          <p className="text-xs text-white/50 capitalize">
                            {paymentSnapshot.paymentMethod === 'transfer' ? 'Transferencia' : paymentSnapshot.paymentMethod === 'mobile' ? 'Pago Móvil' : 'Puntos'}
                          </p>
                          {paymentSnapshot.referenceNumber && <p className="text-xs text-white/50">Ref: {paymentSnapshot.referenceNumber}</p>}
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white text-sm">Total</span>
                          <div className="text-right">
                            <span className="text-yellow-400 font-bold text-lg">
                              Bs. {paymentSnapshot.grandTotalBs.toFixed(2)}
                            </span>
                            <span className="text-white/40 text-xs block">≈ ${paymentSnapshot.grandTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentResult.billing && (
                      <p className="text-amber-400 text-sm mt-2">Recuerda completar la facturación.</p>
                    )}
                    {paymentResult.orderId && (
                      <button onClick={() => {
                        const summary = getOrderSummary()
                        sessionStorage.setItem('last_order', JSON.stringify({ orderId: paymentResult.orderId, qrCode: paymentResult.qrCode, summary }))
                        navigate(`/order-success?order=${paymentResult.orderId}&qr=${encodeURIComponent(paymentResult.qrCode || '')}`, { state: { orderId: paymentResult.orderId, qrCode: paymentResult.qrCode, summary } })
                      }}
                        className="mt-4 px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold">Ver Comprobante</button>
                    )}
                    <button onClick={() => navigate('/')} className="mt-3 px-6 py-3 border border-white/20 text-white rounded-xl font-bold">Volver al inicio</button>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mb-6 text-3xl">✕</div>
                  <h2 className="text-xl font-bold text-red-400">Error en el Pago</h2>
                  <p className="text-white/60 text-sm mt-2">{paymentResult.message || 'El pago no pudo ser procesado.'}</p>
                  <button onClick={() => { setPaymentResult(null); setStep(3); }} className="mt-6 px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold">Volver a intentar</button>
                </div>
              )
            ) : (
              <>
                <h2 className="text-xl font-bold text-yellow-400">Pago</h2>

                {paymentError && (
                  <div className="bg-red-500/20 border border-red-500/40 text-red-300 p-4 rounded-xl text-sm">{paymentError}</div>
                )}

                {/* Summary */}
                <div className="bg-white/10 rounded-2xl p-6 space-y-3">
                  <h3 className="font-bold text-yellow-400">Resumen</h3>
                  {selectedSeatsList.map((s, index) => (
                    <div key={s.id} className="flex justify-between text-sm text-white/80">
                      <span>Asiento {s.label}</span>
                      <span>${getSeatPrice(index).toFixed(2)}</span>
                    </div>
                  ))}
                  {cartItems.map(i => (
                    <div key={i.id} className="flex justify-between text-sm text-white/80">
                      <span>{i.name} ×{i.qty}</span>
                      <span>${(i.price * i.qty).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xl font-bold text-yellow-400 pt-3 border-t border-white/20">
                    <span>Total</span>
                    <div className="text-right">
                      <span className="block">Bs. {(savedGrandTotalBsRef.current || parseFloat(amountInput || grandTotal)).toFixed(2)}</span>
                      <span className="text-sm text-white/50">${(savedGrandTotalRef.current || grandTotal).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment form */}
                <form onSubmit={handlePayment} className="bg-white/10 rounded-2xl p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Método de Pago</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'transfer', name: 'Transferencia', icon: '🏦' },
                        { id: 'mobile', name: 'Pago Móvil', icon: '📱' },
                        { id: 'loyalty', name: 'Puntos', icon: '⭐' },
                      ].map(m => (
                        <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id)}
                          className={`p-3 rounded-xl border text-center text-xs font-medium transition-all ${
                            paymentMethod === m.id ? 'bg-yellow-500/20 border-yellow-400 text-yellow-400' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                          }`}
                        ><span className="text-xl block mb-1">{m.icon}</span>{m.name}</button>
                      ))}
                    </div>
                  </div>
                  {['transfer', 'mobile'].includes(paymentMethod) && (
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Banco Destino</label>
                      <select value={selectedBank} onChange={e => setSelectedBank(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400">
                        <option value="">Seleccionar banco</option>
                        {bankAccounts.filter(b => {
                          const mId = paymentMethod === 'transfer' ? 3 : paymentMethod === 'mobile' ? 4 : 5
                          return b.payment_method === mId
                        }).map(ba => (
                          <option key={ba.id} value={ba.bank} className="text-black">{ba.name}</option>
                        ))}
                      </select>

                      {/* Detalles de la cuenta bancaria */}
                      {(() => {
                        if (!selectedBank) return null;
                        const mId = paymentMethod === 'transfer' ? 4 : paymentMethod === 'mobile' ? 3 : null;
                        const selectedAccount = bankAccounts.find(b => b.bank.toString() === selectedBank.toString() && b.payment_method === mId);

                        if (!selectedAccount) return null;

                        return (
                          <div className="mt-4 bg-white/5 border border-white/10 p-4 rounded-xl space-y-2">
                            <p className="text-sm text-yellow-400 font-bold mb-2">Datos para {paymentMethod === 'transfer' ? 'Transferencia' : 'Pago Móvil'}</p>
                            {selectedAccount.name && <p className="text-xs text-white/80"><span className="font-semibold text-white/50">Banco:</span> {selectedAccount.name}</p>}
                            {selectedAccount.payment_details && Array.isArray(selectedAccount.payment_details) && selectedAccount.payment_details.map((detail, idx) => (
                              <p key={idx} className="text-xs text-white/80">
                                <span className="font-semibold text-white/50">{detail.label || detail.name}:</span> {detail.value}
                              </p>
                            ))}
                          </div>
                        )
                      })()}
                    </div>
                  )}
                  {paymentMethod !== 'loyalty' && (
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">N° de Referencia</label>
                      <input type="text" value={referenceNumber} onChange={e => { setReferenceNumber(e.target.value); setReferenceError(null) }}
                        placeholder="Ej: 0123456789"
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400" required />
                      {referenceError && <p className="mt-1 text-xs text-red-400">{referenceError}</p>}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                      Monto ({paymentMethod === 'loyalty' ? 'PTS' : 'Bs.'})
                    </label>
                    <input type="number" value={amountInput} disabled
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/50 cursor-not-allowed" />
                  </div>
                  <button type="submit" disabled={paymentProcessing}
                    className="w-full py-4 bg-yellow-500 text-black font-bold rounded-xl text-lg hover:brightness-110 disabled:opacity-50 transition-all">
                    {paymentProcessing ? 'Procesando...' : `Pagar Bs. ${(parseFloat(amountInput) || grandTotalBs).toFixed(2)}`}
                  </button>
                </form>

                <button onClick={() => { setStep(3); setPaymentError(null); }} className="w-full py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 text-sm">← Volver a confitería</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
