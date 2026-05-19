import { createContext, useContext, useState } from 'react'

const LoadingContext = createContext()

export function LoadingProvider({ children }) {
  const [loadingCount, setLoadingCount] = useState(0)

  const showLoader = () => setLoadingCount((count) => count + 1)
  const hideLoader = () => setLoadingCount((count) => Math.max(count - 1, 0))
  const loading = loadingCount > 0

  return (
    <LoadingContext.Provider value={{ loading, showLoader, hideLoader }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  return useContext(LoadingContext)
}
