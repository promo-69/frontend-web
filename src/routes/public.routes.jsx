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
import MoviesReleases from '../pages/public/MoviesReleases';
import MoviesUpcoming from '../pages/public/MoviesUpComing';
import MovieDetails from '../pages/public/MovieDetails';
import EventDetails from '../pages/public/EventsDetails';
import CinemaDetails from '../pages/public/CinemaMoviesDetails';
import Confectionery from '../pages/private/buy/confectionery';
import Checkout from '../pages/private/buy/checkout';


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

export const publicRoutes = (
  <>
    {/* Grupo de rutas con Header */}
    <Route element={<PublicLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/movies/:movieSlug" element={<MovieDetails />} />
      <Route path="/events/:eventSlug" element={<EventDetails />} />
      <Route path="/business" element={<Empresa />} />
      <Route path="/cinemas" element={<CinemasInfo />} />
      <Route path="/cinemas/:cinemaSlug" element={<CinemaDetails />} />
      <Route path="/billboard" element={<MoviesReleases />} />
      <Route path="/upcoming" element={<MoviesUpcoming />} />
      <Route path="/confectionery" element={<Confectionery />} />
      <Route path="/checkout" element={<Checkout />} />
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