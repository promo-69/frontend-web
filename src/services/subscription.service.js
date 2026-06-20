import api from '../api/axios'


// Ejemplo de export .get
export const getShowtimeById = async (cinemaId, showtimeId) => {
  const res = await api.get(
    `/cinemas/${cinemaId}/showtimes/${showtimeId}`,
  )
  return res.data.data
}