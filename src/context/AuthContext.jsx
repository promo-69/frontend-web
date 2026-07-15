import { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react'
import {
  loginRequest,
  logoutRequest,
  refreshSessionRequest,
  getPermissionsRequest,
  getMyProfileRequest,
} from '../services/auth.service'
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

        try {
          const profileRes = await getMyProfileRequest()
          const profileUser = profileRes?.data?.data || profileRes?.data
          if (profileUser) {
            userData = { ...userData, ...profileUser }
          }
        } catch (e) {
          console.warn('Error fetching /users/me during refresh:', e)
        }

        if (userData) {
          try {
            const perms = await getPermissionsRequest()
            userData.permissions = perms || []
          } catch (e) {
            console.error('Error fetching permissions on refresh:', e)
            userData.permissions = []
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

      if (userData) {
        try {
          const profileRes = await getMyProfileRequest()
          const profileUser = profileRes?.data?.data || profileRes?.data
          if (profileUser) {
            userData = { ...userData, ...profileUser }
          }
        } catch (e) {
          console.warn('Error fetching /users/me after login:', e)
        }
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

  const updateProfileState = useCallback((updatedFields) => {
    setUser((prev) => {
      if (!prev) return null

      const nextUser = {
        ...prev,
        ...updatedFields,
      }

      if (updatedFields.email) {
        nextUser.personalEmail = updatedFields.email
        nextUser._People = {
          ...nextUser._People,
          personal_email: updatedFields.email,
        }
      }

      if (updatedFields.firstName) {
        nextUser.firstName = updatedFields.firstName
        nextUser._People = {
          ...nextUser._People,
          first_name: updatedFields.firstName,
        }
      }

      if (updatedFields.lastName) {
        nextUser.lastName = updatedFields.lastName
        nextUser._People = {
          ...nextUser._People,
          last_name: updatedFields.lastName,
        }
      }

      if (updatedFields.birthDate) {
        nextUser.birthDate = updatedFields.birthDate
        nextUser._People = {
          ...nextUser._People,
          birth_date: updatedFields.birthDate,
        }
      }

      if (updatedFields.cellphone) {
        nextUser.phoneNumber = updatedFields.cellphone
      }

      try {
        localStorage.setItem('user', JSON.stringify(nextUser))
      } catch (error) {
        console.warn('No se pudo guardar el usuario actualizado en localStorage:', error)
      }

      return nextUser
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
    updateProfileState
  }), [user, isAuthenticated, initializing, login, logout, sendRecoveryEmail, verifyRecoveryCode, resetPassword, updateProfileState])

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