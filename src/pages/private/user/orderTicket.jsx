import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getMyOrderTicketRequest } from '../../../services/users.service'
import useDocumentTitle from '../../../hooks/useDocumentTitle';


function OrderTicket() {
  const { orderId } = useParams()
  useDocumentTitle(orderId ? `Ticket de Orden #${orderId}` : 'Ticket de Orden');
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true)
      try {
        const res = await getMyOrderTicketRequest(orderId)
        if (!res) {
          setTickets([])
        } else if (res.success && res.data) {
          setTickets(Array.isArray(res.data) ? res.data : res.data.tickets || [])
        } else {
          setTickets([])
        }
      } catch (err) {
        console.error('Error fetching order ticket:', err)
        setError('No se pudo recuperar el ticket de la orden.')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) fetchTicket()
  }, [orderId])

  if (loading) return <div className="p-6 text-white">Cargando ticket...</div>
  if (error) return <div className="p-6 text-red-400">{error}</div>

  return (
    <div className="bg-[#231640] min-h-[calc(100vh-80px)] w-full flex flex-col items-center py-8 font-montserrat text-white">
      <div className="w-full max-w-3xl p-6 bg-gradient-to-b from-[#2A154B] via-[#7B1A82] to-[#231640] rounded-2xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-bold text-[#D9982F]">Ticket de la Orden #{orderId}</h2>
          <Link to="/mis-compras" className="text-[#F6AD38] font-bold">
            Volver
          </Link>
        </div>

        {tickets.length === 0 ? (
          <div className="bg-white/5 p-6 rounded">No hay tickets asociados a esta orden.</div>
        ) : (
          <ul className="space-y-4">
            {tickets.map((t, idx) => (
              <li key={t.id || idx} className="p-4 bg-white/5 rounded">
                <p className="font-bold">Entrada {idx + 1}</p>
                <p className="text-sm text-white/80">Asiento: {t.seat || t.seatNumber || '—'}</p>
                <p className="text-sm text-white/80">Sala: {t.room || t.hall || '—'}</p>
                <p className="text-sm text-white/80">Película: {t.movieTitle || t.title || '—'}</p>
                <p className="text-sm text-white/80">Horario: {t.showtime || t.time || '—'}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default OrderTicket
