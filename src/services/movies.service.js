import api from '../api/axios'
import { apiPublic } from '../api/axios'


export const getMovies = async () => {
  const response = await api.get('/movies')
  return response.data?.data || []
}

// Endpoint para obtener las películas en cartelera (estreno) - Mary
export const getMoviesNowPlaying = async (genre) => {
  const response = await apiPublic.get('/movies/now-playing', {
    params: { genre },
  })
  return response.data?.data || []
}

export const getMovieById = async (id) => {
  const response = await api.get(`/movies/${id}`)
  return response.data?.data || []
}

export const getMoviesReleases = async () => {
  const response = await apiPublic.get('/movies/showtimes')
  return response.data?.data || []
}


export const getUpcomingMovies = async () => {
  const response = await apiPublic.get('/movies/upcoming')
  return response.data?.data || []
}
