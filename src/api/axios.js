// src/api/axios.js
import axios from 'axios'

// ⭐ Instancia para endpoints públicos (NO usa cookies, NO usa refresh)
export const apiPublic = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'x-client-channel': 'web',
  },
})

// ⭐ Instancia para endpoints privados (SÍ usa cookies y refresh)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'x-client-channel': 'web',
  },
})


let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

// ⭐ Interceptor SOLO para api (endpoints protegidos)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 🛡️ EXCEPCIÓN: si es login y la cuenta no está verificada → NO refrescar
    const errorCode = error.response?.data?.code
    const isLoginRequest =
      originalRequest.url?.includes('/login') ||
      originalRequest.url?.includes('/auth/login')

    if (
      errorCode === 'UNVERIFIED_ACCOUNT' ||
      (error.response?.status === 401 && isLoginRequest)
    ) {
      return Promise.reject(error)
    }

    // 🛡️ Si es 401 y no se ha reintentado → refrescar
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url === '/auth/refresh') {
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await api.post('/auth/refresh')

        processQueue(null)
        isRefreshing = false

        return api(originalRequest)
      } catch (err) {
        processQueue(err, null)
        isRefreshing = false

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
