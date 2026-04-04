import { Route, Routes, useLocation, Outlet } from 'react-router-dom';
import Header from '../components/ui/Header'; 
import Home from '../pages/public/Home';
import Login from '../pages/authentication/login';
import Register from '../pages/authentication/register';

// 1. Un pequeño Layout que solo tiene el Header y el contenido (Outlet)
const PublicLayout = () => {
  return (
    <>
      <Header isLoggedIn={false} />
      <main>
        <Outlet /> {/* Aquí se renderizará el Home o cualquier ruta hija */}
      </main>
    </>
  );
};

// 2. Exportas las rutas organizadas
export const publicRoutes = (
  <>
    {/* Grupo de rutas CON Header */}
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
    </Route>

    {/* Rutas SIN Header */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </>
);