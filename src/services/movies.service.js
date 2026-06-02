import api from '../api/axios'

export const getMovies = async () => {
  const response = await api.get('/movies')
  return response.data.data 
}

export const getMovieById = async (id) => {
  const response = await api.get(`/movies/${id}`)
  return response.data.data
}

export const getMoviesReleases = async () => {
  const response = await api.get('movies/showtimes')
  return response.data.data
}

export const getUpcomingMovies = async () => {
  const response = await api.get('movies/upcoming')
  return response.data.data
}