import api from '../api/axios'

// Obtener eventos próximos - Mary  
export const getEvents = async () => {
  const response = await api.get('/special-events')
  return response.data.data 
}

// Obtener la informacion del Evento con el id - Mary
export const getEventById = async (eventId) => {
  const response = await api.get(`/special-events/${eventId}`)
  return response.data.data
}

