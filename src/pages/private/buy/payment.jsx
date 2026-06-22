import React, { useState, useEffect } from 'react'
import { registerPayment } from '../../../services/orders.service'
import socketService from '../../../services/socket.service'
import {
  CreditCard,
  Landmark,
  DollarSign,
  Wallet,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

export default function Payment({ order, onPaymentSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('') // 1: Cash, 2: POS, 3: Transfer, 5: Points
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState(1) // 1: USD, 2: VES
  const [referenceNumber, setReferenceNumber] = useState('')
  const [bank, setBank] = useState('')

  const [remainingBalance, setRemainingBalance] = useState(Number(order.total))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  
  useEffect(() => {
    const handlePaymentSuccess = (payload) => {
      console.log('Evento payment_success recibido vía WS Service:', payload)
      
      onPaymentSuccess(payload)
    }

    socketService.on('payment_success', handlePaymentSuccess)

    return () => {
      socketService.off('payment_success', handlePaymentSuccess)
    }
  }, [onPaymentSuccess])

  const handleSubmitPayment = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      
      const payload = {
        payment_method: Number(paymentMethod),
        amount: Number(amount),
        currency: Number(currency),
      }

      // Si requiere banco y número de referencia (Transferencias o Puntos de venta)
      if (paymentMethod === '2' || paymentMethod === '3') {
        payload.reference_number = referenceNumber
        payload.bank = Number(bank || 1)
        payload.bypass = true 
      }

      const response = await registerPayment(payload)

      // Si el monto no cubre el total, actualizamos el saldo remanente (200 OK con remaining_balance)
      if (response && response.remaining_balance !== undefined) {
        setRemainingBalance(Number(response.remaining_balance))
        setAmount('')
        setReferenceNumber('')
        setLoading(false)
      }

      // NOTA: Si cubre el total, el backend responderá la orden o disparará el WS 'payment_success'
    } catch (err) {
      console.error(err)
      setError(
        err.response?.data?.message ||
          'Error al registrar la transacción de pago.',
      )
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <CreditCard className="text-[#FFC107]" /> Método de Pago
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Selecciona tu opción preferida. Puedes realizar pagos mixtos si tu
          saldo lo requiere.
        </p>
      </div>

      {/* Alerta de Saldo Remanente */}
      <div className="bg-[#26153A] border border-[#5B259F] rounded-xl p-4 flex justify-between items-center">
        <span className="text-gray-300 text-sm font-medium">
          Saldo por pagar:
        </span>
        <span className="text-2xl font-black text-[#FFC107]">
          ${remainingBalance.toFixed(2)}
        </span>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/50 text-red-200 text-xs p-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Selectores de Métodos de Pago */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: '1', label: 'Efectivo', icon: DollarSign },
          { id: '2', label: 'Punto Venta', icon: CreditCard },
          { id: '3', label: 'Transferencia', icon: Landmark },
          { id: '5', label: 'Puntos Cine', icon: Wallet },
        ].map((method) => {
          const Icon = method.icon
          const isSelected = paymentMethod === method.id
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => {
                setPaymentMethod(method.id)
                setCurrency(method.id === '3' ? 2 : 1) // Forzar VES (2) si es transferencia por defecto
              }}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all font-medium text-xs uppercase tracking-wider ${
                isSelected
                  ? 'border-[#FFC107] bg-[#FFC107]/10 text-[#FFC107]'
                  : 'border-[#2D1B4E] bg-[#160A25] text-gray-400 hover:text-white hover:border-[#5B259F]'
              }`}
            >
              <Icon className="w-5 h-5" />
              {method.label}
            </button>
          )
        })}
      </div>

      {/* Formulario Dinámico */}
      {paymentMethod && (
        <form
          onSubmit={handleSubmitPayment}
          className="space-y-4 pt-4 border-t border-[#2D1B4E]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Campo Monto */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">
                Monto a Procesar
              </label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-[#160A25] border border-[#2D1B4E] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5B259F] text-sm"
              />
            </div>

            {/* Campo Moneda */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">
                Moneda
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(Number(e.target.value))}
                className="w-full bg-[#160A25] border border-[#2D1B4E] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5B259F] text-sm"
              >
                <option value={1}>USD ($)</option>
                <option value={2}>VES (Bs.)</option>
              </select>
            </div>
          </div>

          {/* Campos adicionales para Transferencia o Puntos de Venta */}
          {(paymentMethod === '2' || paymentMethod === '3') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animated fadeIn">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">
                  Número de Referencia
                </label>
                <input
                  type="text"
                  required
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Ej: 12345678"
                  className="w-full bg-[#160A25] border border-[#2D1B4E] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5B259F] text-sm"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">
                  Banco Emisor
                </label>
                <select
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  required
                  className="w-full bg-[#160A25] border border-[#2D1B4E] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5B259F] text-sm"
                >
                  <option value="">Selecciona un banco</option>
                  <option value={1}>Banco de Venezuela</option>
                  <option value={2}>Banesco</option>
                  <option value={3}>Mercantil</option>
                  <option value={4}>Provincial</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || Number(amount) <= 0}
            className="w-full mt-4 bg-[#FFC107] hover:bg-[#E0A800] disabled:bg-gray-600 disabled:cursor-not-allowed text-[#1E112A] font-bold py-3.5 px-6 rounded-xl transition-all uppercase tracking-wider text-sm shadow-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              'Validando transacción con el servidor...'
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" /> Registrar Aplicación de
                Pago
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
