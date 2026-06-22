import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useCart } from '../../../context/CartContext'
import { createOrderCheckout } from '../../../services/orders.service'
import socketService from '../../../services/socket.service' // Tu servicio de sockets
import Payment from './payment'
import { Loader2, Film, Ticket, Coffee } from 'lucide-react'

export default function Checkout() {
  const { showtimeId } = useParams()
  const navigate = useNavigate()
  const { cart, clearCart } = useCart()

  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)
  const [orderData, setOrderData] = useState(null)
  const [isOrderFrozen, setIsOrderFrozen] = useState(false)

  useEffect(() => {
    // Conectamos el canal único global
    socketService.connect()

    if (showtimeId) {
      // el servicio se encarga de esperar el connect si está en handshake e introduce el ID numérico seguro
      socketService.joinShowtime(showtimeId)
    }

    return () => {
      if (showtimeId) {
        socketService.leaveShowtime(showtimeId)
      }
    }
  }, [showtimeId])

  // Confirmar el Carrito contra el Backend (Checkout)
  useEffect(() => {
    const performCheckout = async () => {
      try {
        const payload = {
          tickets: (cart.tickets || []).map((t) => ({
            seatId: t.id || t.seatId,
            audienceCategoryId: t.audienceCategoryId || 1,
          })),
          concessions: (cart.products || []).map((p) => ({
            line_type: p.line_type || 1,
            product: p.id || p.product,
            quantity: p.quantity,
          })),
        }

        const data = await createOrderCheckout(payload)
        setOrderData(data)
        setIsOrderFrozen(true)
        setLoading(false)
      } catch (error) {
        setErrorMsg(
          error.response?.data?.message ||
            'Error al procesar el inventario de la orden.',
        )
        setLoading(false)
      }
    }

    if (
      (!cart.tickets || cart.tickets.length === 0) &&
      (!cart.products || cart.products.length === 0)
    ) {
      navigate('/')
      return
    }

    performCheckout()
  }, [cart, navigate])

  // Cancelar orden de forma voluntaria o por error
  const handleCancelOrder = async () => {
    try {
      await deleteOrderSessionWithRetries()
      clearCart()
      navigate('/')
    } catch (err) {
      console.error('Error al liberar la sesión:', err)
      navigate('/')
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#1E112A] text-white p-6">
        <Loader2 className="w-16 h-16 animate-spin text-[#FFC107] mb-4" />
        <h2 className="text-2xl font-bold tracking-wide">
          Asegurando tu orden...
        </h2>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#12071F] text-white py-10 px-4 md:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* FORMULARIO DE PAGOS */}
        <div className="lg:col-span-7 bg-[#1D0E2E] border border-[#2D1B4E] rounded-2xl p-6 shadow-xl">
          {isOrderFrozen && orderData && (
            <Payment
              order={orderData}
              onPaymentSuccess={() => {
                clearCart()
                navigate('/success-digital-ticket')
              }}
            />
          )}
        </div>

        {/* Resumen visual de la compra */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#1D0E2E] border border-[#2D1B4E] rounded-2xl p-6 shadow-xl">
            <h3 className="text-xl font-bold text-[#FFC107] border-b border-[#2D1B4E] pb-3 mb-4 flex items-center gap-2">
              <Film className="w-5 h-5" /> Resumen de la Orden
            </h3>

            {/* Detalles de la Película si aplica */}
            {orderData?.movie && (
              <div className="mb-4 bg-[#26153A] p-4 rounded-xl">
                <h4 className="font-bold text-white text-lg">
                  {orderData.movie.title}
                </h4>
                <p className="text-gray-400 text-sm mt-1">
                  Sala: {orderData.movie.room}
                </p>
                <p className="text-gray-400 text-sm">
                  Hora: {orderData.movie.time || 'N/A'}
                </p>
              </div>
            )}

            {/* Listado de Boletos */}
            {cart.tickets && cart.tickets.length > 0 && (
              <div className="mb-6">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold block mb-2 flex items-center gap-1">
                  <Ticket className="w-3.5 h-3.5" /> Tickets Seleccionados
                </span>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-2 custom-scrollbar">
                  {cart.tickets.map((ticket, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-[#26153A] p-3 rounded-lg text-sm"
                    >
                      <div>
                        <p className="font-medium text-white">
                          Asiento {ticket.name || ticket.label}
                        </p>
                        <span className="text-xs bg-[#5B259F] text-purple-200 px-2 py-0.5 rounded-full mt-1 inline-block">
                          Adulto
                        </span>
                      </div>
                      <span className="font-bold text-gray-200">
                        ${Number(ticket.price || 6).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Listado de Confitería */}
            {cart.products && cart.products.length > 0 && (
              <div className="mb-6">
                <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold block mb-2 flex items-center gap-1">
                  <Coffee className="w-3.5 h-3.5" /> Confitería
                </span>
                <div className="space-y-2">
                  {cart.products.map((prod, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-[#26153A] p-3 rounded-lg text-sm"
                    >
                      <p className="text-white">
                        {prod.name}{' '}
                        <span className="text-[#FFC107] font-bold ml-1">
                          x{prod.quantity}
                        </span>
                      </p>
                      <span className="font-bold text-gray-200">
                        ${(Number(prod.price) * prod.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matriz de del Backend */}
            <div className="border-t border-[#2D1B4E] pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal:</span>
                <span className="font-medium">
                  ${Number(orderData?.subtotal || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>IVA (16%):</span>
                <span className="font-medium">
                  ${Number(orderData?.tax || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-dashed border-[#2D1B4E]">
                <span className="text-[#FFC107]">Total:</span>
                <span className="text-[#FFC107]">
                  ${Number(orderData?.total || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={handleCancelOrder}
              className="w-full mt-6 bg-transparent hover:bg-red-900/20 text-red-400 border border-red-500/30 hover:border-red-500 font-medium py-2.5 rounded-xl transition-all text-xs uppercase tracking-wider"
            >
              Cancelar Transacción
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}