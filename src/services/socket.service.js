import { io } from 'socket.io-client'

// Mantener la instancia del socket en una variable mutable accesible por todo el servicio
let socket = null
let lastJoinedShowtimeId = null
let pendingEmits = []
const recentEmitTimestamps = new Map()
const listenerWrappers = new Map()
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
    if (pendingEmits.length > 0) {
      const queued = pendingEmits.slice()
      pendingEmits = []
      queued.forEach(({ event, payload }) => {
        if (socket && socket.connected) {
          logSocket('SEND', event, payload)
          socket.emit(event, payload)
        }
      })
    }
  })

  socket.on('connect_error', (err) => {
    logSocket('ERROR', 'connect_error', err?.message)
  })

  socket.on('disconnect', (reason) => {
    logSocket('DISCONNECT', 'disconnect', reason)

    pendingEmits = []
    recentEmitTimestamps.clear()

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
  pendingEmits = []
  recentEmitTimestamps.clear()
  listenerWrappers.clear()
}

const shouldSendEmit = (event, payload) => {
  const key = `${event}:${JSON.stringify(payload)}`
  const now = Date.now()
  const lastSent = recentEmitTimestamps.get(key) || 0
  const duplicateWindow = 250
  if (now - lastSent < duplicateWindow) {
    return false
  }
  recentEmitTimestamps.set(key, now)
  return true
}

const sendOrQueueEmit = (event, payload) => {
  const now = Date.now()
  const emitter = () => {
    if (!socket) return
    logSocket('SEND', event, payload)
    socket.emit(event, payload)
  }
  if (!shouldSendEmit(event, payload)) {
    return
  }
  if (!socket || !socket.connected) {
    pendingEmits.push({ event, payload, when: now })
    return
  }
  emitter()
}

// ===============================
// 3. Unirse a una función (sala)
// ===============================
const joinShowtime = (showtimeId) => {
  const numericShowtimeId = Number(showtimeId)

  if (lastJoinedShowtimeId === numericShowtimeId) {
    return
  }

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

  if (socket && socket.connected) {
    emitJoin()
  } else if (socket) {
    socket.once('connect', emitJoin)
  }

  lastJoinedShowtimeId = numericShowtimeId
}

// ===============================
// 4. Salir de la función (sala)
// ===============================
const leaveShowtime = (showtimeId) => {
  if (!socket) return
  sendOrQueueEmit('leave_showtime', { showtimeId: Number(showtimeId) })
  lastJoinedShowtimeId = null
}

// ===============================
// 5. Listeners de Eventos
// ===============================
const on = (event, cb) => {
  if (!socket) {
    connect()
  }
  if (!socket) return

  const wrapper = (payload) => {
    logSocket('RECV', event, payload)
    cb(payload)
  }
  socket.on(event, wrapper)

  const existing = listenerWrappers.get(event) || []
  listenerWrappers.set(event, [...existing, { original: cb, wrapper }])
}

const off = (event, cb) => {
  if (!socket) return
  const wrappers = listenerWrappers.get(event)
  if (!wrappers) {
    socket.off(event, cb)
    return
  }

  if (cb) {
    const match = wrappers.find((entry) => entry.original === cb)
    if (match) {
      socket.off(event, match.wrapper)
      listenerWrappers.set(
        event,
        wrappers.filter((entry) => entry.original !== cb),
      )
    }
  } else {
    wrappers.forEach((entry) => socket.off(event, entry.wrapper))
    listenerWrappers.delete(event)
    socket.off(event)
  }
}

// ===============================
// 6. Emitir eventos generales
// ===============================
const emit = (event, payload) => {
  sendOrQueueEmit(event, payload)
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
