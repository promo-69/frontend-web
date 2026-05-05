import { Route } from 'react-router-dom'
import Favorites from '../pages/authentication/favorites'

// mientras se crean las pages internas: compra boletos, pago. etc...

export const privateRoutes = (
  <>
    <Route path="/favorites" element={<Favorites />} />
  </>
)
