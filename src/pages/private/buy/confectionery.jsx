import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../../../context/CartContext'
import OrderSummary from '../../../components/selectSeats/OrderSummary'
import { io } from 'socket.io-client'

import {
  getConcessionProducts,
  getConcessionCombos,
} from '../../../services/concessions.service'

import placeholderImg from '../../../assets/images/cinema-stuff-around-popcorn-heart.webp'

// Cache de concesiones por cinemaId para evitar peticiones duplicadas
const concessionsCache = new Map()
import {
  getOrderSession,
  getOrderSessionDetails,
  deleteOrderSessionWithRetries,
  initializeOrderQuote,
} from '../../../services/orders.service'

const CATEGORIES = ['Todos', 'Popcorn', 'Drinks', 'Combos', 'Candies']


export default function Confectionery() {
  // 1. Detectamos laruta mediante los params 
  const { movieId, showtimeId } = useParams()
  const navigate = useNavigate()

  const isFlowCompra = Boolean(movieId && showtimeId) // true si viene de asientos, false si viene del Header
  const { addProduct, updateQuantity, removeProduct, cart } = useCart()

  // Si es flujo de compra, usamos el cine de la compra. Si es público, usamos el cine seleccionado en el Header
  const socketRef = useRef(null)
  const quoteInitializedRef = useRef(false)
  const lastRequestedCinemaRef = useRef(null)

  const getEffectiveCinemaId = () => {
    return (
      cart?.showtime?.cinema?.id ||
      cart?.showtime?.cinemaId ||
      cart?.cinema?.id ||
      cart?.cinemaId ||
      undefined
    )
  }

  const effectiveCinemaId = getEffectiveCinemaId()

  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState(null)
  const [cancelAttempts, setCancelAttempts] = useState(0)

  // ⭐ Mapeo de categorías del Backend
  const mapCategory = (catId) => {
    switch (catId) {
      case 1:
        return 'Drinks'
      case 2:
        return 'Popcorn'
      case 3:
        return 'Candies'
      default:
        return 'Otros'
    }
  }

  // ⭐ Cargar productos + combos filtrados por sucursal
  useEffect(() => {
    const normalizeResponse = (response) => {
      if (!response) return []
      if (Array.isArray(response)) return response
      if (Array.isArray(response.data)) return response.data
      if (Array.isArray(response.products)) return response.products
      if (Array.isArray(response.items)) return response.items
      if (Array.isArray(response.results)) return response.results
      return []
    }

    const load = async () => {
      try {
        setLoading(true)

        // Usar caché para evitar múltiples fetches (por ejemplo en Strict Mode)
        if (concessionsCache.has(effectiveCinemaId)) {
          const cached = await concessionsCache.get(effectiveCinemaId)
          const products = normalizeResponse(cached.products)
          const combos = normalizeResponse(cached.combos)

          const mappedProducts = products.map((p) => {
            const rawPrice = p.pricing?.final_price ?? p.price ?? 0
            return {
              id: `prod_${p.id}`,
              originalId: p.id,
              name: p.name,
              price: typeof rawPrice === 'string' ? parseFloat(rawPrice) : rawPrice,
              category: mapCategory(p.product_category),
              image: p.image_url,
              type: 'product',
            }
          })

          const mappedCombos = combos.map((c) => {
            const rawPrice = c.pricing?.final_price ?? c.price ?? 0
            return {
              id: `combo_${c.id}`,
              originalId: c.id,
              name: c.name,
              price: typeof rawPrice === 'string' ? parseFloat(rawPrice) : rawPrice,
              category: 'Combos',
              image: c.image_url,
              type: 'combo',
            }
          })

          setItems([...mappedProducts, ...mappedCombos])
          return
        }

        const fetchPromise = (async () => {
          const [productsData, combosData] = await Promise.all([
            getConcessionProducts(effectiveCinemaId),
            getConcessionCombos(effectiveCinemaId),
          ])
          return { products: productsData, combos: combosData }
        })()

        concessionsCache.set(effectiveCinemaId, fetchPromise)

        const { products: productsData, combos: combosData } = await fetchPromise

        const products = normalizeResponse(productsData)
        const combos = normalizeResponse(combosData)

        // ⭐ Mapear productos con protección total
        const mappedProducts = products.map((p) => {
          const rawPrice = p.pricing?.final_price ?? p.price ?? 0
          return {
            id: `prod_${p.id}`,
            originalId: p.id,
            name: p.name,
            price: typeof rawPrice === 'string' ? parseFloat(rawPrice) : rawPrice,
            category: mapCategory(p.product_category),
            image: p.image_url,
            type: 'product',
          }
        })

        // ⭐ Mapear combos
        const mappedCombos = combos.map((c) => {
          const rawPrice = c.pricing?.final_price ?? c.price ?? 0
          return {
            id: `combo_${c.id}`,
            originalId: c.id,
            name: c.name,
            price: typeof rawPrice === 'string' ? parseFloat(rawPrice) : rawPrice,
            category: 'Combos',
            image: c.image_url,
            type: 'combo',
          }
        })

        setItems([...mappedProducts, ...mappedCombos])
      } catch (err) {
        console.error('Error cargando confitería de la sucursal:', err)
      } finally {
        setLoading(false)
      }
    }

    if (!effectiveCinemaId) return
    if (lastRequestedCinemaRef.current === effectiveCinemaId) return

    lastRequestedCinemaRef.current = effectiveCinemaId
    load()
  }, [effectiveCinemaId])

  useEffect(() => {
    const initQuote = async () => {
      if (quoteInitializedRef.current || !effectiveCinemaId) return
      quoteInitializedRef.current = true

      try {
        // Intentar crear la cotización primero — esto refleja la secuencia recomendada
        await initializeOrderQuote({
          cinema: effectiveCinemaId,
          customerId: JSON.parse(localStorage.getItem('user'))?.id,
        })
      } catch (err) {
        // Si la API responde que ya existe (409) o hay otro problema, intentar reutilizar la sesión existente
        const status = err?.response?.status
        if (status === 409) {
          try {
            const existingSession = await getOrderSession()
            if (!existingSession?.data?.session) {
              throw err
            }
          } catch (innerErr) {
            console.warn('No se pudo reutilizar la sesión tras 409:', innerErr)
            setCancelError('No se pudo iniciar la sesión de compra. Regresa a la selección de asientos.')
          }
        } else {
          // Para otros errores, intentar recuperar la sesión; si no existe, mostrar error
          try {
            const existingSession = await getOrderSession()
            if (!existingSession?.data?.session) {
              throw err
            }
          } catch (innerErr) {
            console.warn('Error al crear cotización y al recuperar sesión:', innerErr)
            setCancelError('No se pudo iniciar la sesión de compra. Regresa a la selección de asientos.')
          }
        }
      }
    }

    initQuote()
  }, [effectiveCinemaId])

  useEffect(() => {
    if (!showtimeId) return

    const socket = io(import.meta.env.VITE_WS_URL, {
      transports: ['websocket'],
      auth: { token: localStorage.getItem('token') },
    })

    socketRef.current = socket

    socket.on('connect', () => {
      socket.emit('joinshowtime', { showtime_id: Number(showtimeId) })
    })

    socket.on('disconnect', () => {
      console.log('Confitería socket desconectado')
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveshowtime', { showtimeId: Number(showtimeId) })
        socketRef.current.disconnect()
      }
    }
  }, [showtimeId])

  const filtered =
    selectedCategory === 'Todos'
      ? items
      : items.filter((i) => i.category === selectedCategory)

  // ➕ Incrementar cantidad o agregar nuevo
  const handleAdd = (p) => {
    addProduct({
      productId: p.originalId,
      name: p.name,
      price: p.price,
      quantity: 1,
      type: p.type,
    })
  }

  // ➖ Decrementar cantidad o remover del carrito
  const handleDecrease = (p, currentQty) => {
    if (currentQty > 1) {
      if (typeof updateQuantity === 'function') {
        updateQuantity(p.originalId, p.type, currentQty - 1)
      } else {
        addProduct({
          productId: p.originalId,
          name: p.name,
          price: p.price,
          quantity: -1,
          type: p.type,
        })
      }
    } else {
      // Si la cantidad llega a 0, lo sacamos del carrito
      if (typeof removeProduct === 'function') {
        removeProduct(p.originalId, p.type)
      }
    }
  }

  const releaseLocksAndLeave = () => {
    const socket = socketRef.current
    if (!socket) return

    (cart.tickets || []).forEach((ticket) => {
      const seatId = ticket.originalId || ticket.id
      socket.emit('unlockseat', { seatId })
    })

    if (showtimeId) {
      socket.emit('leaveshowtime', { showtimeId: Number(showtimeId) })
    }
  }

  const confirmCancellationSuccess = async () => {
    try {
      const details = await getOrderSessionDetails()
      const session = details?.data?.session
      return !session || session?.status !== 'pending_payment'
    } catch (err) {
      console.warn('No se pudo verificar la sesión después de cancelar:', err)
      return false
    }
  }

  const handleCancelOrder = async (reason = 'manual') => {
    if (isCancelling) return

    setIsCancelling(true)
    setCancelError(null)
    setCancelAttempts((prev) => prev + 1)

    try {
      releaseLocksAndLeave()
      const details = await getOrderSessionDetails()
      const orderId = details?.data?.order?.id
      const orderStatus = details?.data?.order?.order_status

      if (orderId && orderStatus != null) {
        console.log('Cancelación de orden detectada en confitería:', {
          orderId,
          orderStatus,
          reason,
        })
      }

      await deleteOrderSessionWithRetries()
      const cancelled = await confirmCancellationSuccess()

      if (!cancelled) {
        throw new Error('No fue posible confirmar la cancelación en el servidor')
      }

      clearCart()
      navigate('/')
    } catch (err) {
      console.error('Error cancelando orden en confitería:', err)
      setCancelError(
        'No fue posible cancelar automáticamente. Pulsa Forzar cancelación o contacta soporte.',
      )
    } finally {
      setIsCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#231640]">
        <p className="text-xl font-semibold animate-pulse">
          Cargando confitería de la sucursal...
        </p>
      </div>
    )
  }

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 min-h-screen"
      style={{
        background:
          'linear-gradient(to bottom, #231640 0%, #7B1A82 50%, #231640 100%)',
      }}
    >
      <div className="lg:col-span-2 space-y-6">
        {/* Categorías */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-700">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-t-lg transition-all whitespace-nowrap font-medium ${
                selectedCategory === cat
                  ? 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Productos en cuadrícula */}
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-center py-10">
            No hay productos disponibles en esta categoría para esta sucursal.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((p) => {
              // Buscar si este producto/combo ya existe en el estado global del carrito
              const cartItem = cart?.products?.find(
                (cp) => cp.productId === p.originalId && cp.type === p.type,
              )
              const quantityInCart = cartItem ? cartItem.quantity : 0

              return (
                <div
                  key={p.id}
                  className="bg-[#1f1533] border border-gray-700 rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col"
                >
                  <div className="h-44 bg-gray-900 flex items-center justify-center">
                                <img
                                  src={p.image || placeholderImg}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.onerror = null
                                    e.currentTarget.src = placeholderImg
                                  }}
                                />
                              </div>

                  <div className="p-4 flex flex-col flex-1 space-y-3 text-white">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-sm sm:text-base line-clamp-2">
                        {p.name}
                      </h3>
                      <span className="text-yellow-400 font-bold whitespace-nowrap">
                        ${p.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Botón condicional: Agregar o Contador [- Qty +] */}
                    <div className="mt-auto pt-2">
                      {quantityInCart === 0 ? (
                        <button
                          onClick={() => handleAdd(p)}
                          className="w-full bg-yellow-500 hover:bg-yellow-600 text-black py-2 rounded-xl font-semibold transition-colors"
                        >
                          Agregar
                        </button>
                      ) : (
                        <div className="flex items-center justify-between bg-[#2a1b4e] border border-gray-600 rounded-xl overflow-hidden p-1">
                          <button
                            onClick={() => handleDecrease(p, quantityInCart)}
                            className="px-4 py-1 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg font-bold transition-all"
                          >
                            -
                          </button>
                          <span className="font-bold text-yellow-400 text-lg">
                            {quantityInCart}
                          </span>
                          <button
                            onClick={() => handleAdd(p)}
                            className="px-4 py-1 bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white rounded-lg font-bold transition-all"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ⭐ Columna derecha: El resumen lateral */}
      <div className="lg:col-span-1 space-y-4">
        {isFlowCompra && (
          <div className="bg-[#2D1748]/60 border border-red-500/30 rounded-2xl p-4 text-sm text-red-200">
            <p className="font-semibold text-yellow-400 mb-2">¿Deseas cancelar tu compra?</p>
            <p className="mb-3">
              Si continuas y hay un error en el flujo, puedes cancelar para liberar los asientos.
            </p>
            <button
              type="button"
              disabled={isCancelling}
              onClick={() => handleCancelOrder('manual')}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition"
            >
              {isCancelling ? 'Cancelando orden...' : 'Cancelar orden'}
            </button>
            {cancelError && (
              <p className="mt-3 text-red-300 text-sm">{cancelError}</p>
            )}
          </div>
        )}

        <OrderSummary
          mode={isFlowCompra ? 'flow' : 'public'}
          onNext={() => navigate(`/buy/${movieId}/${showtimeId}/checkout`)}
        />
      </div>
    </div>
  )
}
