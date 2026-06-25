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
  deleteOrderSessionWithRetries,
} from '../../../services/orders.service'
import socketService from '../../../services/socket.service'
import SeatMap from '../../../components/selectSeats/SeatMap'
import SeatLegend from '../../../components/selectSeats/SeatLegend'
import placeholderImg from '../../../assets/images/cinema-stuff-around-popcorn-heart.webp'

const CATEGORIES = ['Todos', 'Popcorn', 'Drinks', 'Combos', 'Candies']
const SEAT_BASE_PRICE = 6

function mapCategory(catId) {
  switch (catId) {
    case 1: return 'Drinks'
    case 2: return 'Popcorn'
    case 3: return 'Candies'
    default: return 'Popcorn'
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

  // ── Ticket selection ──
  const [ticketCounts, setTicketCounts] = useState({ 1: 0, 2: 0, 3: 0 })
  const totalTickets = useMemo(() => Object.values(ticketCounts).reduce((a, b) => a + b, 0), [ticketCounts])
  const selectedSeatIds = useRef([])

  // ── Confectionery ──
  const [products, setProducts] = useState([])
  const [combos, setCombos] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [cartItems, setCartItems] = useState([])

  // ── Payment ──
  const [checkoutData, setCheckoutData] = useState(null)
  const [paying, setPaying] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('transfer')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [referenceError, setReferenceError] = useState(null)
  const [amountInput, setAmountInput] = useState('')
  const [paymentCurrency, setPaymentCurrency] = useState(2)
  const [paymentError, setPaymentError] = useState(null)

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
        try { await deleteOrderSessionWithRetries() } catch {}
        await initializeOrderQuote({ cinema: cinemaId })
        if (cancelled) return

        socketService.connect()
        socketService.on('quote_expired', () => {
          setError('Tu tiempo de compra expiró')
          cancelAll('ttl_expired')
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
        id: p.id, name: p.name,
        price: Number(p.pricing?.final_price ?? p.price ?? 0),
        category: mapCategory(p.product_category),
        image: p.image_url, type: 'product',
      })))
      setCombos(norm(cmbs).map(c => {
        const parts = c._ComboProducts || []
        const hasStock = parts.length === 0 || parts.every(cp => (productStockMap[cp.product] || 0) >= cp.quantity)
        return {
          id: c.id, name: c.name,
          price: Number(c.pricing?.final_price ?? c.price ?? 0),
          category: 'Combos', image: c.image_url, type: 'combo',
          available: hasStock,
        }
      }))
    }).catch(() => {})
  }, [step, showtime])

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
      const existing = prev.find(i => i.id === item.id)
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...item, qty: 1 }]
    })
  }
  const removeFromCart = (id) => setCartItems(prev => prev.filter(i => i.id !== id))
  const updateCartQty = (id, delta) => setCartItems(prev => prev.map(i => {
    if (i.id !== id) return i
    const newQty = Math.max(1, i.qty + delta)
    return { ...i, qty: newQty }
  }))

  const allItems = [...products, ...combos]
  const filteredItems = selectedCategory === 'Todos' ? allItems : allItems.filter(i => i.category === selectedCategory)

  const confectioneryTotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0)

  // ── Ticket prices ──
  const selectedSeatsList = seats.filter(s => s.status === 'selected')
  const ticketsTotal = selectedSeatsList.length * SEAT_BASE_PRICE
  const grandTotal = ticketsTotal + confectioneryTotal

  // ── Checkout ──
  const handleGoToPayment = async () => {
    setStep(4)
    setLoading(true)
    try {
      // Asignar audienceCategoryId según los contadores de tickets
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
      const resp = await createOrderCheckout(payload)
      const data = resp?.data ?? resp
      setCheckoutData(data)
      setAmountInput(data?.total_amount_base_currency ?? data?.total ?? grandTotal)
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
    if (!referenceNumber.trim()) { setReferenceError('Ingresa la referencia'); return }
    setPaying(true)
    try {
      const resp = await registerPayment({
        payment_method: paymentMethod === 'transfer' ? 3 : paymentMethod === 'mobile' ? 4 : 2,
        amount: parseFloat(amountInput),
        currency: paymentCurrency,
        reference_number: referenceNumber.trim(),
        bypass: true,
      })
      const wrapper = resp?.data ?? resp
      const data = wrapper?.data ?? wrapper
      const orderId = data?.orderId ?? data?.order_id ?? data?.id
      const qrCode = data?.qrCode ?? data?.qr_code
      navigate('/order-success', { state: { orderId, qrCode } })
    } catch (e) {
      setPaymentError(e?.response?.data?.message || 'Error al registrar el pago')
    } finally {
      setPaying(false)
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
                  { id: 2, label: 'Niño', price: `$${SEAT_BASE_PRICE.toFixed(2)}` },
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
              <div className="w-3/4 h-2 bg-gradient-to-b from-yellow-400/60 to-transparent rounded-full mb-1" />
              <p className="text-[10px] text-yellow-400/60 uppercase tracking-widest mb-6 font-bold">Pantalla</p>

              <SeatMap seats={seats} onToggle={toggleSeat} />
              <SeatLegend />
            </div>

            {/* Selected seats */}
            {selectedSeatsList.length > 0 && (
              <div className="bg-white/10 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold text-white/70">Asientos seleccionados:</p>
                {selectedSeatsList.map(s => (
                  <div key={s.id} className="flex items-center gap-3">
                    <span className="bg-yellow-400 text-[#1d1430] px-2.5 py-1 rounded-lg font-bold text-xs">{s.label}</span>
                    <span className="text-xs text-yellow-400 font-bold">${SEAT_BASE_PRICE.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-between pt-4">
              <button onClick={() => navigate('/')} className="px-6 py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 text-sm">Cancelar</button>
              <button
                onClick={() => { if (selectedSeatsList.length === totalTickets && totalTickets > 0) setStep(3) }}
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
                const inCart = cartItems.find(i => i.id === p.id)
                return (
                  <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
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
                          <button onClick={() => inCart.qty <= 1 ? removeFromCart(p.id) : updateCartQty(p.id, -1)}
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
                <p className="text-yellow-400 text-lg font-bold">Total: ${grandTotal.toFixed(2)}</p>
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
            <h2 className="text-xl font-bold text-yellow-400">Pago</h2>

            {paymentError && (
              <div className="bg-red-500/20 border border-red-500/40 text-red-300 p-4 rounded-xl text-sm">{paymentError}</div>
            )}

            {/* Summary */}
            <div className="bg-white/10 rounded-2xl p-6 space-y-3">
              <h3 className="font-bold text-yellow-400">Resumen</h3>
              {selectedSeatsList.map(s => (
                <div key={s.id} className="flex justify-between text-sm text-white/80">
                  <span>Asiento {s.label}</span>
                  <span>${SEAT_BASE_PRICE.toFixed(2)}</span>
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
                <span>${grandTotal.toFixed(2)}</span>
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
                    { id: 'card', name: 'Punto de Venta', icon: '💳' },
                  ].map(m => (
                    <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id)}
                      className={`p-3 rounded-xl border text-center text-xs font-medium transition-all ${
                        paymentMethod === m.id ? 'bg-yellow-500/20 border-yellow-400 text-yellow-400' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                      }`}
                    ><span className="text-xl block mb-1">{m.icon}</span>{m.name}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">N° de Referencia</label>
                <input type="text" value={referenceNumber} onChange={e => { setReferenceNumber(e.target.value); setReferenceError(null) }}
                  placeholder="Ej: 0123456789"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400" required />
                {referenceError && <p className="mt-1 text-xs text-red-400">{referenceError}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Monto (Bs.)</label>
                <input type="number" value={amountInput} disabled
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/50 cursor-not-allowed" />
              </div>
              <button type="submit" disabled={paying}
                className="w-full py-4 bg-yellow-500 text-black font-bold rounded-xl text-lg hover:brightness-110 disabled:opacity-50 transition-all">
                {paying ? 'Procesando...' : `Pagar $${grandTotal.toFixed(2)}`}
              </button>
            </form>

            <button onClick={() => setStep(3)} className="w-full py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 text-sm">← Volver a confitería</button>
          </div>
        )}
      </div>
    </div>
  )
}
