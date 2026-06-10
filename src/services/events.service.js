import api from '../api/axios'

// Obtener eventos próximos - Mary  
export const getEvents = async () => {
  const response = await api.get('/special-events')
  return response.data.data 
}

