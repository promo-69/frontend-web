import { Navigate } from "react-router-dom"
import { useContext } from "react"          // ⭐ IMPORTANTE
import { AuthContext } from "../context/AuthContext"

export function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext)

  if (!user) return <Navigate to="/login" replace />

  return children
}
