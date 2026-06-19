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




// https://backend-jog6.onrender.com/api/v1/test/showtimes/billboard/full
export const getMoviesReleasessssdwe = async () => {
  const response = await apiPublic.get('/movies/showtimes')
  return response.data?.data || []
}

export const getUpcomingMovies = async () => {
  const response = await apiPublic.get('/movies/upcoming')
  return response.data?.data || []
}

export const getMoviesReleases = async () => {
  const response = await api.get('/movies')
  return response.data?.data || []
}