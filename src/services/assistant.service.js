import api from '../api/axios'

/**
 * Envía el mensaje del usuario al asistente de IA de Cineflix
 * @param {string} message 
 * @param {number} cinemaId 
 * @returns {Promise<Object>} 
 */
export const sendAssistantMessage = async (message, cinemaId) => {
  try {
    const response = await api.post('/assistant/chat', { message, cinemaId })
    return response.data
  } catch (error) {
    console.error('Error en sendAssistantMessage service:', error)
    throw error
  }
}
