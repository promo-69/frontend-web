import api from '../api/axios'

// 🍿 Obtener productos por sucursal
export const getConcessionProducts = async (cinemaId) => {
  const res = await api.get(`/concessions/products/available`, {
    params: { cinemaId },
  })
  return res.data?.data || res.data || []
}

// 🥤 Obtener combos por sucursal
export const getConcessionCombos = async (cinemaId) => {
  const res = await api.get(`/concessions/combos/available`, {
    params: { cinemaId },
  })
  return res.data?.data || res.data || []
}
