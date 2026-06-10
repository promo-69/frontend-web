import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyOrdersRequest } from '../../../services/users.service'

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
          setOrders(res.data.rows || [])
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
                <div>
                  <p className="font-bold">Orden #{order.id || order.orderId}</p>
                  <p className="text-sm text-white/80">{order.createdAt || order.date}</p>
                  <p className="text-sm">Total: {order.total || order.amount || '—'}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/mis-compras/${order.id || order.orderId}/ticket`}
                    className="px-4 py-2 bg-[#F6AD38] text-black font-bold rounded-lg"
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
