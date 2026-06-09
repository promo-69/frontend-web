import { useState } from 'react'
import { ArrowLeft, ShoppingBag, X, SkipForward } from 'lucide-react'

export default function StepConfectionery({
  products,
  combos,
  onNext,
  onBack,
}) {
  const [cart, setCart] = useState({}) // { id: { item, qty } }

  const addItem = (item, type) => {
    const key = `${type}_${item.id}`
    setCart((prev) => ({
      ...prev,
      [key]: {
        item,
        type,
        qty: (prev[key]?.qty || 0) + 1,
      },
    }))
  }

  const removeItem = (key) => {
    setCart((prev) => {
      const current = prev[key]
      if (!current) return prev
      if (current.qty <= 1) {
        const next = { ...prev }
        delete next[key]
        return next
      }
      return { ...prev, [key]: { ...current, qty: current.qty - 1 } }
    })
  }

  const cartItems = Object.entries(cart).map(([key, val]) => ({ key, ...val }))
  const cartTotal = cartItems.reduce((acc, i) => acc + i.item.price * i.qty, 0)
  const cartCount = cartItems.reduce((acc, i) => acc + i.qty, 0)

  const handleNext = (skip = false) => {
    onNext({
      concessionItems: skip ? [] : cartItems,
      concessionTotal: skip ? 0 : cartTotal,
    })
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#F6AD38]">
            Confitería{' '}
            <span className="text-white/40 text-base font-normal ml-2">
              (Opcional)
            </span>
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Agrega productos o combos al pedido. Puedes omitir este paso.
          </p>
        </div>
        {cartCount > 0 && (
          <div className="flex items-center gap-2 bg-[#F6AD38]/10 border border-[#F6AD38]/30 rounded-xl px-4 py-2">
            <ShoppingBag className="w-4 h-4 text-[#F6AD38]" />
            <span className="text-[#F6AD38] font-bold">
              {cartCount} ítem{cartCount > 1 ? 's' : ''}
            </span>
            <span className="text-white font-bold ml-1">
              ${cartTotal.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Productos y Combos ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* COMBOS */}
          <div>
            <h3 className="text-sm font-bold text-[#F6AD38] uppercase tracking-widest mb-3">
              ⭐ Combos
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {combos.map((combo) => {
                const key = `combo_${combo.id}`
                const qty = cart[key]?.qty || 0
                return (
                  <div
                    key={combo.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-[#F6AD38]/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{combo.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm">
                          {combo.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-tight">
                          {combo.description}
                        </p>
                        <p className="text-[#F6AD38] font-bold text-sm mt-1">
                          ${combo.price.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      {qty > 0 ? (
                        <div className="flex items-center gap-3 bg-[#1d1430] rounded-full px-3 py-1 border border-[#F6AD38]/40">
                          <button
                            onClick={() => removeItem(key)}
                            className="text-[#F6AD38] font-bold w-4 h-4 flex items-center justify-center"
                          >
                            −
                          </button>
                          <span className="font-bold text-white w-4 text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => addItem(combo, 'combo')}
                            className="text-[#F6AD38] font-bold w-4 h-4 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addItem(combo, 'combo')}
                          className="text-xs bg-[#F6AD38] text-[#1d1430] px-3 py-1.5 rounded-lg font-bold hover:brightness-110 transition-all active:scale-95"
                        >
                          + Agregar
                        </button>
                      )}
                      {qty > 0 && (
                        <span className="text-xs text-gray-400">
                          ${(combo.price * qty).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* PRODUCTOS */}
          <div>
            <h3 className="text-sm font-bold text-[#F6AD38] uppercase tracking-widest mb-3">
              🍿 Productos
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {products.map((product) => {
                const key = `product_${product.id}`
                const qty = cart[key]?.qty || 0
                return (
                  <div
                    key={product.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-3 hover:border-[#F6AD38]/30 transition-colors text-center"
                  >
                    <span className="text-3xl block mb-1">{product.emoji}</span>
                    <p className="font-bold text-white text-xs leading-tight">
                      {product.name}
                    </p>
                    <p className="text-[9px] text-gray-500 mb-1">
                      {product.category}
                    </p>
                    <p className="text-[#F6AD38] font-bold text-sm mb-2">
                      ${product.price.toFixed(2)}
                    </p>
                    {qty > 0 ? (
                      <div className="flex items-center justify-center gap-2 bg-[#1d1430] rounded-full px-2 py-1 border border-[#F6AD38]/40">
                        <button
                          onClick={() => removeItem(key)}
                          className="text-[#F6AD38] font-bold"
                        >
                          −
                        </button>
                        <span className="font-bold text-white w-4 text-center text-xs">
                          {qty}
                        </span>
                        <button
                          onClick={() => addItem(product, 'product')}
                          className="text-[#F6AD38] font-bold"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addItem(product, 'product')}
                        className="w-full text-xs bg-[#F6AD38] text-[#1d1430] px-2 py-1.5 rounded-lg font-bold hover:brightness-110 transition-all active:scale-95"
                      >
                        + Agregar
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Mini carrito ── */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 h-fit">
          <h3 className="text-sm font-bold text-[#F6AD38] mb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" /> Carrito de Confitería
          </h3>
          {cartItems.length === 0 ? (
            <p className="text-gray-500 text-xs text-center py-6">
              Sin productos agregados
            </p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cartItems.map((entry) => (
                <div
                  key={entry.key}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span>{entry.item.emoji}</span>
                    <span className="text-gray-300 leading-tight max-w-[100px] truncate">
                      {entry.item.name}
                    </span>
                    <span className="text-gray-500 font-mono">
                      ×{entry.qty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#F6AD38] font-bold">
                      ${(entry.item.price * entry.qty).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeItem(entry.key)}
                      className="text-gray-600 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="border-t border-white/10 pt-2 flex justify-between font-bold text-sm">
                <span className="text-gray-300">Total confitería</span>
                <span className="text-[#F6AD38]">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-gray-300 hover:border-white/40 hover:text-white transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>

        <div className="flex gap-3">
          {/* OMITIR — confitería es opcional */}
          <button
            onClick={() => handleNext(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-gray-400 hover:border-[#F6AD38]/40 hover:text-[#F6AD38] transition-all text-sm"
          >
            <SkipForward className="w-4 h-4" /> Omitir
          </button>

          <button
            onClick={() => handleNext(false)}
            className="
              px-8 py-3 bg-[#F6AD38] text-[#1d1430] font-bold rounded-xl text-sm uppercase tracking-widest
              hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#F6AD38]/30
            "
          >
            Continuar → Pago
          </button>
        </div>
      </div>
    </div>
  )
}
