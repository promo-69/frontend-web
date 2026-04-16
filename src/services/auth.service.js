import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'https://127.0.0.1/api/v1',//'https://backend-jog6.onrender.com/api/v1',
  withCredentials: true
});

// LOGIN
export const loginRequest = async (data) => {
  const response = await apiClient.post(`/auth/login`, data)
  return response.data
}

// REGISTER
export const registerRequest = async (data) => {
  return apiClient.post(`/auth/signup`, data)
}

// RECOVERY: Paso 1
export const sendRecoveryEmailRequest = async (email) => {
  return apiClient.post(`/auth/recovery/send-email`, { email })
}

// RECOVERY: Paso 2
export const verifyRecoveryCodeRequest = async (email, code) => {
  return apiClient.post(`/auth/recovery/verify-code`, { email, code })
}

// RECOVERY: Paso 3
export const resetPasswordRequest = async ({ email, newPassword }) => {
  return apiClient.post(`/auth/recovery/reset-password`, {
    email,
    newPassword,
    code
  })
}
