import { io } from 'socket.io-client'

let socket = null

const connect = (token) => {
  if (socket) return socket

  socket = io(import.meta.env.VITE_WS_URL, {
    transports: ['websocket'],
    auth: {
      token,
    },
  })

  return socket
}

const disconnect = () => {
  if (!socket) return
  socket.disconnect()
  socket = null
}

const joinShowtime = (showtimeId) => {
  if (!socket) return
  socket.emit('join_showtime', { showtimeId: Number(showtimeId) })
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
