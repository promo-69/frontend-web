// ============================================================
//  localStore.service.js
//  Base de datos temporal en localStorage.
//  Cuando el backend esté listo, reemplaza cada función
//  con su llamada a la API equivalente.
// ============================================================

const KEYS = {
  MOVIES: 'cx_movies',
  SHOWTIMES: 'cx_showtimes',
  SEAT_MAPS: 'cx_seat_maps',
  PRODUCTS: 'cx_concession_products',
  COMBOS: 'cx_concession_combos',
  ORDERS: 'cx_orders',
  PRODUCT_CATEGORIES: 'cx_product_categories',
  CURRENCIES: 'cx_currencies',
}

// ─── SEED DATA ───────────────────────────────────────────────

const SEED_MOVIES = [
  {
    id: 1,
    title: 'Deadpool & Wolverine',
    genre: 'Acción / Comedia',
    duration: 127,
    rating: 'R',
    poster: 'https://image.tmdb.org/t/p/w300/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
    synopsis:
      'Wade Wilson y Wolverine unen fuerzas para salvar el universo Marvel.',
  },
  {
    id: 2,
    title: 'Inside Out 2',
    genre: 'Animación / Familiar',
    duration: 100,
    rating: 'PG',
    poster: 'https://image.tmdb.org/t/p/w300/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg',
    synopsis: 'Riley crece y nuevas emociones llegan para complicar todo.',
  },
  {
    id: 3,
    title: 'Alien: Romulus',
    genre: 'Ciencia Ficción / Terror',
    duration: 119,
    rating: 'R',
    poster: 'https://image.tmdb.org/t/p/w300/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg',
    synopsis:
      'Un grupo de jóvenes colonianos enfrenta la forma de vida más aterradora.',
  },
]

const SEED_SHOWTIMES = [
  // Deadpool
  {
    id: 1,
    movie_id: 1,
    room: 'Sala 1 - 3D IMAX',
    date: '2026-05-12',
    time: '14:00',
    price: 8.5,
    available_seats: 120,
    total_seats: 144,
  },
  {
    id: 2,
    movie_id: 1,
    room: 'Sala 2 - Tradicional',
    date: '2026-05-12',
    time: '17:30',
    price: 6.0,
    available_seats: 55,
    total_seats: 120,
  },
  {
    id: 3,
    movie_id: 1,
    room: 'Sala 1 - 3D IMAX',
    date: '2026-05-12',
    time: '20:00',
    price: 8.5,
    available_seats: 144,
    total_seats: 144,
  },
  // Inside Out
  {
    id: 4,
    movie_id: 2,
    room: 'Sala 3 - Familiar',
    date: '2026-05-12',
    time: '11:00',
    price: 5.5,
    available_seats: 80,
    total_seats: 100,
  },
  {
    id: 5,
    movie_id: 2,
    room: 'Sala 3 - Familiar',
    date: '2026-05-12',
    time: '15:00',
    price: 5.5,
    available_seats: 100,
    total_seats: 100,
  },
  // Alien
  {
    id: 6,
    movie_id: 3,
    room: 'Sala 4 - Premium',
    date: '2026-05-12',
    time: '21:00',
    price: 10.0,
    available_seats: 60,
    total_seats: 60,
  },
]

// Genera grilla de asientos para cada función
function generateSeatMap(showtimeId, rows = 9, cols = 14) {
  const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']
  const seats = []
  // Marcamos ~25% como ya vendidos aleatoriamente (seed fijo por showtimeId)
  for (let r = 0; r < rows; r++) {
    for (let c = 1; c <= cols; c++) {
      const seatId = `${rowLabels[r]}${c}`
      // Pseudo-random pero determinístico para que no cambie en cada render
      const hash = (showtimeId * 31 + r * 17 + c * 7) % 100
      const sold = hash < 20 // ~20% vendidos
      seats.push({
        id: seatId,
        row: rowLabels[r],
        col: c,
        status: sold ? 'sold' : 'available', // "available" | "sold" | "selected"
      })
    }
  }
  return seats
}

const SEED_PRODUCTS = [
  {
    id: 1,
    name: 'Cotufas Pequeñas',
    category: 'Snack',
    price: 3.0,
    emoji: '🍿',
  },
  {
    id: 2,
    name: 'Cotufas Grandes',
    category: 'Snack',
    price: 5.0,
    emoji: '🍿',
  },
  {
    id: 3,
    name: 'Refresco Mediano',
    category: 'Bebida',
    price: 2.5,
    emoji: '🥤',
  },
  {
    id: 4,
    name: 'Refresco Grande',
    category: 'Bebida',
    price: 3.5,
    emoji: '🥤',
  },
  { id: 5, name: 'Agua Mineral', category: 'Bebida', price: 1.5, emoji: '💧' },
  {
    id: 6,
    name: 'Nachos con Queso',
    category: 'Snack',
    price: 4.0,
    emoji: '🧀',
  },
  { id: 7, name: 'Hot Dog', category: 'Comida', price: 4.5, emoji: '🌭' },
  { id: 8, name: 'Chocolate', category: 'Dulce', price: 2.0, emoji: '🍫' },
]

const SEED_COMBOS = [
  {
    id: 101,
    name: 'Combo Amigos',
    description: '2 Cotufas Grandes + 2 Refrescos Grandes',
    price: 15.0,
    emoji: '🎉',
    items: ['Cotufas Grandes x2', 'Refresco Grande x2'],
  },
  {
    id: 102,
    name: 'Combo Solo',
    description: '1 Cotufas Medianas + 1 Refresco Mediano',
    price: 7.0,
    emoji: '🎬',
    items: ['Cotufas Pequeñas x1', 'Refresco Mediano x1'],
  },
  {
    id: 103,
    name: 'Combo Familiar',
    description: '4 Cotufas + 4 Refrescos + 4 Chocolates',
    price: 28.0,
    emoji: '👨‍👩‍👧‍👦',
    items: ['Cotufas Grandes x4', 'Refresco Grande x4', 'Chocolate x4'],
  },
  {
    id: 104,
    name: 'Combo Premium',
    description: 'Cotufas Grandes + Refresco Grande + Nachos',
    price: 12.0,
    emoji: '⭐',
    items: ['Cotufas Grandes x1', 'Refresco Grande x1', 'Nachos con Queso x1'],
  },
]

const SEED_CATEGORIES = [
  { id: 1, name: 'Bebidas', description: 'Refrescos, agua, jugos', status: 1 },
  {
    id: 2,
    name: 'Chocolates y Dulces',
    description: 'Golosinas y chocolates',
    status: 1,
  },
  {
    id: 3,
    name: 'Promociones',
    description: 'Vasos coleccionables, combos especiales',
    status: 1,
  },
  { id: 4, name: 'Snack', description: 'Cotufas, tequeños, nachos', status: 1 },
]

const SEED_CURRENCIES = [
  { id: 1, code: 'USD', symbol: '$', description: 'Dólares' },
  { id: 2, code: 'VES', symbol: 'Bs', description: 'Bolívares' },
]

// ─── INICIALIZACIÓN ───────────────────────────────────────────

export function initLocalStore() {
  if (!localStorage.getItem(KEYS.MOVIES)) {
    localStorage.setItem(KEYS.MOVIES, JSON.stringify(SEED_MOVIES))
  }
  if (!localStorage.getItem(KEYS.SHOWTIMES)) {
    localStorage.setItem(KEYS.SHOWTIMES, JSON.stringify(SEED_SHOWTIMES))
  }
  if (!localStorage.getItem(KEYS.PRODUCTS)) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS))
  }
  if (!localStorage.getItem(KEYS.COMBOS)) {
    localStorage.setItem(KEYS.COMBOS, JSON.stringify(SEED_COMBOS))
  }
  if (!localStorage.getItem(KEYS.ORDERS)) {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify([]))
  }
  if (!localStorage.getItem(KEYS.PRODUCT_CATEGORIES)) {
    localStorage.setItem(
      KEYS.PRODUCT_CATEGORIES,
      JSON.stringify(SEED_CATEGORIES),
    )
  }
  if (!localStorage.getItem(KEYS.CURRENCIES)) {
    localStorage.setItem(KEYS.CURRENCIES, JSON.stringify(SEED_CURRENCIES))
  }
  // Seat maps se generan bajo demanda
}

// ─── PELÍCULAS ───────────────────────────────────────────────

export function getMovies() {
  return JSON.parse(localStorage.getItem(KEYS.MOVIES) || '[]')
}

export function getMovieById(id) {
  return getMovies().find((m) => m.id === id) || null
}

// ─── FUNCIONES (SHOWTIMES) ───────────────────────────────────

export function getShowtimesByMovie(movieId) {
  const all = JSON.parse(localStorage.getItem(KEYS.SHOWTIMES) || '[]')
  return all.filter((s) => s.movie_id === movieId)
}

export function getShowtimeById(id) {
  const all = JSON.parse(localStorage.getItem(KEYS.SHOWTIMES) || '[]')
  return all.find((s) => s.id === id) || null
}

// ─── ASIENTOS ────────────────────────────────────────────────

export function getSeatMap(showtimeId) {
  const stored = JSON.parse(localStorage.getItem(KEYS.SEAT_MAPS) || '{}')
  if (!stored[showtimeId]) {
    stored[showtimeId] = generateSeatMap(showtimeId)
    localStorage.setItem(KEYS.SEAT_MAPS, JSON.stringify(stored))
  }
  return stored[showtimeId]
}

// Marca los asientos como vendidos al confirmar
export function confirmSeats(showtimeId, seatIds) {
  const stored = JSON.parse(localStorage.getItem(KEYS.SEAT_MAPS) || '{}')
  if (stored[showtimeId]) {
    stored[showtimeId] = stored[showtimeId].map((seat) =>
      seatIds.includes(seat.id) ? { ...seat, status: 'sold' } : seat,
    )
    localStorage.setItem(KEYS.SEAT_MAPS, JSON.stringify(stored))
  }
  // También actualiza available_seats en showtimes
  const showtimes = JSON.parse(localStorage.getItem(KEYS.SHOWTIMES) || '[]')
  const updated = showtimes.map((s) =>
    s.id === showtimeId
      ? {
          ...s,
          available_seats: Math.max(0, s.available_seats - seatIds.length),
        }
      : s,
  )
  localStorage.setItem(KEYS.SHOWTIMES, JSON.stringify(updated))
}

// ─── PRODUCTOS Y COMBOS ───────────────────────────────────────

export function getConcessionProducts() {
  return JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]')
}

export function saveConcessionProduct(product) {
  const products = getConcessionProducts()
  if (product.id) {
    const index = products.findIndex((p) => p.id === product.id)
    if (index > -1) products[index] = product
  } else {
    product.id = Date.now()
    products.push(product)
  }
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products))
  return product
}

export function deleteConcessionProduct(id) {
  const products = getConcessionProducts()
  const filtered = products.filter((p) => p.id !== id)
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(filtered))
}

export function getConcessionCombos() {
  return JSON.parse(localStorage.getItem(KEYS.COMBOS) || '[]')
}

// ─── INVENTARIO: CATEGORÍAS Y MONEDAS ────────────────────────

export function getProductCategories() {
  return JSON.parse(localStorage.getItem(KEYS.PRODUCT_CATEGORIES) || '[]')
}

export function saveProductCategory(category) {
  const categories = getProductCategories()
  if (category.id) {
    const index = categories.findIndex((c) => c.id === category.id)
    if (index > -1) categories[index] = category
  } else {
    category.id = Date.now()
    categories.push(category)
  }
  localStorage.setItem(KEYS.PRODUCT_CATEGORIES, JSON.stringify(categories))
  return category
}

export function deleteProductCategory(id) {
  const categories = getProductCategories()
  const filtered = categories.filter((c) => c.id !== id)
  localStorage.setItem(KEYS.PRODUCT_CATEGORIES, JSON.stringify(filtered))
}

export function getCurrencies() {
  return JSON.parse(localStorage.getItem(KEYS.CURRENCIES) || '[]')
}

// ─── ÓRDENES ─────────────────────────────────────────────────

export function saveOrder(order) {
  const orders = JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]')
  const newOrder = {
    ...order,
    id: Date.now(),
    created_at: new Date().toISOString(),
  }
  orders.push(newOrder)
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders))
  return newOrder
}

export function getOrders() {
  return JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]')
}
