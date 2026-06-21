import { Route, Navigate, Outlet } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext' // Ajusta la ruta a tu contexto
import Header from '../components/ui/Header'
import Favorites from '../pages/authentication/favorites'
import Profile from '../pages/private/user/profile'
import Loyalty from '../pages/private/user/loyalty'
import MyOrders from '../pages/private/user/myOrders'
import OrderTicket from '../pages/private/user/orderTicket'
import SelectSeats from '../pages/private/buy/selectSeats'
import Confectionery from '../pages/private/buy/confectionery'
import Checkout from '../pages/private/buy/checkout'
import OrderSuccess from '../pages/private/buy/orderSuccess'
import Subscriptions from '../pages/private/user/subscriptions'

const PrivateLayout = () => {
  const { user } = useContext(AuthContext)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  )
}

// rutas organizadas usando Layout
export const privateRoutes = (
  <>
    <Route element={<PrivateLayout />}>
      {/* Rutas del header privadas */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/fidelity" element={<Loyalty />} />
      <Route path="/subscription" element={<Subscriptions />} />
      <Route path="/my-orders" element={<MyOrders />} />
      <Route path="/my-orders/:orderId/ticket" element={<OrderTicket />} />
  {/* <Route path="/loyalty-prices" element={<LoyaltyList />} /> */}
  {/* <Route path="/room-rent" element={<RoomRent />} /> */}
      
      
      <Route path="/favorites" element={<Favorites />} />

      
      


      {/* Flujo de compra completo protegido */}
      <Route
        path="/selectSeats/:movieId/:showtimeId"
        element={<SelectSeats />}
      />
      <Route
        path="/buy/:movieId/:showtimeId/confectionery"
        element={<Confectionery />}
      />
      <Route
        path="/buy/:movieId/:showtimeId/checkout"
        element={<Checkout />}
      />
      <Route path="/order-success" element={<OrderSuccess />} />
      
    </Route>
  </>
)
