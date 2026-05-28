import { Route } from 'react-router-dom'
import Favorites from '../pages/authentication/favorites'
import Profile from '../pages/private/user/profile'
import { PrivateRoute } from './PrivateRoute'
import SelectSeats from '../pages/private/buy/selectSeats';
//import Confectionery from '../pages/private/buy/Confectionery';
//import Payment from '../pages/private/buy/Payment';
//import Success from '../pages/private/buy/succesQR';

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
    {/* Flujo de compra completo protegido */}
    <Route
      path="/selectSeats/:movieId/:showtimeId"
      element={
        <PrivateRoute>
          <SelectSeats />
        </PrivateRoute>
      }
    />
  </>
)

{
  /* TEMPORAL: rutas de compra aquí mientras los enpoints esten listos*/
}
{
  /*<Route path="/buy/:movieId/:showtimeId" element={<SelectSeats />} />
      <Route
        path="/buy/:movieId/:showtimeId/confectionery"
        element={<Confectionery />}
      />
      <Route path="/buy/:movieId/:showtimeId/payment" element={<Payment />} />
      <Route path="/buy/success" element={<Success />} />*/
}