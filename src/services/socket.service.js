import { io } from 'socket.io-client'

// Mantener la instancia del socket en una variable mutable accesible por todo el servicio
let socket = null
let lastJoinedShowtimeId = null
const SOCKET_DEBUG = true

const timestamp = () => new Date().toISOString()
const logSocket = (direction, event, payload) => {
  if (!SOCKET_DEBUG) return
  console.groupCollapsed(`[Socket ${direction}] ${event} @ ${timestamp()}`)
  console.log('event:', event)
  console.log('payload:', payload)
  console.log('socketId:', socket?.id || 'n/a')
  console.log('connected:', socket?.connected)
  console.groupEnd()
}

// ===============================
// 1. Conectar e Inicializar
// ===============================
const connect = () => {
  if (socket) {
    console.log('[Socket] connect() reuse existing socket', {
      connected: socket.connected,
      socketId: socket.id,
    })
    return socket
  }

  console.log(
    '[Socket] connect() creating new socket — document.cookie:',
    typeof document !== 'undefined' ? document.cookie : '[no document]',
  )

  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  const bearerToken = token ? `Bearer ${token}` : null

  socket = io(import.meta.env.VITE_WS_URL, {
    withCredentials: true,
    auth: {
      token,
    },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    extraHeaders: bearerToken ? { Authorization: bearerToken } : undefined,
  })

  socket.on('connect', () => {
    logSocket('CONNECT', 'connect', { connected: socket.connected })
  })

  socket.on('connect_error', (err) => {
    logSocket('ERROR', 'connect_error', err?.message)
  })

  socket.on('disconnect', (reason) => {
    logSocket('DISCONNECT', 'disconnect', reason)

    if (
      reason === 'io server disconnect' ||
      reason === 'io client disconnect'
    ) {
      socket = null
    }
  })

  socket.onAny((event, ...args) => {
    logSocket('RECV', event, args.length === 1 ? args[0] : args)
  })

  return socket
}

// ===============================
// 2. Desconectar
// ===============================
const disconnect = () => {
  if (!socket) return
  console.log('[Socket] Manual disconnect triggered')
  socket.disconnect()
  socket = null
  lastJoinedShowtimeId = null
}

// ===============================
// 3. Unirse a una función (sala)
// ===============================
const joinShowtime = (showtimeId) => {
  const numericShowtimeId = Number(showtimeId)

  if (!socket) {
    console.warn(
      '[Socket] joinShowtime called before socket exists — calling connect()',
    )
    connect()
  }

  const emitJoin = () => {
    console.log('[Socket] join_showtime', { showtimeId: numericShowtimeId })
    logSocket('SEND', 'join_showtime', { showtimeId: numericShowtimeId })
    socket.emit('join_showtime', { showtimeId: numericShowtimeId })
  }

  if (lastJoinedShowtimeId === numericShowtimeId && socket?.connected) {
    return
  }

  if (socket && socket.connected) {
    emitJoin()
  } else {
    socket.once('connect', emitJoin)
  }

  lastJoinedShowtimeId = numericShowtimeId
}

// ===============================
// 4. Salir de la función (sala)
// ===============================
const leaveShowtime = (showtimeId) => {
  if (!socket) return
  logSocket('SEND', 'leave_showtime', { showtimeId: Number(showtimeId) })
  socket.emit('leave_showtime', { showtimeId: Number(showtimeId) })
}

// ===============================
// 5. Listeners de Eventos
// ===============================
const on = (event, cb) => {
  if (!socket) {
    connect()
  }
  if (!socket) return

  socket.on(event, (payload) => {
    logSocket('RECV', event, payload)
    cb(payload)
  })
}

const off = (event, cb) => {
  if (!socket) return
  if (cb) socket.off(event, cb)
  else socket.off(event)
}

// ===============================
// 6. Emitir eventos generales
// ===============================
const emit = (event, payload) => {
  if (!socket) return
  socket.emit(event, payload)
}

// ===============================
// 7. Obtener la instancia actual
// ===============================
const getSocket = () => socket

export default {
  connect,
  disconnect,
  joinShowtime,
  leaveShowtime,
  on,
  off,
  emit,
  getSocket,
}
