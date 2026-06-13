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
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/fidelity" element={<Loyalty />} />
      <Route path="/my-orders" element={<MyOrders />} />
      <Route path="/my-orders/:orderId/ticket" element={<OrderTicket />} />

      {/* Flujo de compra completo protegido */}
      <Route
        path="/selectSeats/:movieId/:showtimeId"
        element={<SelectSeats />}
      />
      <Route
        path="/buy/:movieId/:showtimeId/confectionery"
        element={<Confectionery />}
      />
      
    </Route>
  </>
)
