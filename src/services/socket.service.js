import { io } from 'socket.io-client'

// Mantener la instancia del socket en una variable mutable accesible por todo el servicio
let socket = null

// ===============================
// 1. Conectar e Inicializar
// ===============================
const connect = () => {
  if (socket) {
    console.log('[Socket] connect() reuse existing socket', {
      connected: socket.connected,
    })
    return socket
  }

  console.log(
    '[Socket] connect() creating new socket — document.cookie:',
    typeof document !== 'undefined' ? document.cookie : '[no document]',
  )

  socket = io(import.meta.env.VITE_WS_URL, {
    withCredentials: true,
    transports: ['websocket'],
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
  console.log('[Socket] Manual disconnect triggered')
  socket.disconnect()
  socket = null
}

// ===============================
// 3. Unirse a una función (sala)
// ===============================
const joinShowtime = (showtimeId) => {
  // Si invocan joinShowtime pero no se ha llamado a connect(), lo forzamos automáticamente
  if (!socket) {
    console.warn(
      '[Socket] joinShowtime called before socket exists — calling connect()',
    )
    connect()
  }

  const emitJoin = () => {
    console.log('[Socket] emit join_showtime', {
      showtimeId,
      connected: socket.connected,
    })
    socket.emit('join_showtime', { showtimeId: Number(showtimeId) })
  }

  // Si ya está conectado el canal físico, emitimos inmediatamente
  if (socket && socket.connected) {
    emitJoin()
  } else if (socket) {
    // Si está en proceso de handshake, removemos cualquier listener viejo de 'connect' para este evento
    // y registramos uno nuevo para evitar que se dupliquen las emisiones al reconectar.
    socket.off('connect', emitJoin)
    console.log('[Socket] Waiting for connection to join showtime…')
    socket.once('connect', emitJoin)
  }
}

// ===============================
// 4. Salir de la función
// ===============================
const leaveShowtime = (showtimeId) => {
  if (!socket) return
  console.log('[Socket] emit leave_showtime', { showtimeId })
  socket.emit('leave_time', { showtimeId: Number(showtimeId) })
}

// ===============================
// 5. Listeners de Eventos
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
