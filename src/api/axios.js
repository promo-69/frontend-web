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

// Modificado para pasar el error si el refresh falla
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      // CRÍTICO: Si la petición que falló ya era el refresh, no intentes refrescar otra vez
      if (originalRequest.url === '/auth/refresh') {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await api.post('/auth/refresh')

        processQueue(null)
        isRefreshing = false

        return api(originalRequest)
      } catch (err) {
        // Si el refresh falla, cancelamos la cola pasándole el error
        processQueue(err, null)
        isRefreshing = false

        // Limpiamos rastro del usuario local
        localStorage.removeItem('user_logged')

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
