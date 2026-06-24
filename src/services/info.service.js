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

// Catalogo de lenguajes - Mary
export const getLanguages = async () => {
  const response = await api.get(`/catalogs/languages`)
  return response.data.data 
}

// Catalogo de Tipo de Proyecciones - Mary
export const getProjectionTypes = async () => {
  const response = await api.get(`/catalogs/projection-types`)
  return response.data.data 
}

// Obtener las salas por sucursal - Mary
export const getRoomsByCinema = async (cinemaId) => {
  const response = await api.get(`/cinemas/${cinemaId}/rooms`);
  return response.data.data || response.data || [];
};

// Solicitud de alquiler de salas - Mary
export const createRequestRentRoom = async (payload) => {
  const response = await api.post('/rentals/requests', payload, {
    withCredentials: true,
  });
  return response.data;
};
