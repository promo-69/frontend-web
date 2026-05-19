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
  const response = await api.post('/auth/forgot-password', { email })
  return response.data
}

// RECOVERY: Paso 2
export const verifyRecoveryCodeRequest = async (email, code) => {
  const response = await api.post('/auth/verify-reset-code', { email, code })
  return response.data
}

// RECOVERY: Paso 3
export const resetPasswordRequest = async ({ email, newPassword }) => {
  const response = await api.post('/auth/reset-password', {
    email,
    newPassword,
  })
  return response.data
}

// VERIFY ACCOUNT
export const verifyAccountRequest = async ({ email, token }) => {
  const response = await api.post('/auth/verify-signup', { email, token })
  return response.data
}

