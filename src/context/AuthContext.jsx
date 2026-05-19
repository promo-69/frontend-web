import { createContext, useState, useContext, useEffect } from 'react'
import { loginRequest, logoutRequest } from '../services/auth.service'
import api from '../api/axios'
import { useLoading } from './LoadingContext'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const { showLoader, hideLoader } = useLoading()

  // ---------------------------------------------------------
  // Cargar sesión usando POST /auth/refresh
  // ---------------------------------------------------------
  useEffect(() => {
    async function initSession() {
      showLoader()
      try {
        const res = await api.post('/auth/refresh')
        setUser(res.data.data.user)
      } catch {
        setUser(null)
      } finally {
        hideLoader()
      }
    }

    initSession()
  }, [])

  // ---------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------
  const login = async (credentials) => {
    showLoader()
    try {
      await loginRequest(credentials)

      // Obtener usuario desde refresh
      const me = await api.post('/auth/refresh')
      setUser(me.data.data.user)

      return { success: true, user: me.data.data.user }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al iniciar sesión',
      }
    } finally {
      hideLoader()
    }
  }

  // ---------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------
  const logout = async () => {
    showLoader()
    try {
      await logoutRequest()
      setUser(null)
    } finally {
      hideLoader()
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
