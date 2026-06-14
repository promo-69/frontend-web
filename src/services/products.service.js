import api from '../api/axios'

// Obtener lista de productos (posible filter por cinemaId)
export const fetchProductsByCinema = async (cinemaId) => {
  try {
    const params = {}
    if (cinemaId != null) params.cinemaId = cinemaId
    const res = await api.get('/concessions/products', { params })
    return res.data?.data || res.data || []
  } catch (error) {
    const status = error.response?.status
    const data = error.response?.data
    console.error('fetchProductsByCinema error:', { cinemaId, status, data, message: error.message })
    return []
  }
}

// Obtener producto por id
export const fetchProductById = async (id) => {
  try {
    const res = await api.get(`/concessions/products/${id}`)
    return res.data?.data || res.data || null
  } catch (error) {
    const status = error.response?.status
    const data = error.response?.data
    console.error('fetchProductById error:', { id, status, data, message: error.message })
    return null
  }

}

export default {
  fetchProductsByCinema,
  fetchProductById,
}
