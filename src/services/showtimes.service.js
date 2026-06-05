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
  const response = await apiPublic.get(`/showtimes/${showtimeId}`)
  return response.data.data
}