import { Route, Routes, useLocation, Outlet } from 'react-router-dom';
import Header from '../components/ui/Header'; 
import Home from '../pages/public/Home';
import Login from '../pages/authentication/login';
import Register from '../pages/authentication/register';
import Profile from '../pages/private/user/profile';
import ForgotPassword from '../pages/authentication/forgotPassword';

// 1. Un pequeño Layout que solo tiene el Header y el contenido (Outlet)
const PublicLayout = () => {
  return (
    <>
      <Header isLoggedIn={false} userName="Yessea"/>
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
      <Route path="/profile" element={<Profile />} />
    </Route>

    {/* Rutas sin Header */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
  </>
)