// src/api/axios.js
import axios from 'axios'
// Base URL configurada en .env puede apuntar a un path de pruebas (p.ej. /api/v1/test).
// Algunas cookies de refresh pueden estar emitidas en un path diferente (/api/v1/auth/refresh).
const CONFIGURED_API = import.meta.env.VITE_API_URL || ''
const API_ROOT = CONFIGURED_API.endsWith('/test')
  ? CONFIGURED_API.replace('/test', '')
  : CONFIGURED_API
// Allow explicit override for the refresh URL (keeps VITE_API_URL with 
// its `/test` suffix untouched). If not provided, derive the refresh URL
// from the API root (removing `/test` when present).
const REFRESH_FULL_PATH = import.meta.env.VITE_REFRESH_URL || `${API_ROOT}/auth/refresh`

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
      if (originalRequest.url?.includes('/auth/refresh')) {
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
        // Use the full refresh path so the cookie path matches (RT cookie)
        await api.post(REFRESH_FULL_PATH)

        processQueue(null)
        isRefreshing = false

        return api(originalRequest)
      } catch (err) {
        // Log para depuración cuando el refresh falla dentro del interceptor
        try {
          console.error('Interceptor refresh failed:', err.response?.status, err.response?.data)
        } catch (e) {
          console.error('Interceptor refresh failed (no response):', err)
        }
        processQueue(err, null)
        isRefreshing = false

        // Only perform logout flow when refresh explicitly returns 401 (invalid session).
        const status = err.response?.status
        if (status === 401) {
          localStorage.removeItem('user_logged')
          if (typeof window !== 'undefined') {
            try {
              window.dispatchEvent(new Event('auth:logout'))
            } catch (e) {
              // Fallback: do nothing
            }
          }
        } else {
          // For other errors (500, etc.) don't clear localStorage; let the app retry or wait.
          console.warn('Refresh failed with status', status, '- not logging out.')
        }

        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  },
)

export default api
