import api from '../api/axios'

// ---------------------------------------------------------
// LOGIN (backend envía cookies HttpOnly)
// ---------------------------------------------------------
export const loginRequest = async (data) => {
  const response = await api.post('/auth/login', data, {
    withCredentials: true,
  })
  return response.data
}

// ---------------------------------------------------------
// OBTENER USUARIO ACTUAL 
// ---------------------------------------------------------
export const refreshSessionRequest = async () => {
  try {
    const response = await api.post('/auth/refresh')
    return response.data
  } catch (error) {
    if (error.response?.status !== 401) {
      console.error('Error técnico en el servidor:', error)
    }
    return null
  }
}

// ---------------------------------------------------------
// LOGOUT 
// ---------------------------------------------------------
export const logoutRequest = async () => {
  const response = await api.post(
    '/auth/logout',
    {},
    {
      withCredentials: true,
    },
  )
  return response.data
}

// ---------------------------------------------------------
// REGISTER
// ---------------------------------------------------------
export const registerRequest = async (data) => {
  const response = await api.post('/auth/signup', data, {
    withCredentials: true,
  })
  return response.data
}

// ---------------------------------------------------------
// RECOVERY: Paso 1 — Enviar correo
// ---------------------------------------------------------
export const sendRecoveryEmailRequest = async (email) => {
  const response = await api.post(
    '/auth/forgot-password/2',
    { email },
    { withCredentials: true },
  )
  return response.data
}

// ---------------------------------------------------------
// RECOVERY: Paso 2 — Validar código
// ---------------------------------------------------------
export const verifyRecoveryCodeRequest = async (email, code) => {
  const response = await api.post(
    '/auth/verify-reset-code/2',
    { email, code },
  )
  return response.data
}

// ---------------------------------------------------------
// RECOVERY: Paso 3 — Guardar nueva contraseña
// ---------------------------------------------------------
export const resetPasswordRequest = async ({ email, newPassword, resetToken }) => {
  const response = await api.post(
    '/auth/reset-password/2',
    { email, newPassword, resetToken },
  )
  return response.data
}

// ---------------------------------------------------------
// VERIFY ACCOUNT
// ---------------------------------------------------------
export const verifyAccountRequest = async ({ email, code }) => {
  const response = await api.post(
    '/auth/verify-signup',
    { email, code },
  )
  return response.data
}


// ---------------------------------------------------------
// UPDATE PROFILE
// ---------------------------------------------------------
export const updateProfileRequest = async (data) => {
  const response = await api.patch('/users/me/profile', data, {
    withCredentials: true,
  })
  return response.data
}