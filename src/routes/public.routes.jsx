import { Route, Routes, useLocation, Outlet } from 'react-router-dom';
import Header from '../components/ui/Header'; 
import Home from '../pages/public/Home';
import Login from '../pages/authentication/login';
import Register from '../pages/authentication/register';
import Profile from '../pages/private/user/profile';
import ForgotPassword from '../pages/authentication/forgotPassword';
import Register2 from '../pages/authentication/register2';
import EmailCheck from '../pages/authentication/emailCheck';
import VerifyAccount from '../pages/authentication/verifyAccount';

import MovieDetails from '../pages/public/MovieDetails'
// TEMPORAL PRIVATE PAGES (public while login is not ready)
import SelectSeats from '../pages/private/buy/SelectSeats';
import Confectionery from '../pages/private/buy/Confectionery';
import Payment from '../pages/private/buy/Payment';
import Success from '../pages/private/buy/succesQR';

const PublicLayout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
};

// 2. Exportas las rutas organizadas
export const publicRoutes = (
  <>
    {/* Grupo de rutas conHeader */}
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
      {/*<Route path="/profile" element={<Profile />} />*/}

      <Route path="/movie/:movieId" element={<MovieDetails />} />

      {/* TEMPORAL: rutas de compra aquí mientras login funcione */}
      <Route path="/buy/:movieId/:showtimeId" element={<SelectSeats />} />
      <Route
        path="/buy/:movieId/:showtimeId/confectionery"
        element={<Confectionery />}
      />
      <Route path="/buy/:movieId/:showtimeId/payment" element={<Payment />} />
      <Route path="/buy/success" element={<Success />} />
    </Route>

    {/* Rutas sin Header */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/register2" element={<Register2 />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/email-check" element={<EmailCheck />} />
    <Route path="/verify-account" element={<VerifyAccount />} />
  </>
)