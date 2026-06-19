import api from '../api/axios'

// Toda la lista de Sucursales - Mary
export const getCinemas = async () => {
  const response = await api.get('/cinemas')
  return response.data.data 
}

// De un evento, obtengo las sucursales y funciones disponibles - Mary
export const getMoviesShowtimebyDateCinema = async (cinemaId, date) => {
  const response = await api.get(`/showtimes/billboard/full`, {
  params: { 
    cinemaId,
    date
   }
  })
  return response.data.data 
}

