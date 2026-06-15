import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyOrdersRequest } from '../../../services/users.service'
import { fetchAndAttachProductNames } from '../../../services/productCache'

function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true)
      try {
        const res = await getMyOrdersRequest({ page: 1, limit: 20 })
        if (!res) {
          setOrders([])
        } else if (res.success && res.data) {
          // API may return the list directly in `res.data`, or inside `rows` or `data`.
          const payload = res.data
          const ordersList = Array.isArray(payload)
            ? payload
            : Array.isArray(payload.rows)
            ? payload.rows
            : Array.isArray(payload.data)
            ? payload.data
            : []

          // Normalize orders and ensure a `total` and `createdAt` exist for rendering
          const normalized = ordersList.map((o) => {
            const sumLines = Array.isArray(o._OrderLines)
              ? o._OrderLines.reduce((s, l) => s + (parseFloat(l.unit_price ?? l.original_unit_price ?? 0) * (l.quantity ?? 1)), 0)
              : 0

            const rawTotal =
              o.total_amount_base_currency ?? o.total_amount ?? o.total ?? o.subtotal_base_currency ?? o.subtotal ?? sumLines

            const total = typeof rawTotal === 'number' ? rawTotal.toFixed(2) : (rawTotal ?? '—')

            return {
              ...o,
              id: o.id,
              createdAt: o.created_at ?? o.createdAt,
              total,
            }
          })

          setOrders(normalized)

          // Fetch products once per cinema and attach product names to order lines
          try {
            const withNames = await fetchAndAttachProductNames(normalized)
            setOrders(withNames)
          } catch (e) {
            console.error('Error attaching product names:', e)
          }
        } else {
          setOrders([])
        }
      } catch (err) {
        console.error('Error fetching orders:', err)
        setError('No se pudo cargar el historial de compras.')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const formatDate = (value) => {
    if (!value) return '—'
    try {
      const d = new Date(value)
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d)
    } catch (e) {
      return value
    }
  }

  const formatNumber = (v) => {
    const n = typeof v === 'string' ? parseFloat(v) : v
    if (Number.isFinite(n)) return n.toFixed(2)
    return '—'
  }

  const statusMap = {
    1: 'Pendiente',
    2: 'En proceso',
    3: 'Completado',
    4: 'Cancelado',
  }

  if (loading) return <div className="p-6 text-white">Cargando órdenes...</div>
  if (error) return <div className="p-6 text-red-400">{error}</div>

  return (
    <div className="bg-[#231640] min-h-[calc(100vh-80px)] w-full flex flex-col items-center py-8 font-montserrat text-white">
      <div className="w-full max-w-3xl p-6 bg-gradient-to-b from-[#2A154B] via-[#7B1A82] to-[#231640] rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-[#D9982F] mb-4">Historial de Compra</h1>

        {orders.length === 0 ? (
          <div className="bg-white/5 p-6 rounded">
            <p className="mb-2">No tienes órdenes registradas aún.</p>
            <Link to="/" className="text-[#F6AD38] font-bold">
              Ir a cartelera
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li
                key={order.id || order.orderId}
                className="p-4 bg-white/5 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-bold">Orden #{order.id || order.orderId}</p>
                    <p className="text-sm text-white/80">{formatDate(order.createdAt || order.date)}</p>
                  </div>

                  <p className="text-sm mt-1">Cine: {order._Cinemas?.name || '—'}</p>
                  <p className="text-sm">Estado: {statusMap[order.order_status] || order.order_status || '—'}</p>
                  <p className="text-sm">Puntos generados: {order.generated_points ?? '0'}</p>

                  <div className="mt-2">
                    <p className="font-semibold">Items:</p>
                    <ul className="ml-4 list-disc text-sm">
                      {Array.isArray(order._OrderLines) && order._OrderLines.length > 0 ? (
                        order._OrderLines.map((line) => (
                          <li key={line.id}>
                            {line.quantity ?? 1} × {line.productName || line.name || `Producto #${line.product}`} — {formatNumber(line.unit_price ?? line.original_unit_price)}
                          </li>
                        ))
                      ) : (
                        <li>—</li>
                      )}
                    </ul>
                  </div>

                  <div className="mt-2">
                    <p className="font-semibold">Pagos:</p>
                    {Array.isArray(order._OrderPayments) && order._OrderPayments.length > 0 ? (
                      order._OrderPayments.map((p) => (
                        <div key={p.id} className="text-sm">
                          Método #{p.payment_method} — {formatNumber(p.amount)} {p.reference_number ? ` (ref ${p.reference_number})` : ''}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm">—</div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <p className="font-bold text-xl">Total: {order.total ?? order.total_amount_base_currency ?? order.subtotal_base_currency ?? '—'}</p>
                  <Link
                    to={`/mis-compras/${order.id || order.orderId}/ticket`}
                    className="mt-3 px-4 py-2 bg-[#F6AD38] text-black font-bold rounded-lg"
                  >
                    Ver ticket
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default MyOrders
