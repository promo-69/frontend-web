import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../../../context/CartContext'
import OrderSummary from '../../../components/selectSeats/OrderSummary'

//import PopcornImg from '../../../assets/images/candy/popcorn.png'
//import SodaImg from '../../../assets/images/candy/soda.png'
//import ComboImg from '../../../assets/images/candy/combo.png'

import {
  getConcessionProducts,
  getConcessionCombos,
} from '../../../services/concessions.service'


const CATEGORIES = ['Todos', 'Popcorn', 'Drinks', 'Combos', 'Candies']

export default function Confectionery() {
  const { movieId, showtimeId } = useParams()
  const navigate = useNavigate()
  const { addProduct } = useCart()

  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [items, setItems] = useState([])

  // ⭐ Mapeo de categorías 
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

  // ⭐ Cargar productos + combos desde API
useEffect(() => {
  const load = async () => {
    try {
      const [products, combos] = await Promise.all([
        getConcessionProducts(),
        getConcessionCombos(),
      ])

      // ⭐ Mapear productos
      const mappedProducts = products.map((p) => ({
        id: `prod_${p.id}`,
        originalId: p.id,
        name: p.name,
        price: p.price ?? 5,
        category: mapCategory(p.product_category),
        image: p.image_url || PopcornImg,
        type: 'product',
      }))

      // ⭐ Mapear combos
      const mappedCombos = combos.map((c) => ({
        id: `combo_${c.id}`,
        originalId: c.id,
        name: c.name,
        price: c.price,
        category: 'Combos',
        image: ComboImg,
        type: 'combo',
      }))

      setItems([...mappedProducts, ...mappedCombos])
    } catch (err) {
      console.error('Error cargando confitería:', err)
    }
  }

  load()
}, [])


  const filtered =
    selectedCategory === 'Todos'
      ? items
      : items.filter((i) => i.category === selectedCategory)

  const handleAdd = (p) => {
    addProduct({
      productId: p.originalId,
      name: p.name,
      price: p.price,
      quantity: 1,
      type: p.type,
    })
  }

  return (
    <div
      className="grid grid-cols-3 gap-6 p-6"
      style={{
        background:
          'linear-gradient(to bottom,#231640 0%,#7B1A82 50%,#231640 100%)',
      }}
    >
      {/* ⭐ Columna izquierda */}
      <div className="col-span-2 space-y-6">
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

        {/* Productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-[#1f1533] border border-gray-700 rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col"
            >
              <div className="h-40 bg-gray-900 flex items-center justify-center">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-4 flex flex-col flex-1 space-y-3 text-white">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold">{p.name}</h3>
                  <span className="text-yellow-400 font-bold">
                    ${p.price.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => handleAdd(p)}
                  className="mt-auto w-full bg-yellow-500 hover:bg-yellow-600 text-black py-2 rounded-xl font-semibold"
                >
                  Agregar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ⭐ Columna derecha — Carrito */}
      <OrderSummary />
    </div>
  )
}
