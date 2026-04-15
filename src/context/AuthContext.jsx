import { createContext, useState } from 'react'
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
  // LOGIN
  // ---------------------------------------------------------
  const login = async (credentials) => {
    try {
      const data = await loginRequest(credentials)

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
    const response = await sendRecoveryEmailRequest(email)
    return response.data
  }

  // ---------------------------------------------------------
  // RECOVERY: Paso 2 — Validar código
  // ---------------------------------------------------------
  const verifyRecoveryCode = async (email, code) => {
    const response = await verifyRecoveryCodeRequest(email, code)
    return response.data
  }

  // ---------------------------------------------------------
  // RECOVERY: Paso 3 — Guardar nueva contraseña
  // ---------------------------------------------------------
  const resetPassword = async ({ email, newPassword, code }) => {
    const response = await resetPasswordRequest({ email, newPassword, code })
    return response.data
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
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
