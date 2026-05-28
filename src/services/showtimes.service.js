import api from '../api/axios'

export const getShowtimesByCinema = async (cinemaId) => {
  const res = await api.get(`/cinemas/${cinemaId}/showtimes`)
  return res.data
}
