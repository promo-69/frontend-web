import api from '../api/axios'

export const getConcessionProducts = async () => {
  const res = await api.get('/concessions/products')
  return res.data.data 
}

export const getConcessionCombos = async () => {
  const res = await api.get('/concessions/combos')
  return res.data.data
}
