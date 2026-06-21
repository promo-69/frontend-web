import { createContext, useContext, useState, useCallback, useMemo } from 'react'

const LoadingContext = createContext(null)

export function LoadingProvider({ children }) {
  const [loadingCount, setLoadingCount] = useState(0)

  const showLoader = useCallback(() => {
    setLoadingCount((count) => count + 1)
  }, [])

  const hideLoader = useCallback(() => {
    setLoadingCount((count) => Math.max(count - 1, 0))
  }, [])

  const loading = loadingCount > 0

  const contextValue = useMemo(() => ({
    loading,
    showLoader,
    hideLoader
  }), [loading, showLoader, hideLoader])

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading debe ser utilizado dentro de un LoadingProvider')
  }
  return context
}