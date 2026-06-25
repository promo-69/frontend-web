import { Route, Navigate, Outlet } from 'react-router-dom'
import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import Header from '../components/ui/Header'
import Favorites from '../pages/authentication/favorites'
import Profile from '../pages/private/user/profile'
import Loyalty from '../pages/private/user/loyalty'
import MyOrders from '../pages/private/user/myOrders'
import OrderTicket from '../pages/private/user/orderTicket'
import SelectSeats from '../pages/private/buy/selectSeats'
import Confectionery from '../pages/private/buy/confectionery'
import Checkout from '../pages/private/buy/checkout'
import UnifiedPurchase from '../pages/private/buy/UnifiedPurchase'
import OrderSuccess from '../pages/private/buy/orderSuccess'
import Subscriptions from '../pages/private/user/subscriptions'
import MoviesGenres from '../pages/private/user/myGenres'
import RoomRent from '../pages/private/user/roomRent'

const PrivateLayout = () => {
  const { user, initializing } = useContext(AuthContext)
  if (initializing) {
    return (
      <div className="flex flex-col min-h-screen bg-[#231640] text-white items-center justify-center font-['Montserrat']">
        <p className="text-sm font-bold tracking-widest uppercase animate-pulse text-gray-300">
          Verificando sesión...
        </p>
      </div>
    )
  }
  
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
      <Route path="/myGenres" element={<MoviesGenres />} />
      <Route path="/my-orders" element={<MyOrders />} />
      <Route path="/my-orders/:orderId/ticket" element={<OrderTicket />} />
      <Route path="/room-rent" element={<RoomRent />} />
      
      
      <Route path="/favorites" element={<Favorites />} />

      
      


      {/* Flujo de compra unificado (sin navegación entre pasos) */}
      <Route
        path="/buy/:movieId/:showtimeId"
        element={<UnifiedPurchase />}
      />

      {/* Flujo de compra legacy (páginas separadas) */}
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
