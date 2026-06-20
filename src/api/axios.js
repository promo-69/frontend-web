import axios from 'axios'
// Usar ruta de refresh relativa estándar; el backend ya está corregido.
const BASE_API = import.meta.env.VITE_API_URL || ''

// ⭐ Instancia para endpoints públicos (NO usa cookies, NO usa refresh)
export const apiPublic = axios.create({
  baseURL: BASE_API,
  timeout: 10000,
  headers: {
    'x-client-channel': 'web',
  },
})

// ⭐ Instancia para endpoints privados (SÍ usa cookies y refresh)
const api = axios.create({
  baseURL: BASE_API,
  withCredentials: true,
  timeout: 15000,
  headers: {
    'x-client-channel': 'web',
  },
})


// Use a single refresh promise to coordinate concurrent 401 handlers
let refreshPromise = null

export const performRefresh = () => {
  if (refreshPromise) return refreshPromise
  refreshPromise = api
    .post('/auth/refresh')
    .then((refreshRes) => {
      refreshPromise = null
      return refreshRes
    })
    .catch((err) => {
      refreshPromise = null
      throw err
    })

  return refreshPromise
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

      // Si ya hay una promesa de refresh en curso, esperarla
      if (refreshPromise) {
        originalRequest._retry = true
        return refreshPromise.then(() => api(originalRequest)).catch((err) => Promise.reject(err))
      }

      // No hay refresh en curso: iniciarlo y almacenar la promesa
      originalRequest._retry = true
      try {
        await performRefresh()
        return api(originalRequest)
      } catch (err) {
        // Log para depuración cuando el refresh falla dentro del interceptor
        try {
          console.error('Interceptor refresh failed:', err.response?.status, err.response?.data)
        } catch (e) {
          console.error('Interceptor refresh failed (no response):', err)
        }

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
          console.warn('Refresh failed with status', status, '- not logging out.')
        }

        return Promise.reject(err)
      }
    }

    return Promise.reject(error)
  },
)

export default api
