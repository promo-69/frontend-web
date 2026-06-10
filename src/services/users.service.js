import api from '../api/axios'

// ---------------------------------------------------------
// GET MY ORDERS
// Soporta query params: page, limit, from (ISO), to (ISO)
// ---------------------------------------------------------
export const getMyOrdersRequest = async ({ page = 1, limit = 10, fromDate, toDate } = {}) => {
  try {
    const params = { page, limit }
    if (fromDate) params.from = fromDate
    if (toDate) params.to = toDate

    const response = await api.get('/users/me/orders', {
      params,
      withCredentials: true,
    })

    return response.data
  } catch (error) {
    const status = error.response?.status
    const data = error.response?.data
    console.error('getMyOrdersRequest error:', { status, data, message: error.message })
    return null
  }
}

// ---------------------------------------------------------
// GET ORDER TICKET
// ---------------------------------------------------------
export const getMyOrderTicketRequest = async (orderId) => {
  try {
    const response = await api.get(`/users/me/orders/${orderId}/ticket`, {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    const status = error.response?.status
    const data = error.response?.data
    console.error('getMyOrderTicketRequest error:', { orderId, status, data, message: error.message })
    return null
  }
}

// ---------------------------------------------------------
// GET LOYALTY SUMMARY
// ---------------------------------------------------------
export const getMyLoyaltyRequest = async () => {
  try {
    const response = await api.get('/users/me/loyalty', {
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    const status = error.response?.status
    const data = error.response?.data
    console.error('getMyLoyaltyRequest error:', { status, data, message: error.message })
    return null
  }
}

// ---------------------------------------------------------
// GET LOYALTY LEDGERS (paginated)
// ---------------------------------------------------------
export const getMyLoyaltyLedgersRequest = async (page = 1, limit = 10) => {
  try {
    const response = await api.get('/users/me/loyalty/ledgers', {
      params: { page, limit },
      withCredentials: true,
    })
    return response.data
  } catch (error) {
    const status = error.response?.status
    const data = error.response?.data
    console.error('getMyLoyaltyLedgersRequest error:', { status, data, message: error.message })
    return null
  }
}
