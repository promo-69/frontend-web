import api from '../api/axios'

// LOGIN
export const loginRequest = async (data) => {
  const response = await api.post('/auth/login', data)
  return response.data
}

// REGISTER
export const registerRequest = async (data) => {
  const response = await api.post('/auth/signup', data)
  return response.data
}

// RECOVERY: Paso 1
export const sendRecoveryEmailRequest = async (email) => {
  const response = await api.post('/auth/recovery/send-email', { email })
  return response.data
}

// RECOVERY: Paso 2
export const verifyRecoveryCodeRequest = async (email, code) => {
  const response = await api.post('/auth/recovery/verify-code', { email, code })
  return response.data
}

// RECOVERY: Paso 3
export const resetPasswordRequest = async ({ email, newPassword, code }) => {
  const response = await api.post('/auth/recovery/reset-password', {
    email,
    newPassword,
    code,
  })
  return response.data
}
