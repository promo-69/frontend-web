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

// Obtener la sesión de compra activa (si existe)
export const getOrderSession = async () => {
  const res = await api.get('/orders/session')
  return res.data
}

// Obtener detalles de la sesión (incluye order pendiente si aplica)
export const getOrderSessionDetails = async () => {
  const res = await api.get('/orders/session/details')
  return res.data
}

// Eliminar / cancelar la sesión de compra actual
export const deleteOrderSession = async () => {
  const res = await api.delete('/orders/session')
  return res.data
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export const deleteOrderSessionWithRetries = async (
  retries = 3,
  backoffMs = 1000,
) => {
  let lastError = null

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      return await deleteOrderSession()
    } catch (error) {
      lastError = error
      if (attempt === retries) {
        break
      }
      await sleep(backoffMs * attempt)
    }
  }

  throw lastError
}
