import { Navigate, useLocation } from "react-router-dom"
import { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { saveAuthRedirect } from "../utils/authNavigation"

export function PrivateRoute({ children }) {
  const { user, initializing } = useContext(AuthContext)
  const location = useLocation()
  const redirectFrom = location.pathname + location.search

  if (initializing) return null

  if (!user) {
    saveAuthRedirect(redirectFrom)
    return (
      <Navigate
        to="/login"
        state={{ from: redirectFrom }}
        replace
      />
    )
  }

  return children
}
