// socket.service.js
import { io } from 'socket.io-client'

let socket = null

// ===============================
// 1. Conectar con JWT (Handshake)
// ===============================
const connect = (token) => {
  if (socket) {
    console.log('[Socket] Reusing existing socket', {
      connected: socket.connected,
    })
    return socket
  }

  console.log('[Socket] Creating new socket connection with JWT')

  socket = io(import.meta.env.VITE_WS_URL, {
    transports: ['websocket'],
    auth: {
      token: token, // 🔥 JWT enviado en handshake (requerido por la guía)
    },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  })

  socket.on('connect', () => {
    console.log('[Socket] Connected with ID:', socket.id)
  })

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err?.message)
  })

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason)
    if (
      reason === 'io server disconnect' ||
      reason === 'io client disconnect'
    ) {
      socket = null
    }
  })

  return socket
}

// ===============================
// 2. Desconectar
// ===============================
const disconnect = () => {
  if (!socket) return
  socket.disconnect()
  socket = null
}

// ===============================
// 3. Unirse a una función (sala)
// ===============================
const joinShowtime = (showtimeId) => {
  if (!socket) {
    console.warn('[Socket] joinShowtime called before socket exists')
    return
  }

  const emitJoin = () => {
    console.log('[Socket] emit join_showtime', {
      showtimeId,
      connected: socket.connected,
    })
    socket.emit('join_showtime', { showtimeId: Number(showtimeId) })
  }

  if (socket.connected) {
    emitJoin()
  } else {
    console.log('[Socket] Waiting for connection to join showtime…')
    socket.once('connect', emitJoin)
  }
}

// ===============================
// 4. Salir de la función
// ===============================
const leaveShowtime = (showtimeId) => {
  if (!socket) return
  socket.emit('leave_showtime', { showtimeId: Number(showtimeId) })
}

// ===============================
// 5. Listeners
// ===============================
const on = (event, cb) => {
  if (!socket) return
  socket.on(event, cb)
}

const off = (event, cb) => {
  if (!socket) return
  if (cb) socket.off(event, cb)
  else socket.off(event)
}

// ===============================
// 6. Emitir eventos
// ===============================
const emit = (event, payload) => {
  if (!socket) return
  socket.emit(event, payload)
}

// ===============================
// 7. Obtener instancia
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
