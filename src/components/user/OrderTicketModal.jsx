import React from 'react'
import { FiX, FiFilm, FiCoffee, FiClock, FiVolume2, FiVideo } from 'react-icons/fi'
import { QRCodeSVG } from 'qrcode.react'

export default function OrderTicketModal({ isOpen, onClose, order, ticketType }) {
  if (!isOpen || !order) return null

  const showMovie = ticketType === 'movie'
  const showConfectionery = ticketType === 'confectionery'

  const hasTickets = showMovie && Array.isArray(order._Tickets) && order._Tickets.length > 0
  const hasLines = showConfectionery && Array.isArray(order._OrderLines) && order._OrderLines.length > 0

  const formatNumber = (v) => {
    const n = typeof v === 'string' ? parseFloat(v) : v
    if (Number.isFinite(n)) return n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })
    return '—'
  }

  const formatDate = (value) => {
    if (!value) return '—'
    try {
      const d = new Date(value)
      return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      }).format(d)
    } catch (e) {
      return value
    }
  }

  // Extraer información general de la función si hay tickets
  let movieTitle = 'Película / Evento'
  let language = ''
  let projection = ''
  let showDate = ''
  let roomName = ''

  if (hasTickets) {
    const firstTicket = order._Tickets[0]
    const booking = firstTicket?._RoomBookings
    roomName = booking?._Rooms?.name || 'Sala'
    showDate = booking?.start_time ? formatDate(booking.start_time) : ''
    
    const showtime = booking?._Showtimes?.[0]
    if (showtime) {
      movieTitle = showtime._Movies?.title || showtime._SpecialEvents?.name || movieTitle
      language = showtime._Languages?.name || ''
      projection = showtime._ProjectionTypes?.name || ''
    }
  }

  // Calcular subtotal específico para el ticket mostrado
  let specificTotal = 0
  if (showMovie) {
    specificTotal = (order._Tickets || []).reduce((sum, t) => sum + parseFloat(t.price ?? t.original_price ?? t.unit_price ?? 0), 0)
  } else if (showConfectionery) {
    specificTotal = (order._OrderLines || []).reduce((sum, line) => sum + (parseFloat(line.unit_price ?? line.original_unit_price ?? 0) * (line.quantity ?? 1)), 0)
  }
  
  // Fallback al total general si el cálculo específico da 0 (ej. error en los datos de precio)
  if (specificTotal === 0) {
    specificTotal = Number(order.total ?? order.total_amount_base_currency ?? order.subtotal_base_currency ?? 0)
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        className="bg-gradient-to-b from-[#2A154B] to-[#231640] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-white/10 bg-[#1A0B2E]/50">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide uppercase">
              Ticket de {showMovie ? 'Función' : 'Confitería'}
            </h2>
            <p className="text-xs text-yellow-400 font-mono mt-1">ORDEN #{order.id || order.orderId}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-gray-300 hover:text-white transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-8 flex-1 custom-scrollbar">
          
          {/* Detalles Generales */}
          <div className="text-center space-y-1">
            <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Cineflix</p>
            <p className="font-bold text-lg text-white">{order._Cinemas?.name || 'Sucursal Principal'}</p>
            <p className="text-xs text-gray-500">Emitido: {formatDate(order.createdAt || order.date)}</p>
          </div>

          {/* Boletería Agrupada */}
          {hasTickets && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-yellow-400 mb-4 border-b border-white/10 pb-2">
                <FiFilm className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-widest text-sm">Boletería</h3>
              </div>
              
              <div className="relative bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#231640] rounded-full border-r border-white/10" />
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#231640] rounded-full border-l border-white/10" />
                
                <div className="p-5 border-b border-white/5">
                  <h4 className="font-black text-2xl text-white mb-2">{movieTitle}</h4>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                    {showDate && (
                      <div className="flex items-center gap-1.5">
                        <FiClock className="w-4 h-4 text-yellow-400" />
                        <span>{showDate}</span>
                      </div>
                    )}
                    {roomName && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-yellow-400">SALA</span>
                        <span>{roomName}</span>
                      </div>
                    )}
                    {language && (
                      <div className="flex items-center gap-1.5">
                        <FiVolume2 className="w-4 h-4 text-yellow-400" />
                        <span>{language}</span>
                      </div>
                    )}
                    {projection && (
                      <div className="flex items-center gap-1.5">
                        <FiVideo className="w-4 h-4 text-yellow-400" />
                        <span>{projection}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 bg-black/20">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Asientos ({order._Tickets.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {order._Tickets.map((t) => (
                      <div key={t.id} className="bg-yellow-400 text-black font-bold px-3 py-1.5 rounded text-sm flex flex-col items-center">
                        <span>{t._Seats?.row_identifier ? `${t._Seats.row_identifier}${t._Seats.column_number}` : (t._Seats?.name || t.seat_name || `#${t.seat}`)}</span>
                        {t._AudienceCategories?.name && (
                          <span className="text-[10px] opacity-70 uppercase tracking-tighter -mt-1">{t._AudienceCategories.name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Confitería */}
          {hasLines && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-yellow-400 mb-4 border-b border-white/10 pb-2">
                <FiCoffee className="w-5 h-5" />
                <h3 className="font-bold uppercase tracking-widest text-sm">Confitería</h3>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                {order._OrderLines.map((line) => (
                  <div key={line.id} className="flex justify-between items-center text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <span className="font-bold text-white/50">{line.quantity ?? 1}x</span>
                      <div>
                        <p className="font-semibold text-white">{line.productName || line.name || `Producto #${line.product || line.combo}`}</p>
                        <p className="text-xs text-gray-500">${formatNumber(line.unit_price ?? line.original_unit_price)} c/u</p>
                      </div>
                    </div>
                    <div className="font-mono text-white font-semibold">
                      ${formatNumber((line.unit_price ?? line.original_unit_price) * (line.quantity ?? 1))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QR Code Real */}
          <div className="flex flex-col items-center justify-center pt-6 border-t border-white/10 border-dashed space-y-4">
            <div className="bg-white p-3 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <QRCodeSVG 
                value={order.qr_code || order.id?.toString() || "NO_DATA"} 
                size={140}
                level="L"
                includeMargin={true}
              />
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest text-center w-3/4">
              Presenta este código al {showMovie ? 'ingresar a las salas' : 'retirar tu confitería'}
            </p>
          </div>

        </div>

        {/* Total Banner */}
        <div className="bg-yellow-500 p-4 text-black flex justify-between items-center">
          <p className="uppercase font-bold tracking-wider text-sm">Total de este Ticket</p>
          <p className="font-black text-2xl">${specificTotal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true })}</p>
        </div>
      </div>
    </div>
  )
}
