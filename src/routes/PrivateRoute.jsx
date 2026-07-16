import { Navigate, useLocation } from "react-router-dom"
import { useContext } from "react"          // ⭐ IMPORTANTE
import { AuthContext } from "../context/AuthContext"

export function PrivateRoute({ children }) {
  const { user, initializing } = useContext(AuthContext)
  const location = useLocation()

  if (initializing) return null

  if (!user)
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    )

  return children
}
