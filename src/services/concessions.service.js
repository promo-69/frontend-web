import api from '../api/axios'
import { seedProducts } from './productCache'

// 🍿 Obtener productos por sucursal
export const getConcessionProducts = async (cinemaId) => {
  const res = await api.get(`/concessions/products/available`, {
    params: { cinemaId },
  })
  const products = res.data?.data || res.data || []
  // Seed global cache so other views (e.g. MyOrders) can reuse names
  try {
    seedProducts(cinemaId, products)
  } catch (e) {
    console.error('Error seeding product cache:', e)
  }
  return products
}

// 🥤 Obtener combos por sucursal
export const getConcessionCombos = async (cinemaId) => {
  const res = await api.get(`/concessions/combos/available`, {
    params: { cinemaId },
  })
  return res.data?.data || res.data || []
}
