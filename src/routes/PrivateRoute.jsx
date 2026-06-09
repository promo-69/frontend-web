import { Navigate } from "react-router-dom"
import { useContext } from "react"          // ⭐ IMPORTANTE
import { AuthContext } from "../context/AuthContext"

export function PrivateRoute({ children }) {
  const { user, initializing } = useContext(AuthContext)

  if (initializing) return null

  if (!user) return <Navigate to="/login" replace />

  return children
}
