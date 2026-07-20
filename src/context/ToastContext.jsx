import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { nanoid } from 'nanoid'

export const globalToast = {
  success: () => {},
  error: () => {},
  info: () => {}
}

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = nanoid()
    setToasts((prev) => [...prev, { id, message, type }])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  // Helpers
  const success = useCallback((msg, duration) => addToast(msg, 'success', duration), [addToast])
  const error = useCallback((msg, duration) => addToast(msg, 'error', duration), [addToast])
  const info = useCallback((msg, duration) => addToast(msg, 'info', duration), [addToast])

  useEffect(() => {
    globalToast.success = success
    globalToast.error = error
    globalToast.info = info
  }, [success, error, info])

  const contextValue = useMemo(() => ({
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info
  }), [toasts, addToast, removeToast, success, error, info])

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast debe ser utilizado dentro de un ToastProvider')
  }
  return context
}
