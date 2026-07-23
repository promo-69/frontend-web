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

  // Lógica de Validación (Usado o Expirado)
  const now = new Date()
  let ticketStatus = 'VALID' // 'VALID', 'USED', 'EXPIRED'
  let statusMessage = 'VÁLIDO'
  
  if (showMovie) {
    if (order.tickets_validated_at) {
      ticketStatus = 'USED'
      statusMessage = 'USADO'
    } else if (hasTickets) {
      const firstTicket = order._Tickets[0]
      const booking = firstTicket?._RoomBookings
      if (booking?.end_time && now > new Date(booking.end_time)) {
        ticketStatus = 'EXPIRED'
        statusMessage = 'EXPIRADO'
      }
    }
  } else if (showConfectionery) {
    if (order.concessions_validated_at) {
      ticketStatus = 'USED'
      statusMessage = 'USADO'
    } else {
      const orderDate = new Date(order.createdAt || order.date)
      const expirationDate = new Date(orderDate.getTime() + 24 * 60 * 60 * 1000) // 24 horas después
      if (now > expirationDate) {
        ticketStatus = 'EXPIRED'
        statusMessage = 'EXPIRADO'
      }
    }
  }

  // Calcular subtotal específico para el ticket mostrado
  let specificTotal = 0
  if (showMovie) {
    specificTotal = (order._Tickets || []).reduce((sum, t) => sum + parseFloat(t.price ?? t.original_price ?? t.unit_price ?? 0), 0)
  } else if (showConfectionery) {
    specificTotal = (order._OrderLines || []).reduce((sum, line) => sum + (parseFloat(line.unit_price ?? line.original_unit_price ?? 0) * (line.quantity ?? 1)), 0)
  }
  
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
            <div className="flex gap-3 items-center mt-1">
              <p className="text-xs text-yellow-400 font-mono">ORDEN #{order.id || order.orderId}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                ticketStatus === 'VALID' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                ticketStatus === 'USED' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>{statusMessage}</span>
            </div>
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

          {/* QR Code Real con Overlay de Validación */}
          <div className="relative flex flex-col items-center justify-center pt-6 border-t border-white/10 border-dashed space-y-4">
            
            {ticketStatus !== 'VALID' && (
              <div className="absolute inset-0 z-10 flex items-center justify-center pt-6">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] rounded-xl mt-6"></div>
                <div className={`relative border-[5px] ${ticketStatus === 'USED' ? 'border-blue-500 text-blue-500' : 'border-red-500 text-red-500'} font-black text-3xl uppercase tracking-widest px-6 py-2 transform -rotate-[15deg] rounded-lg shadow-2xl bg-[#231640]/80`}>
                  {statusMessage}
                </div>
              </div>
            )}

            <div className={`bg-white p-3 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-opacity ${ticketStatus !== 'VALID' ? 'opacity-30' : 'opacity-100'}`}>
              <QRCodeSVG 
                value={order.qr_code || order.id?.toString() || "NO_DATA"} 
                size={140}
                level="L"
                includeMargin={true}
              />
            </div>
            <p className={`text-[10px] uppercase tracking-widest text-center w-3/4 ${ticketStatus !== 'VALID' ? 'text-red-400' : 'text-gray-500'}`}>
              {ticketStatus === 'VALID' 
                ? `Presenta este código al ${showMovie ? 'ingresar a la sala' : 'retirar tu confitería'}` 
                : `Este ticket ya no es válido (${statusMessage.toLowerCase()})`}
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
