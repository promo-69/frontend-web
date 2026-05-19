import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'x-client-channel': 'web',
  },
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve()
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Si es 401 y no hemos reintentado
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Evitar refrescar desde /auth/refresh
      if (originalRequest.url === '/auth/refresh') {
        return Promise.reject(error)
      }

      // Si ya hay un refresh en progreso → cola
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => api(originalRequest))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Intento de refresh
        await api.post('/auth/refresh')

        processQueue(null)
        isRefreshing = false

        // Reintentar la petición original
        return api(originalRequest)
      } catch (err) {
        processQueue(err)
        isRefreshing = false

        // Redirigir al login
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }

        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  },
)

export default api
