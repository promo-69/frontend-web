import api from '../api/axios'

// Lista de peliculas subscritas - Mary
export const getMovieSubscriptions = async () => {
  try {
    const response = await api.get('/users/me/movie-subscriptions')
    return response.data 
  } catch (error) {
    console.error('Error al obtener las suscripciones de películas:', error)
    throw error
  }
}

// Chequeo de subscripcion - Mary
export const getCheckSubscription = async (movieId) => {
  try {
    const response = await api.get(`/users/me/movie-subscriptions/${movieId}`)
    return response.data.data || response.data
  } catch (error) {
    console.error(`Error al verificar suscripción para ID ${movieId}:`, error)
    throw error
  }
}

// Subscribirse a una pelicula - Mary
export const subscribeToMovie = async (movieId) => {
  try {
    const response = await api.post('/users/me/movie-subscriptions', { movieId })
    return response.data 
  } catch (error) {
    console.error(`Error al suscribirse a la película con ID ${movieId}:`, error)
    throw error
  }
}

// Desubscribirse a una pelicula - Mary
export const unsubscribeFromMovie = async (movieId) => {
  try {
    const response = await api.delete(`/users/me/movie-subscriptions/${movieId}`)
    return response.data 
  } catch (error) {
    console.error(`Error al remover la suscripción de la película con ID ${movieId}:`, error)
    throw error
  }
}

// Desubscribirse a una pelicula en lote - Mary
export const unsubscribeFromMoviesBatch = async (movieIds) => {
  try {
    const response = await api.delete('/users/me/movie-subscriptions', {
      data: movieIds 
    })
    return response.data
  } catch (error) {
    console.error('Error al remover las suscripciones en lote:', error)
    throw error
  }
}