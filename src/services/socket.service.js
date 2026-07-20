import { io } from 'socket.io-client'
import { globalToast } from '../context/ToastContext'

// Mantener la instancia del socket en una variable mutable accesible por todo el servicio
let socket = null
let lastJoinedShowtimeId = null
let pendingEmits = []
const recentEmitTimestamps = new Map()
// listenerWrappers: event -> { socketHandler: Function, originals: Set<Function> }
const listenerWrappers = new Map()
const SOCKET_DEBUG = true

const timestamp = () => new Date().toISOString()
const logSocket = (direction, event, payload) => {
  if (!SOCKET_DEBUG) return
  console.groupCollapsed(`[Socket ${direction}] ${event} @ ${timestamp()}`)

  console.groupEnd()
}

// ===============================
// 1. Conectar e Inicializar
// ===============================
const connect = () => {
  if (socket) {

    return socket
  }



  socket = io(import.meta.env.VITE_WS_URL, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
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

  // Global Toast Events
  socket.on('quote_expired', (data) => {
    globalToast.error(data?.message || 'Tu sesión de compra ha expirado.')
  })
  
  socket.on('seat_lock_error', (data) => {
    globalToast.error(data?.message || 'Error al reservar el asiento.')
  })
  
  socket.on('seat_locked_by_other', (data) => {
    globalToast.error(data?.message || 'Ese asiento fue tomado por otra persona.')
  })

  socket.on('payment_success', (data) => {
    globalToast.success(data?.message || 'Pago parcial recibido. Saldo restante actualizado.', 6000)
  })

  socket.on('payment_failed', (data) => {
    globalToast.error(data?.message || 'No se pudo procesar tu pago.')
  })

  socket.on('payment_completed', (data) => {
    globalToast.success('¡Pago completado exitosamente! Preparando tu orden...')
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
  lastJoinedShowtimeId = null
  pendingEmits = []
  recentEmitTimestamps.clear()
  // remove socket-level handlers managed by service
  listenerWrappers.forEach((entry, event) => {
    try {
      if (socket && entry && entry.socketHandler) socket.off(event, entry.socketHandler)
    } catch (e) {
      // ignore
    }
  })
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
const joinShowtime = (showtimeId, force = false) => {
  const numericShowtimeId = Number(showtimeId)

  if (!force && lastJoinedShowtimeId === numericShowtimeId) {
    return
  }

  if (!socket) {
    console.warn(
      '[Socket] joinShowtime called before socket exists — calling connect()',
    )
    connect()
  }

  const emitJoin = () => {

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
  if (typeof cb !== 'function') return

  if (!socket) {
    connect()
  }
  if (!socket) return

  const entry = listenerWrappers.get(event)
  if (entry) {
    // agregar al set de callbacks locales
    entry.originals.add(cb)
    return
  }

  // crear un solo handler a nivel de socket que despache a todos los callbacks locales
  const originals = new Set([cb])
  const socketHandler = (payload) => {
    logSocket('RECV', event, payload)
    // iterar sobre una copia para evitar mutaciones durante iteración
    Array.from(originals).forEach((fn) => {
      try {
        fn(payload)
      } catch (e) {
        console.error('[Socket] listener error for', event, e)
      }
    })
  }

  socket.on(event, socketHandler)
  listenerWrappers.set(event, { socketHandler, originals })
}

const off = (event, cb) => {
  if (!socket) return
  const entry = listenerWrappers.get(event)
  if (!entry) {
    // no tenemos wrapper gestionado por el servicio; delegar al socket
    if (cb) socket.off(event, cb)
    else socket.off(event)
    return
  }

  if (cb) {
    entry.originals.delete(cb)
    // si no quedan callbacks locales, eliminar el handler a nivel socket
    if (entry.originals.size === 0) {
      socket.off(event, entry.socketHandler)
      listenerWrappers.delete(event)
    }
  } else {
    // remover todo
    socket.off(event, entry.socketHandler)
    listenerWrappers.delete(event)
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
