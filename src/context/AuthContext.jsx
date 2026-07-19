import { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react'
import {
  loginRequest,
  logoutRequest,
  refreshSessionRequest,
  getPermissionsRequest,
} from '../services/auth.service'
import { getCurrentUserRequest } from '../services/auth.service'
import { useLoading } from './LoadingContext'
import { 
  sendRecoveryEmailRequest, 
  verifyRecoveryCodeRequest, 
  resetPasswordRequest 
} from '../services/auth.service'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const { showLoader, hideLoader } = useLoading()

  // Derivamos el estado de autenticación directamente del estado del usuario
  const isAuthenticated = useMemo(() => !!user, [user])

  // CARGAR SESIÓN INICIAL (Manejado de forma segura post-F5)
  useEffect(() => {
    let isMounted = true

    async function initSession() {
      if (!localStorage.getItem('user_logged')) {
        console.log('DEBUG CONTEXTO: Modo invitado activo.')
        if (isMounted) {
          setUser(null)
          setInitializing(false)
        }
        return
      }

      showLoader()
      try {
        const resData = await refreshSessionRequest()
        
        if (!isMounted) return

        let userData = resData?.data?.user || resData?.data?.data?.user

        if (userData) {
          try {
            const perms = await getPermissionsRequest()
            userData.permissions = perms || []
          } catch (e) {
            console.error('Error fetching permissions on refresh:', e)
            userData.permissions = []
          }
          // enriquecer el objeto user con los datos completos de /users/me
          try {
            const meRes = await getCurrentUserRequest()
            const payload = meRes?.data?.data?.person || meRes?.data?.person || meRes?.data?.data || meRes?.data
            if (payload) {
              const patch = {}
              const normalize = (v) => (v === undefined || v === null || (typeof v === 'string' && !v.trim()) ? null : v)
              const birth = normalize(payload.birth_date) || normalize(payload?._People?.birth_date) || normalize(payload?.birthday) || normalize(payload?.dateOfBirth) || normalize(payload?.dob)
              if (birth) patch.birth_date = birth
              const personal_email = normalize(payload.personal_email) || normalize(payload?._People?.personal_email) || normalize(payload.email)
              if (personal_email) patch.personal_email = personal_email
              const phone = normalize(payload.phone_number) || normalize(payload?._People?.phone_number)
              if (phone) patch.phoneNumber = phone
              const first = normalize(payload.first_name) || normalize(payload?._People?.first_name)
              if (first) patch.firstName = first
              const last = normalize(payload.last_name) || normalize(payload?._People?.last_name)
              if (last) patch.lastName = last
              if (payload._People) patch._People = payload._People

              userData = { ...userData, ...patch }
            }
          } catch (e) {
            console.warn('Could not fetch /users/me to enrich user after refresh:', e)
          }

          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
        } else {
          console.warn("DEBUG CONTEXTO: Respuesta exitosa sin objeto 'user'.")
          localStorage.removeItem('user_logged')
          localStorage.removeItem('user')
          setUser(null)
        }
      } catch (err) {
        if (!isMounted) return
        console.error('DEBUG CONTEXTO: La sesión expiró o es inválida.', err?.response?.status)
        
        localStorage.removeItem('user_logged')
        localStorage.removeItem('user')
        setUser(null)
      } finally {
        if (isMounted) {
          hideLoader()
          setInitializing(false)
        }
      }
    }

    initSession()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const handleExternalLogout = () => {
      localStorage.removeItem('user_logged')
      localStorage.removeItem('user')
      setUser(null)
    }

    window.addEventListener('auth:logout', handleExternalLogout)
    return () => window.removeEventListener('auth:logout', handleExternalLogout)
  }, [])

  const login = useCallback(async (credentials) => {
    try {
      const loginRes = await loginRequest(credentials)
      let userData = loginRes?.data?.user || loginRes?.data?.data?.user

      if (!userData) {
        const resData = await refreshSessionRequest()
        userData = resData?.data?.user || resData?.data?.data?.user
      }

      if (!userData) {
        return {
          success: false,
          message: 'No se pudieron recuperar los datos del usuario tras el login.',
        }
      }

      try {
        const perms = await getPermissionsRequest()
        userData.permissions = perms || []
      } catch (e) {
        console.error('Error fetching permissions on login:', e)
        userData.permissions = []
      }

      try {
        const meRes = await getCurrentUserRequest()
        const payload = meRes?.data?.data?.person || meRes?.data?.person || meRes?.data?.data || meRes?.data
        console.log('DEBUG login /users/me payload:', payload)
        if (payload) {
          const birth = payload.birth_date || payload?._People?.birth_date || payload?.birthday || payload?.dateOfBirth || payload?.dob
          if (birth) userData.birth_date = birth

          const personal_email = payload.personal_email || payload?._People?.personal_email || payload.email
          if (personal_email) userData.personal_email = personal_email

          const phone = payload.phone_number || payload?._People?.phone_number
          if (phone) userData.phoneNumber = phone

          const first = payload.first_name || payload?._People?.first_name
          if (first) userData.firstName = first

          const last = payload.last_name || payload?._People?.last_name
          if (last) userData.lastName = last

          if (payload._People) userData._People = payload._People
        }
      } catch (e) {
        console.warn('Could not fetch /users/me to enrich user after login:', e)
      }

      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      localStorage.setItem('user_logged', 'true')

      return { success: true, user: userData }
    } catch (error) {
      console.error('CATCH CONTEXTO - Error en login:', error)
      return {
        success: false,
        message: error?.response?.data?.message || 'Error al iniciar sesión',
        status: error?.response?.status || 500,
        code: error?.response?.data?.code || 'UNKNOWN_ERROR',
      }
    }
  }, [])

  const logout = useCallback(async () => {
    showLoader()
    try {
      await logoutRequest()
    } catch (err) {
      console.error('Error en llamada a API logout:', err)
    } finally {
      localStorage.removeItem('user_logged')
      localStorage.removeItem('user')
      setUser(null)
      hideLoader()
    }
  }, [showLoader, hideLoader])

  const sendRecoveryEmail = useCallback(async (email) => {
    try {
      const res = await sendRecoveryEmailRequest(email)
      return { success: true, data: res }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Error' }
    }
  }, [])

  const verifyRecoveryCode = useCallback(async (email, code) => {
    try {
      const res = await verifyRecoveryCodeRequest(email, code)
      return { success: true, data: res }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Código inválido' }
    }
  }, [])

  const resetPassword = useCallback(async (payload) => {
    try {
      const res = await resetPasswordRequest(payload)
      return { success: true, data: res }
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Error' }
    }
  }, [])

  const updateProfileState = useCallback((newEmail) => {
    setUser((prev) => {
      if (!prev) return null
      const updated = { ...prev, email: newEmail, personalEmail: newEmail }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const updateUserState = useCallback((patch) => {
    setUser((prev) => {
      const updated = prev ? { ...prev, ...patch } : { ...patch }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const contextValue = useMemo(() => ({
    user,
    setUser,
    isAuthenticated,
    initializing,
    login,
    logout,
    sendRecoveryEmail,
    verifyRecoveryCode,
    resetPassword,
    updateProfileState,
    updateUserState,
  }), [user, isAuthenticated, initializing, login, logout, sendRecoveryEmail, verifyRecoveryCode, resetPassword, updateProfileState, updateUserState])

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider')
  }
  return context
}