import api from '../api/axios'
import { apiPublic } from '../api/axios'

// Endpoint para obtener las películas en cartelera (estreno) - Mary
export const getMoviesNowPlaying = async (genre) => {
  const response = await apiPublic.get('/movies/now-playing', {
    params: { genre },
  })
  return response.data?.data || []
}

// De un peliculas, obtengo las sucursales y funciones disponibles - Mary
export const getCinemaShowtimebyDateMovies = async (movieId, date) => {
  const response = await api.get(`/showtimes/by-content/movie/${movieId}/`, {
  params: { date }
  })
  return response.data.data 
}

// Peliculas y funciones por sucursales - Mary
export const getMoviesByCinema = async (cinemaId) => {
  const response = await apiPublic.get(`/showtimes/billboard/${cinemaId}`)
  return response.data?.data || []
}

// Endpoint para obtener la información detallada de una película por su ID - Mary
export const getMovieById = async (id) => {
  const response = await api.get(`/movies/${id}`)
  return response.data?.data || []
}


// Endpoint para peliculas en cartelera regular, estreno y ultimos dias - Mary
export const getMoviesBillboard = async (id) => {
  const response = await api.get(`/showtimes/billboard/full`)
  return response.data?.data || []
}


// Endpoint para proximos estrenos - Mary
export const getUpcomingMovies = async () => {
  const response = await api.get('/movies/upcoming')
  return response.data?.data || []
}

// Endpoint de peliculas activas - Mary
export const getActiveMovies = async () => {
  const response = await api.get('/movies/active')
  return response.data?.data || []
}

// Lista de los generos que me gustan de las peliculas- Mary
export const getMoviesGenres = async () => {
  const response = await api.get('/users/me/movie-genres')
  return response.data?.data || []
}

// Lista de peliculas por los generos pasados - Mary
export const getMoviesByGenres = async (genreIds) => {
  if (!genreIds || genreIds.length === 0) return []
  
  const response = await api.get('/movies/by-genre', {
    params: { 
      genres: Array.isArray(genreIds) ? genreIds.join(',') : genreIds 
    }
  })
  return response.data?.data || []
}

// Catalogo de Generos segun la base de datos - Mary
export const getAvailableGenres = async () => {
  const response = await api.get('/catalogs/genres')
  return response.data?.data || []
}

// Endpoint para añadir nuevos géneros favoritos (Espera un Array de IDs) - Mary
export const addFavoriteGenres = async (genreIds) => {
  const response = await api.post('/users/me/movie-genres', genreIds)
  return response.data
}

// Endpoint para remover géneros favoritos (Espera un Array de IDs dentro de config.data) - Mary
export const removeFavoriteGenres = async (genreIds) => {
  const response = await api.delete('/users/me/movie-genres', { data: genreIds })
  return response.data
}