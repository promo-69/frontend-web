import api, { apiPublic } from '../api/axios'

// ⭐ 1) Funciones de una película en una sucursal
export const getShowtimesByMovieAndCinema = async (cinemaId, movieId) => {
  const res = await apiPublic.get(
    `/cinemas/${cinemaId}/showtimes/movies/${movieId}`,
  )
  return res.data.data
}

// ⭐ 2) Detalle de función por sucursal
export const getShowtimeById = async (cinemaId, showtimeId) => {
  const res = await apiPublic.get(
    `/cinemas/${cinemaId}/showtimes/${showtimeId}`,
  )
  return res.data.data
}

// ⭐ 3) Mapa de asientos por sucursal
export const getSeatMap = async (cinemaId, showtimeId) => {
  const res = await api.get(
    `/cinemas/${cinemaId}/showtimes/${showtimeId}/seat-map`,
  )
  return res.data.data
}

// ⭐ 4) Funciones disponibles por fecha (opcional)
export const getShowtimesByDate = async (cinemaId, date) => {
  const res = await apiPublic.get(`/cinemas/${cinemaId}/showtimes?date=${date}`)
  return res.data.data
}


























{
  /* 

  import api from '../api/axios'
import { apiPublic } from '../api/axios'

export const getShowtimesByCinema = async (cinemaId) => {
  const res = await api.get(`/cinemas/${cinemaId}/showtimes`)
  return res.data
}

export const getShowtimesByMovie = async (movieId) => {
  const response = await apiPublic.get(`/showtimes?movieId=${movieId}`)
  return response.data.data
}

export const getShowtimeById = async (showtimeId) => {
  const response = await api.get(`/showtimes/${showtimeId}`)
  return response.data.data
}

export const getSeatMap = async (showtimeId) => {
  const response = await api.get(`/showtimes/${showtimeId}/seat-map`)
  return response.data.data
}
*/
}

