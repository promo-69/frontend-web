import { createContext, useState, useContext, useEffect } from 'react'
import {
  loginRequest,
  logoutRequest,
  refreshSessionRequest,
} from '../services/auth.service'
import { useLoading } from './LoadingContext'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const { showLoader, hideLoader } = useLoading()

  // 1. CARGAR SESIÓN INICIAL (Se ejecuta al recargar la página)
  useEffect(() => {
    async function initSession() {
      if (!localStorage.getItem('user_logged')) {
        console.log(
          'DEBUG CONTEXTO: No hay usuario logueado en localStorage. Modo invitado activo.',
        )
        return
      }

      showLoader()
      try {
        const resData = await refreshSessionRequest()
        console.log(
          'DEBUG CONTEXTO - Respuesta cruda del backend en initSession:',
          resData,
        )

        if (resData && resData.data?.user) {
          setUser(resData.data.user)
        } else if (resData && resData.data?.data?.user) {
          setUser(resData.data.data.user)
        } else {
          console.warn(
            "DEBUG CONTEXTO: El backend respondió exitosamente pero no se encontró la propiedad '.user'",
          )
          localStorage.removeItem('user_logged')
          setUser(null)
        }
      } catch (err) {
        console.error(
          'CATCH INTERNO CONTEXTO - Error crítico en initSession:',
          err,
        )
        localStorage.removeItem('user_logged')
        setUser(null)
      } finally {
        hideLoader()
      }
    }

    initSession()
  }, [])

  // 2. INICIAR SESIÓN
  const login = async (credentials) => {
    showLoader()
    try {
      const loginRes = await loginRequest(credentials)
      console.log(
        'DEBUG CONTEXTO - Respuesta directa de loginRequest:',
        loginRes,
      )

      // Intentamos tomar el usuario directamente del login primero
      let userData = loginRes?.data?.user || loginRes?.data?.data?.user

      // Fallback: Si tu backend no manda el usuario en el login, hacemos el refresh
      if (!userData) {
        console.log(
          'DEBUG CONTEXTO - Buscando usuario vía refreshSessionRequest...',
        )
        const resData = await refreshSessionRequest()
        userData = resData?.data?.user || resData?.data?.data?.user
      }

      if (!userData) {
        return {
          success: false,
          message:
            'No se pudieron recuperar los datos del usuario tras el login.',
        }
      }

      setUser(userData)
      localStorage.setItem('user_logged', 'true')

      return { success: true, user: userData }
    } catch (error) {
      console.error('CATCH INTERNO CONTEXTO - Error en login:', error)
      return {
        success: false,
        message: error.response?.data?.message || 'Error al iniciar sesión',
      }
    } finally {
      hideLoader()
    }
  }

  // 3. CERRAR SESIÓN
  const logout = async () => {
    showLoader()
    try {
      await logoutRequest()
      localStorage.removeItem('user_logged')
      setUser(null)
    } catch (err) {
      console.error('CATCH INTERNO CONTEXTO - Error en logout:', err)
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
