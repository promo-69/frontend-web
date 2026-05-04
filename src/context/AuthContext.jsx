import { createContext, useState, useEffect } from 'react'
import {
  loginRequest,
  registerRequest,
  sendRecoveryEmailRequest,
  verifyRecoveryCodeRequest,
  resetPasswordRequest,
} from '../services/auth.service'

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  // ---------------------------------------------------------
  // Cargar sesión desde localStorage al iniciar la app
  // ---------------------------------------------------------
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  // ---------------------------------------------------------
  // LOGIN
  // ---------------------------------------------------------
  const login = async (credentials) => {
    try {
      const data = await loginRequest(credentials)

      // Guardar token y usuario
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))

      setUser(data.user)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al iniciar sesión',
      }
    }
  }

  // ---------------------------------------------------------
  // LOGOUT
  // ---------------------------------------------------------
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // ---------------------------------------------------------
  // REGISTER
  // ---------------------------------------------------------
  const register = async (finalData) => {
    try {
      const res = await registerRequest(finalData)
      return { success: true, data: res }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al registrar usuario',
      }
    }
  }

  // ---------------------------------------------------------
  // RECOVERY: Paso 1 — Enviar correo
  // ---------------------------------------------------------
  const sendRecoveryEmail = async (email) => {
    try {
      const data = await sendRecoveryEmailRequest(email)
      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message ||
          'Error al enviar correo de recuperación',
      }
    }
  }

  // ---------------------------------------------------------
  // RECOVERY: Paso 2 — Validar código
  // ---------------------------------------------------------
  const verifyRecoveryCode = async (email, code) => {
    try {
      const data = await verifyRecoveryCodeRequest(email, code)
      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || 'Código de verificación inválido',
      }
    }
  }

  // ---------------------------------------------------------
  // RECOVERY: Paso 3 — Guardar nueva contraseña
  // ---------------------------------------------------------
  const resetPassword = async ({ email, newPassword, code }) => {
    try {
      const data = await resetPasswordRequest({ email, newPassword, code })
      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.message || 'Error al restablecer contraseña',
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        register,
        sendRecoveryEmail,
        verifyRecoveryCode,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
