import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../../../context/CartContext'
import OrderSummary from '../../../components/selectSeats/OrderSummary'

import {
  getConcessionProducts,
  getConcessionCombos,
} from '../../../services/concessions.service'

const CATEGORIES = ['Todos', 'Popcorn', 'Drinks', 'Combos', 'Candies']


export default function Confectionery() {
  // 1. Detectamos laruta mediante los params 
  const { movieId, showtimeId } = useParams()
  const navigate = useNavigate()

  const isFlowCompra = Boolean(movieId && showtimeId) // true si viene de asientos, false si viene del Header
  const { addProduct, updateQuantity, removeProduct, cart } = useCart()

  // Si es flujo de compra, usamos el cine de la compra. Si es público, usamos el cine seleccionado en el Header
  const cinemaId = cart?.cinemaId || 1

  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

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
    const load = async () => {
      try {
        setLoading(true)

        const [productsData, combosData] = await Promise.all([
          getConcessionProducts(cinemaId),
          getConcessionCombos(cinemaId),
        ])

        const products = Array.isArray(productsData) ? productsData : []
        const combos = Array.isArray(combosData) ? combosData : []

        // ⭐ Mapear productos con protección total
        const mappedProducts = products.map((p) => {
          const rawPrice = p.pricing?.final_price ?? p.price ?? 0
          return {
            id: `prod_${p.id}`,
            originalId: p.id,
            name: p.name,
            price:
              typeof rawPrice === 'string' ? parseFloat(rawPrice) : rawPrice,
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
            price:
              typeof rawPrice === 'string' ? parseFloat(rawPrice) : rawPrice,
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

    if (cinemaId) {
      load()
    }
  }, [cinemaId])

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
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          p.type === 'combo'
                            ? DEFAULT_COMBO_IMG
                            : DEFAULT_POPCORN_IMG
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
      <div className="lg:col-span-1">
        <OrderSummary
          mode={isFlowCompra ? 'flow' : 'public'}
          onNext={() => navigate(`/buy/${movieId}/${showtimeId}/checkout`)}
        />
      </div>
    </div>
  )
}
