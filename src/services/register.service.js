import axios from 'axios'

const API_URL = 'http://localhost:3000/api/customers'

export const registerRequest = async (data) => {
  const response = await axios.post(`${API_URL}/signup`, data)
  return response.data
}
