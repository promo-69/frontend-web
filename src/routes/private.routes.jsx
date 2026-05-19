import { Route } from 'react-router-dom'
import Favorites from '../pages/authentication/favorites'
import Profile from '../pages/private/user/profile'
import { PrivateRoute } from './PrivateRoute'

// mientras se crean las pages internas: compra boletos, pago. etc...

export const privateRoutes = (
  <>
    <Route
      path="/favorites"
      element={
        <PrivateRoute>
          <Favorites />
        </PrivateRoute>
      }
    />
    <Route
      path="/profile"
      element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      }
    />
  </>
)
