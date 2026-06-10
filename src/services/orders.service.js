import api from '../api/axios' 

/**
 * 1. Inicializar la Sesión de Compra (Cotización)
 * Abre la sesión en Redis, bloquea flujos paralelos y congela la tasa de cambio.
 * @param {Object} payload - { cinema: number, customerId?: number }
 */
export const initializeOrderQuote = async (payload) => {
  const response = await api.post('/orders/quote', payload)
  return response.data
}

/**
 * 4. Checkout (Confirmar el Carrito)
 * Envía las butacas y la confitería seleccionada para congelar el inventario real
 * en base de datos y calcular subtotales e IVA (16%).
 * @param {Object} payload - Estructura estricta con tickets y concessions (line_type)
 */
export const createOrderCheckout = async (payload) => {
  const response = await api.post('/orders/checkout', payload)
  return response.data
}

/**
 * 5. Registrar el Pago
 * Envía el reporte del pago (referencia, monto, método) para que el sistema valide
 * la transacción y complete la orden.
 * @param {Object} payload - { payment_method, amount, currency, reference_number }
 */
export const registerPayment = async (payload) => {
  const response = await api.post('/orders/payments', payload)
  return response.data
}
