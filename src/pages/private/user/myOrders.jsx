import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyOrdersRequest } from '../../../services/users.service'
import { fetchAndAttachProductNames } from '../../../services/productCache'
import PageHeader from '../../../components/ui/PageHeader'
import Footer from '../../../components/ui/Footer'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import useDocumentTitle from '../../../hooks/useDocumentTitle';


function MyOrders() {
  useDocumentTitle('Mis Compras');

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  const fetchOrders = async (page) => {
    setLoading(true)
    try {
      const res = await getMyOrdersRequest({ page, limit: itemsPerPage })
      if (!res) {
        setOrders([])
        setTotalPages(1)
      } else if (res.success && res.data) {
        const payload = res.data
        const ordersList = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.rows)
          ? payload.rows
          : Array.isArray(payload.data)
          ? payload.data
          : []
          
        const totalItems = payload.count || 1
        setTotalPages(Math.max(1, Math.ceil(totalItems / itemsPerPage)))

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

        try {
          const withNames = await fetchAndAttachProductNames(normalized)
          setOrders(withNames)
        } catch (e) {
          console.error('Error attaching product names:', e)
        }
      } else {
        setOrders([])
        setTotalPages(1)
      }
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError('No se pudo cargar el historial de compras.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders(currentPage)
  }, [currentPage])

  const formatDate = (value) => {
    if (!value) return '—'
    try {
      const d = new Date(value)
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      }).format(d)
    } catch (e) {
      return value
    }
  }

  const formatNumber = (v) => {
    const n = typeof v === 'string' ? parseFloat(v) : v
    if (Number.isFinite(n)) return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })
    return '—'
  }

  const getStatusStyles = (statusId, statusText) => {
    const s = String(statusText || statusId).toLowerCase()
    if (s.includes('completado') || statusId === 4) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
    if (s.includes('cancelado') || statusId === 3) return "bg-rose-500/10 text-rose-400 border-rose-500/30"
    if (s.includes('proceso') || statusId === 2) return "bg-blue-500/10 text-blue-400 border-blue-500/30"
    return "bg-amber-500/10 text-amber-400 border-amber-500/30"
  }

  const statusMap = {
    1: 'Pendiente',
    2: 'En proceso',
    3: 'Cancelado',
    4: 'Completado',
  }

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#2A154B] via-[#7B1A82] to-[#231640] text-white justify-between font-montserrat relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-[80px] animate-pulse" />
        <div className="flex-grow flex items-center justify-center relative z-10">
          <p className="text-sm font-bold tracking-widest uppercase animate-pulse text-gray-300">
            Cargando órdenes...
          </p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) return <div className="p-6 text-red-400">{error}</div>

  return (
    <div className="bg-gradient-to-b from-[#2A154B] via-[#7B1A82] to-[#231640] min-h-screen w-full flex flex-col justify-between font-montserrat text-white relative">
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 pt-28 md:pt-32 pb-12 relative z-10">
        
        {/* Cabecera Principal */}
        <PageHeader 
          className="mb-10"
          titlePrefix="Historial de" 
          titleHighlight="Compra" 
          subtitle="Revisa el detalle de tus tickets, combos y puntos acumulados de tus visitas a Cineflix." 
        />

        {orders.length === 0 ? (
          <div className="bg-[#231640] border border-white/10 p-8 rounded-2xl text-center shadow-xl">
            <p className="mb-4 text-gray-300">No tienes órdenes registradas aún.</p>
            <Link to="/" className="inline-block px-6 py-2 bg-[#F6AD38] hover:bg-[#d9982f] text-black font-bold rounded-lg transition-colors duration-200">
              Ir a cartelera
            </Link>
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-1 ${orders.length > 1 ? 'lg:grid-cols-2' : ''} gap-6 relative transition-opacity duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
              {orders.map((order) => {
                const statusName = order._OrderStatuses?.name || statusMap[order.order_status] || order.order_status || 'Pendiente'
                const badgeClass = getStatusStyles(order.order_status, statusName)
                
                return (
                  <div key={order.id || order.orderId} className="bg-[#231640] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4 hover:border-yellow-500/30 transition-colors">
                    
                    {/* Header de la tarjeta */}
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b border-white/10 pb-4">
                      <div className="w-full sm:w-auto">
                        <h5 className="font-bold text-xl text-white leading-tight break-words">
                          Orden #{order.id || order.orderId}
                        </h5>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(order.createdAt || order.date)}</p>
                      </div>
                      <span className={`w-fit shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wider border ${badgeClass}`}>
                        {statusName}
                      </span>
                    </div>

                    {/* Info General */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-2">
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Cine</p>
                        <p className="font-bold text-yellow-500">{order._Cinemas?.name || 'Cineflix'}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">Puntos Generados</p>
                        <p className="font-medium text-white">+{Number(order.generated_points ?? 0).toLocaleString('es-ES', { useGrouping: true })} pts</p>
                      </div>
                    </div>

                    {/* Detalle de Items */}
                    <div className="mt-2 bg-white/5 rounded-xl p-4">
                      <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2">Compras realizadas</p>
                      <ul className="space-y-1.5 text-sm text-gray-300">
                        {(() => {
                          const hasLines = Array.isArray(order._OrderLines) && order._OrderLines.length > 0
                          const hasTickets = Array.isArray(order._Tickets) && order._Tickets.length > 0
                          
                          if (!hasLines && !hasTickets) {
                            return <li className="text-gray-500 italic">— No hay compras registradas —</li>
                          }
                          
                          return (
                            <>
                              {hasTickets && order._Tickets.map((t) => (
                                <li key={`ticket-${t.id}`} className="flex justify-between items-center gap-2">
                                  <span className="truncate">
                                    <span className="font-bold text-white mr-2">1x</span> 
                                    Boleto {t._AudienceCategories?.name ? `(${t._AudienceCategories.name})` : ''} 
                                    <span className="text-gray-400 mx-1">en {t._RoomBookings?._Rooms?.name || 'Sala'}</span>
                                    - Asiento <span className="font-semibold text-yellow-400">{t._Seats?.name || t.seat_name || `#${t.seat}`}</span>
                                  </span>
                                  <span className="font-mono text-white/80 whitespace-nowrap">${formatNumber(t.price ?? t.original_price ?? t.unit_price)}</span>
                                </li>
                              ))}
                              
                              {hasLines && order._OrderLines.map((line) => (
                                <li key={`line-${line.id}`} className="flex justify-between items-center gap-2">
                                  <span className="truncate">
                                    <span className="font-bold text-white mr-2">{line.quantity ?? 1}x</span> 
                                    {line.productName || line.name || `Confitería/Combo #${line.product || line.combo}`}
                                  </span>
                                  <span className="font-mono text-white/80 whitespace-nowrap">${formatNumber(line.unit_price ?? line.original_unit_price)}</span>
                                </li>
                              ))}
                            </>
                          )
                        })()}
                      </ul>
                    </div>

                    {/* Detalle de Pagos */}
                    <div className="bg-white/5 rounded-xl p-4">
                      <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2">Pagos registrados</p>
                      <div className="space-y-1.5 text-sm text-gray-300">
                        {Array.isArray(order._OrderPayments) && order._OrderPayments.length > 0 ? (
                          order._OrderPayments.map((p) => (
                            <div key={p.id} className="flex justify-between items-center gap-2">
                              <span className="truncate">
                                Pago con {p._PaymentMethods?.description || p._PaymentMethods?.name || `método #${p.payment_method}`}
                                {p.reference_number ? <span className="text-gray-500 text-xs ml-1">(ref: {p.reference_number})</span> : ''}
                              </span>
                              <span className="font-mono text-white/80 whitespace-nowrap">${formatNumber(p.amount)}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-gray-500 italic">— No hay pagos registrados —</div>
                        )}
                      </div>
                    </div>

                    {/* Footer de Tarjeta (Total y Botón) */}
                    <div className="mt-auto pt-4 border-t border-white/5">
                      <div className="mb-4">
                        <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Total Pagado</p>
                        <p className="font-black text-2xl text-yellow-400">
                          ${Number(order.total ?? order.total_amount_base_currency ?? order.subtotal_base_currency ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })}
                        </p>
                      </div>
                      
                      {(Array.isArray(order._Tickets) && order._Tickets.length > 0) && (
                        <Link
                          to={`/mis-compras/${order.id || order.orderId}/ticket`}
                          className="block w-full text-center px-6 py-3 bg-[#F6AD38] hover:bg-[#d9982f] text-black font-bold rounded-lg transition-colors duration-200"
                        >
                          Ver ticket
                        </Link>
                      )}
                    </div>

                  </div>
                )
              })}
            </div>

            {/* Paginación */}
            <div className="flex justify-center items-center gap-4 mt-12 pt-8 border-t border-white/10">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                className="p-2 bg-[#231640] border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm font-bold text-gray-300">
                Página {currentPage} de {totalPages || 1}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0 || loading}
                className="p-2 bg-[#231640] border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default MyOrders