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
import Empresa from '../pages/public/AboutUs';
import CinemasInfo from '../pages/public/InfoCinemas';

import MovieDetails from '../pages/public/MovieDetails';


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
      <Route path="/movie/:movieId" element={<MovieDetails />} />
      <Route path="/empresa" element={<Empresa />} />
      <Route path="/sucursales" element={<CinemasInfo />} />

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