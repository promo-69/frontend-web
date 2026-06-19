import { fetchProductsByCinema } from './products.service'

// Simple in-memory cache: Map<cinemaId, Map<productId, productObj>>
const cache = new Map()

const ensureCinemaCache = async (cinemaId) => {
  if (!cinemaId) return new Map()
  if (cache.has(cinemaId)) return cache.get(cinemaId)

  try {
    const products = await fetchProductsByCinema(cinemaId)
    const map = new Map()
    if (Array.isArray(products)) {
      products.forEach((p) => {
        if (p && (p.id ?? p.productId) != null) {
          const id = p.id ?? p.productId
          map.set(id, p)
        }
      })
    }
    cache.set(cinemaId, map)
    return map
  } catch (e) {
    console.error('productCache.ensureCinemaCache error:', e)
    const empty = new Map()
    cache.set(cinemaId, empty)
    return empty
  }
}

export const getProductName = (cinemaId, productId) => {
  const cinemaMap = cache.get(cinemaId)
  const prod = cinemaMap?.get(productId)
  return prod?.name || prod?.title || prod?.displayName || null
}

export const prefetchForOrders = async (orders = []) => {
  // Collect unique cinemaIds
  const cinemaIds = new Set()
  orders.forEach((o) => {
    if (o?._Cinemas?.id) cinemaIds.add(o._Cinemas.id)
  })

  const tasks = Array.from(cinemaIds).map((id) => ensureCinemaCache(id))
  await Promise.all(tasks)
}

// Fetch products once per cinema from concessions and attach productName to order lines.
export const fetchAndAttachProductNames = async (orders = []) => {
  if (!Array.isArray(orders) || orders.length === 0) return orders

  // Group orders by cinemaId
  const byCinema = new Map()
  orders.forEach((o) => {
    const cid = o?._Cinemas?.id || null
    if (!byCinema.has(cid)) byCinema.set(cid, [])
    byCinema.get(cid).push(o)
  })

  // For each cinema (including null), fetch products once and build map
  const fetchTasks = Array.from(byCinema.keys()).map(async (cinemaId) => {
    try {
      const products = await ensureCinemaCache(cinemaId)
      return { cinemaId, products }
    } catch (e) {
      console.error('fetchAndAttachProductNames fetch error for cinema', cinemaId, e)
      return { cinemaId, products: new Map() }
    }
  })

  const results = await Promise.all(fetchTasks)
  const productsByCinema = new Map(results.map((r) => [r.cinemaId, r.products]))

  // Attach productName to lines using cache
  const mapped = orders.map((o) => {
    const cinemaId = o?._Cinemas?.id || null
    const prodMap = productsByCinema.get(cinemaId) || new Map()
    const lines = Array.isArray(o._OrderLines)
      ? o._OrderLines.map((l) => {
          const prod = prodMap.get(l.product)
          return {
            ...l,
            productName: prod?.name || prod?.title || prod?.displayName || null,
          }
        })
      : []

    return {
      ...o,
      _OrderLines: lines,
    }
  })

  return mapped
}

export const clearProductCache = () => cache.clear()

export default {
  getProductName,
  prefetchForOrders,
  clearProductCache,
}

// Seed cache with known products for a cinema (useful if another service already fetched them)
export const seedProducts = (cinemaId, products = []) => {
  if (!cinemaId) return
  const map = new Map()
  if (Array.isArray(products)) {
    products.forEach((p) => {
      if (p && (p.id ?? p.productId) != null) {
        const id = p.id ?? p.productId
        map.set(id, p)
      }
    })
  }
  cache.set(cinemaId, map)
}
