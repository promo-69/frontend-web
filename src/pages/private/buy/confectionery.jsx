import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getConcessionProducts,
  getConcessionCombos,
} from '../../../services/concessions.service'
import {
  initializeOrderQuote,
  createOrderCheckout,
  registerPayment,
  deleteOrderSessionWithRetries,
} from '../../../services/orders.service'
import { getCinemas } from '../../../services/info.service'
import socketService from '../../../services/socket.service'
import api from '../../../api/axios'
import placeholderImg from '../../../assets/images/cinema-stuff-around-popcorn-heart.webp'
import InputSelect from '../../../components/ui/InputSelect'
import useDocumentTitle from '../../../hooks/useDocumentTitle';


const CATEGORIES = ['Todos', 'Palomitas', 'Bebidas', 'Combos', 'Dulces']

function mapCategory(catId) {
  switch (catId) {
    case 1: return 'Bebidas'
    case 2: return 'Palomitas'
    case 3: return 'Dulces'
    default: return 'Palomitas'
  }
}

export default function Confectionery() {
  useDocumentTitle('Confitería');

  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1=products, 2=payment

  const [cinemas, setCinemas] = useState([])
  const [effectiveCinemaId, setEffectiveCinemaId] = useState(null)
  const [products, setProducts] = useState([])
  const [combos, setCombos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [cartItems, setCartItems] = useState([])

  // Payment state
  const [checkingOut, setCheckingOut] = useState(false)
  const [paying, setPaying] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('transfer')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [referenceError, setReferenceError] = useState(null)
  const [amountInput, setAmountInput] = useState('')
  const [paymentCurrency, setPaymentCurrency] = useState(2)
  const [checkoutData, setCheckoutData] = useState(null)
  const [error, setError] = useState(null)
  const [selectedBank, setSelectedBank] = useState('')
  const [bankAccounts, setBankAccounts] = useState([])
  const [paymentResult, setPaymentResult] = useState(null)
  const paidSnapshotRef = useRef(null)

  // Load cinemas
  useEffect(() => {
    getCinemas().then(data => {
      const loadedCinemas = data || []
      setCinemas(loadedCinemas)
      if (loadedCinemas.length > 0) {
        setEffectiveCinemaId(loadedCinemas[0].id)
      }
    }).catch(() => {})
  }, [])

  // Load products when cinema changes
  useEffect(() => {
    if (!effectiveCinemaId) { setLoading(false); return }
    setLoading(true)
    Promise.all([
      getConcessionProducts(effectiveCinemaId),
      getConcessionCombos(effectiveCinemaId),
    ]).then(([prods, cmbs]) => {
      const norm = (r) => Array.isArray(r) ? r : Array.isArray(r?.data) ? r.data : []
      const prodList = norm(prods)
      const stockMap = {}
      prodList.forEach(p => { stockMap[p.id] = p.stock ?? 0 })

      setProducts(prodList.map(p => ({
        id: p.id, name: p.name, uniqueId: `prod-${p.id}`,
        price: Number(p.pricing?.final_price ?? p.price ?? 0),
        category: mapCategory(p.product_category),
        image: p.image_url, type: 'product',
        available: (p.stock ?? 0) > 0,
      })))
      setCombos(norm(cmbs).map(c => {
        const parts = c._ComboProducts || []
        const hasStock = parts.length === 0 || parts.every(cp => (stockMap[cp.product] || 0) >= cp.quantity)
        return {
          id: c.id, name: c.name, uniqueId: `combo-${c.id}`,
          price: Number(c.pricing?.final_price ?? c.price ?? 0),
          category: 'Combos', image: c.image_url, type: 'combo',
          available: hasStock,
        }
      }))
    }).catch(() => {}).finally(() => setLoading(false))
  }, [effectiveCinemaId])

  const allItems = [...products, ...combos]
  const filtered = selectedCategory === 'Todos' ? allItems : allItems.filter(i => i.category === selectedCategory)
  const total = cartItems.reduce((s, i) => s + i.price * i.qty, 0)

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

  const addToCart = (p) => setCartItems(prev => {
    const ex = prev.find(i => i.uniqueId === p.uniqueId)
    return ex ? prev.map(i => i.uniqueId === p.uniqueId ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }]
  })
  const removeFromCart = (uniqueId) => setCartItems(prev => prev.filter(i => i.uniqueId !== uniqueId))
  const updateQty = (uniqueId, d) => setCartItems(prev => prev.map(i => {
    if (i.uniqueId !== uniqueId) return i
    const q = Math.max(1, i.qty + d)
    return { ...i, qty: q }
  }))

  useEffect(() => {
    const mId = paymentMethod === 'transfer' ? 4 : paymentMethod === 'mobile' ? 3 : 5
    const availableBanks = bankAccounts.filter(b => b.payment_method === mId)
    
    if (availableBanks.length > 0) {
      const isCurrentValid = availableBanks.some(b => b.bank === selectedBank)
      if (!isCurrentValid) {
        setSelectedBank(availableBanks[0].bank)
      }
    } else {
      setSelectedBank('')
    }
  }, [paymentMethod, bankAccounts])

  const handleGoPayment = async () => {
    if (cartItems.length === 0) return
    setCheckingOut(true)
    setError(null)
    try {
      try { await deleteOrderSessionWithRetries() } catch {}
      await initializeOrderQuote({ cinema: effectiveCinemaId })

      // Conectar socket para escuchar eventos de pago
      socketService.connect()
      socketService.off('payment_success')
      socketService.on('payment_success', (data) => {
        const remaining = Number(data.remaining_balance || 0)
        if (remaining < 0.10) {
          setPaying(false)
          setPaymentResult({ success: true, orderId: data.orderId, qrCode: data.qrCode })
        } else {
          setPaying(false)
          setPaymentResult({ success: true, partial: true, remainingBalance: remaining, message: data.message })
        }
      })
      socketService.off('payment_completed')
      socketService.on('payment_completed', (data) => {
        setPaying(false)
        setPaymentResult({ success: true, orderId: data.orderId, qrCode: data.qrCode, billing: data.billing_required })
      })
      socketService.off('payment_failed')
      socketService.on('payment_failed', (data) => {
        setPaying(false)
        setPaymentResult({ success: false, message: data.message || 'El pago no pudo ser procesado.' })
      })

      // Cargar bancos para el selector de pago
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

      const payload = {
        tickets: [],
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
        if (checkErr?.response?.status === 409 && checkErr?.response?.data?.message?.includes('cotización')) {
          try { await deleteOrderSessionWithRetries() } catch {}
          await initializeOrderQuote({ cinema: effectiveCinemaId })
          resp = await createOrderCheckout(payload)
        } else {
          throw checkErr
        }
      }
      const data = resp?.data ?? resp
      setCheckoutData(data)
      setAmountInput(getAmountForCurrency(data, data?.system_base_currency ?? 2))
      setPaymentCurrency(data?.system_base_currency ?? 2)
      setStep(2)
    } catch (e) {
      setError(e?.response?.data?.message || 'Error al procesar la orden')
    } finally {
      setCheckingOut(false)
    }
  }

  const handlePayment = async (e) => {
    e?.preventDefault()
    if (paymentMethod !== 'loyalty' && !referenceNumber.trim()) { setReferenceError('Ingresa la referencia'); return }
    setPaying(true)
    setError(null)
    setPaymentResult(null)
    paidSnapshotRef.current = {
      items: [...cartItems],
      total,
      paymentMethod,
      referenceNumber,
    }
    try {
      const payload = {
        payment_method: paymentMethod === 'transfer' ? 4 : paymentMethod === 'mobile' ? 3 : 5,
        amount: parseFloat(amountInput),
        currency: paymentCurrency,
      }
      if (paymentMethod !== 'loyalty') {
        payload.reference_number = referenceNumber.trim()
        if (selectedBank) payload.bank = selectedBank
      }
      await registerPayment(payload)
      // El resultado llega por WebSocket (payment_completed / payment_failed / payment_success)

    } catch (e) {
      setPaying(false)
      setError(e?.response?.data?.message || 'Error al registrar el pago')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#231640]">
        <p className="animate-pulse text-lg">Cargando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white pb-20 bg-[#231640]">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Cinema selector */}
        <div className="w-full max-w-[280px]">
          <InputSelect
            id="cinema"
            label="Sucursal"
            value={effectiveCinemaId ?? ''}
            options={cinemas.map(c => ({ label: c.name, value: c.id }))}
            register={{
              onChange: (e) => setEffectiveCinemaId(Number(e.target.value) || null)
            }}
          />
        </div>

        {!effectiveCinemaId ? (
          <p className="text-white/60 text-center py-20">Selecciona una sucursal para ver los productos</p>
        ) : step === 1 ? (
          <>
            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 border-b border-white/10">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-5 py-2 rounded-t-lg whitespace-nowrap font-medium transition-all ${
                  selectedCategory === cat ? 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-400' : 'text-white/60 hover:text-white'}`}>{cat}</button>
              ))}
            </div>

            {/* Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map(p => {
                const inCart = cartItems.find(i => i.uniqueId === p.uniqueId)
                return (
                  <div key={p.uniqueId} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                    <div className="h-36 bg-black/30 flex items-center justify-center">
                      <img src={p.image || placeholderImg} alt={p.name} className="w-full h-full object-cover"
                        onError={e => { e.target.onerror = null; e.target.src = placeholderImg }} />
                    </div>
                    <div className="p-4 flex flex-col flex-1 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-sm">{p.name}</h3>
                        <span className="text-yellow-400 font-bold whitespace-nowrap">${p.price.toFixed(2)}</span>
                      </div>
                      {p.available === false ? (
                        <span className="mt-auto w-full bg-red-500/20 text-red-400 py-2 rounded-xl font-semibold text-sm text-center">Sin stock</span>
                      ) : inCart ? (
                        <div className="flex items-center justify-between bg-white/10 rounded-xl p-1 mt-auto">
                          <button onClick={() => inCart.qty <= 1 ? removeFromCart(p.uniqueId) : updateQty(p.uniqueId, -1)}
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

            {/* Bottom bar */}
            {cartItems.length > 0 && (
              <div className="flex items-center justify-between bg-white/10 rounded-xl p-4 sticky bottom-4">
                <div>
                  <p className="text-white/70 text-sm">{cartItems.reduce((s, i) => s + i.qty, 0)} productos</p>
                  <p className="text-yellow-400 text-xl font-bold">${total.toFixed(2)}</p>
                </div>
                <button onClick={handleGoPayment} disabled={checkingOut}
                  className="px-8 py-3 bg-yellow-500 text-black font-bold rounded-xl text-sm uppercase disabled:opacity-50 hover:brightness-110 transition-all">
                  {checkingOut ? 'Procesando...' : 'Continuar → Pago'}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Step 2: Payment */
          <div className="space-y-6 max-w-lg mx-auto animate-in fade-in">
            {paying ? (
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

                    {paidSnapshotRef.current && (
                      <div className="mt-5 bg-white/10 rounded-2xl p-5 w-full max-w-sm space-y-3 text-left">
                        <div className="pb-3 border-b border-white/10">
                          <p className="text-xs font-semibold text-white/70 mb-1">Confitería</p>
                          {paidSnapshotRef.current.items.map((item, i) => (
                            <div key={i} className="flex justify-between text-xs text-white/50">
                              <span>{item.name} ×{item.qty}</span>
                              <span className="font-medium">${(item.price * item.qty).toFixed(2)}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-xs text-white/50 mt-1 pt-1 border-t border-white/5">
                            <span>Subtotal</span>
                            <span>${paidSnapshotRef.current.total.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="pb-3 border-b border-white/10">
                          <p className="text-xs font-semibold text-white/70 mb-1">Método de Pago</p>
                          <p className="text-xs text-white/50 capitalize">
                            {paidSnapshotRef.current.paymentMethod === 'transfer' ? 'Transferencia' : paidSnapshotRef.current.paymentMethod === 'mobile' ? 'Pago Móvil' : 'Puntos'}
                          </p>
                          {paidSnapshotRef.current.referenceNumber && <p className="text-xs text-white/50">Ref: {paidSnapshotRef.current.referenceNumber}</p>}
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white text-sm">Total</span>
                          <div className="text-right">
                            <span className="text-yellow-400 font-bold text-lg">
                              Bs. {parseFloat(amountInput || paidSnapshotRef.current.total).toFixed(2)}
                            </span>
                            <span className="text-white/40 text-xs block">≈ ${paidSnapshotRef.current.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentResult.billing && (
                      <p className="text-amber-400 text-sm mt-2">Recuerda completar la facturación.</p>
                    )}
                    
                    <button onClick={() => navigate('/')} className="mt-3 px-6 py-3 border border-white/20 text-white rounded-xl font-bold">Volver al inicio</button>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center mb-6 text-3xl">✕</div>
                  <h2 className="text-xl font-bold text-red-400">Error en el Pago</h2>
                  <p className="text-white/60 text-sm mt-2">{paymentResult.message || 'El pago no pudo ser procesado.'}</p>
                  <button onClick={() => { setPaymentResult(null); setStep(1); }} className="mt-6 px-6 py-3 bg-yellow-500 text-black rounded-xl font-bold">Volver a intentar</button>
                </div>
              )
            ) : (
              <>
                <h2 className="text-xl font-bold text-yellow-400">Pago</h2>
                {error && <div className="bg-red-500/20 border border-red-500/40 text-red-300 p-4 rounded-xl text-sm">{error}</div>}
                <div className="bg-white/10 rounded-2xl p-6 space-y-3">
                  <h3 className="font-bold text-yellow-400">Resumen</h3>
                  {cartItems.map(i => (
                    <div key={i.uniqueId} className="flex justify-between text-sm text-white/80">
                      <span>{i.name} ×{i.qty}</span>
                      <span>${(i.price * i.qty).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xl font-bold text-yellow-400 pt-3 border-t border-white/20">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
                <form onSubmit={handlePayment} className="bg-white/10 rounded-2xl p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Método de Pagos</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'transfer', name: 'Transferencia', icon: '🏦' },
                        { id: 'mobile', name: 'Pago Móvil', icon: '📱' },
                        { id: 'loyalty', name: 'Puntos', icon: '⭐' },
                      ].map(m => (
                        <button key={m.id} type="button" onClick={() => setPaymentMethod(m.id)}
                          className={`p-3 rounded-xl border text-center text-xs font-medium transition-all ${
                            paymentMethod === m.id ? 'bg-yellow-500/20 border-yellow-400 text-yellow-400' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'}`}>
                          <span className="text-xl block mb-1">{m.icon}</span>{m.name}</button>
                      ))}
                    </div>
                  </div>
                  {['transfer', 'mobile'].includes(paymentMethod) && (
                    <div>
                      <label className="block text-sm font-medium text-white/70 mb-2">Banco Destino</label>
                      <select
                        id="bank"
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-yellow-400">
                        <option value="">Seleccionar banco</option>
                        {bankAccounts
                          .filter(b => b.payment_method === (paymentMethod === 'transfer' ? 4 : paymentMethod === 'mobile' ? 3 : 5))
                          .map(ba => (
                            <option key={ba.id} value={ba.bank} className="text-black">{ba.name}</option>
                          ))}
                      </select>

                      {/* Detalles de la cuenta bancaria */}
                      {(() => {
                        if (!selectedBank) return null;
                        const mId = paymentMethod === 'transfer' ? 4 : paymentMethod === 'mobile' ? 3 : 5;
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
                    <label className="block text-sm font-medium text-white/70 mb-2">Monto (Bs.)</label>
                    <input type="number" value={amountInput} disabled
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/50 cursor-not-allowed" />
                  </div>
                  <button type="submit" disabled={paying}
                    className="w-full py-4 bg-yellow-500 text-black font-bold rounded-xl text-lg hover:brightness-110 disabled:opacity-50 transition-all">
                    {paying ? 'Procesando...' : `Pagar Bs. ${(parseFloat(amountInput) || total).toFixed(2)}`}
                  </button>
                </form>
                <button onClick={() => setStep(1)} className="w-full py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 text-sm">← Volver a productos</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
