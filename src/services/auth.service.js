import axios from 'axios'

const API_URL = 'http://localhost:3000' 

// LOGIN
export const loginRequest = async (data) => {
  const response = await axios.post(`${API_URL}/customers/login`, data)
  return response.data
}

// REGISTER
export const registerRequest = async (data) => {
  return axios.post(`${API_URL}/customers/signup`, data)
}

// RECOVERY: Paso 1
export const sendRecoveryEmailRequest = async (email) => {
  return axios.post(`${API_URL}/auth/recovery/send-email`, { email })
}

// RECOVERY: Paso 2
export const verifyRecoveryCodeRequest = async (email, code) => {
  return axios.post(`${API_URL}/auth/recovery/verify-code`, { email, code })
}

// RECOVERY: Paso 3
export const resetPasswordRequest = async (email, newPassword) => {
  return axios.post(`${API_URL}/auth/recovery/reset-password`, {
    email,
    newPassword,
  })
}
