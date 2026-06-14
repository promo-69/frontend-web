import api from '../api/axios'

// Toda la lista de Sucursales - Mary
export const getCinemas = async () => {
  const response = await api.get('/cinemas')
  return response.data.data 
}