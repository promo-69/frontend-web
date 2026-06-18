import { io } from 'socket.io-client'

let socket = null

const connect = () => {
  if (socket) {
    console.log('[Socket] connect() reuse existing socket', { connected: socket.connected })
    return socket
  }

  console.log('[Socket] connect() creating new socket — document.cookie:', typeof document !== 'undefined' ? document.cookie : '[no document]')

  socket = io(import.meta.env.VITE_WS_URL, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  })

  socket.on('connect', () => {
    try {
      console.log('[Socket] Connected')
    } catch (e) {}
  })

  socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect' || reason === 'io client disconnect') {
      socket = null
    }
  })

  socket.on('connect_error', (err) => {
    try {
      console.warn('[Socket] Connection error:', err?.message)
    } catch (e) {}
  })

  return socket
}

const disconnect = () => {
  if (!socket) return
  socket.disconnect()
  socket = null
}

const joinShowtime = (showtimeId) => {
  const doEmit = () => {
    if (!socket) {
      console.warn('[Socket] joinShowtime: socket missing at emit time', { showtimeId })
      return
    }
    console.log('[Socket] emit join_showtime', { showtimeId, connected: socket.connected })
    socket.emit('join_showtime', { showtimeId: Number(showtimeId) })
  }

  if (!socket) {
    console.warn('[Socket] joinShowtime called before socket exists — calling connect()', { showtimeId })
    connect()
  }

  if (socket && socket.connected) {
    doEmit()
  } else if (socket) {
    socket.once('connect', doEmit)
  }
}

const leaveShowtime = (showtimeId) => {
  if (!socket) return
  socket.emit('leave_showtime', { showtimeId: Number(showtimeId) })
}

const on = (event, cb) => {
  if (!socket) return
  socket.on(event, cb)
}

const off = (event, cb) => {
  if (!socket) return
  if (cb) socket.off(event, cb)
  else socket.off(event)
}

const emit = (event, payload) => {
  if (!socket) return
  socket.emit(event, payload)
}

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
