import { Route } from 'react-router-dom'
import Home from '../pages/public/Home'
import Login from '../pages/authentication/login'
import Register from '../pages/authentication/register'

export const publicRoutes = (
  <>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </>
)
