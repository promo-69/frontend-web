import React, { useState } from 'react'
import { FiChevronDown, FiLogOut } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Assets e Iconos
import logoCineflix from '../../assets/images/logotype/logoCineflix.png'
import { LoginIcon, ProfileIcon } from '../ui/IconosProyect'

const NAV_LINKS = [
  { name: 'Confitería', path: '/confectionery' },
  { name: 'Sucursales', path: '/cinemas' },
  { name: 'Empresa', path: '/business' },
]

function Header() {
  const navigate = useNavigate()
  const { user, logout, initializing } = useAuth()

  // MENÚS DESPLEGABLES
  const [isCarteleraOpen, setIsCarteleraOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const isLoggedIn = !!user
  const displayName = user?.firstName || user?.name || user?.email?.split('@')[0]

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Dropdown para Cartelera
  const CarteleraDropdown = () => (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="absolute top-full mt-2 left-0 w-44 bg-[#7B1A82] rounded-2xl overflow-hidden shadow-2xl z-[70] border border-white/10"
    >
      <Link
        to="/billboard"
        onClick={() => setIsCarteleraOpen(false)}
        className="block px-4 py-3 text-sm text-white hover:bg-[#231640]/40 transition-colors border-b border-white/5 font-bold uppercase tracking-tighter"
      >
        CARTELERA
      </Link>
      <Link
        to="/upcoming"
        onClick={() => setIsCarteleraOpen(false)}
        className="block px-4 py-3 text-sm text-white hover:bg-[#231640]/40 transition-colors font-bold uppercase tracking-tighter"
      >
        Estrenos
      </Link>
      <Link
        to="/events"
        onClick={() => setIsCarteleraOpen(false)}
        className="block px-4 py-3 text-sm text-white hover:bg-[#231640]/40 transition-colors border-b border-white/5 font-bold uppercase tracking-tighter"
      >
        EVENTOS
      </Link>
    </motion.div>
  )

  // Dropdown de Usuario
  const UserMenuDropdown = () => (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="absolute top-full mt-2 right-0 w-52 bg-[#2A154B] rounded-2xl overflow-hidden shadow-2xl z-[70] border border-white/10"
    >
      <div className="px-4 py-3 border-b border-[#F6AD38]/50 mb-1">
        <p className="font-bold uppercase text-[10px] text-[#F6AD38]/80 leading-none">Menú</p>
      </div>

      <Link
        to="/profile"
        onClick={() => setIsUserMenuOpen(false)}
        className="block px-4 py-3 text-sm text-white hover:bg-[#7B1A82]/50 transition-colors border-b border-[#F6AD38]/30 font-bold tracking-tight"
      >
        Perfil y Seguridad
      </Link>
      <Link
        to="/fidelity"
        onClick={() => setIsUserMenuOpen(false)}
        className="block px-4 py-3 text-sm text-white hover:bg-[#7B1A82]/50 transition-colors border-b border-[#F6AD38]/30 font-bold tracking-tight"
      >
        Fidelidad
      </Link>
      <Link
        to="/subscription"
        onClick={() => setIsUserMenuOpen(false)}
        className="block px-4 py-3 text-sm text-white hover:bg-[#7B1A82]/50 transition-colors border-b border-[#F6AD38]/30 font-bold tracking-tight"
      >
        Subscripciones de Peliculas
      </Link>
      <Link
        to="/myGenres"
        onClick={() => setIsUserMenuOpen(false)}
        className="block px-4 py-3 text-sm text-white hover:bg-[#7B1A82]/50 transition-colors border-b border-[#F6AD38]/30 font-bold tracking-tight"
      >
        Peliculas favoritas
      </Link>
      <Link
        to="/my-orders"
        onClick={() => setIsUserMenuOpen(false)}
        className="block px-4 py-3 text-sm text-white hover:bg-[#7B1A82]/50 transition-colors border-b border-[#F6AD38]/30 font-bold tracking-tight"
      >
        Historial de Compra
      </Link>
      <Link
        to="/room-rent"
        onClick={() => setIsUserMenuOpen(false)}
        className="block px-4 py-3 text-sm text-white hover:bg-[#7B1A82]/50 transition-colors font-bold tracking-tight"
      >
        Alquiler de Salas
      </Link>
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm text-[#8F2925] hover:bg-red-500/10 transition-colors mt-2 border-t border-[#F6AD38]/50 font-bold tracking-tight"
      >
        <span>Cerrar Sesión</span> <FiLogOut />
      </button>
    </motion.div>
  )

  return (
    <header className="sticky top-0 bg-[#2A154B] text-white z-[100] shadow-lg font-['Montserrat'] border-b-2 border-[#7B1A82]">
      {/* OVERLAY */}
      <AnimatePresence>
        {(isCarteleraOpen || isUserMenuOpen) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsCarteleraOpen(false)
              setIsUserMenuOpen(false)
              setIsCartOpen(false)
            }}
            className="fixed inset-0 bg-black/20 z-[55] backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      <div className="relative z-[60] flex flex-wrap md:flex-nowrap items-center justify-between px-4 max-w-7xl mx-auto py-2 md:py-0 md:h-16 gap-y-2">
        {/* LOGO */}
        <div
          className="flex shrink-0 items-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/')}
        >
          <img
            src={logoCineflix}
            alt="Cineflix Logo"
            className="h-12 sm:h-16 md:h-16 lg:h-20 w-auto object-contain"
          />
        </div>

        {/* NAV */}
        <nav className="order-3 md:order-2 w-full md:w-auto">
          <ul className="flex flex-wrap justify-center items-center gap-x-3 sm:gap-x-5 md:gap-x-6 lg:gap-x-8 text-[9px] sm:text-[11px] lg:text-sm font-bold uppercase tracking-wider">
            {/* CARTELERA DROPDOWN */}
            <li className="relative">
              <button
                onClick={() => {
                  setIsCarteleraOpen(!isCarteleraOpen)
                  setIsUserMenuOpen(false)
                }}
                className={`flex items-center gap-1 hover:text-[#F6AD38] transition-colors whitespace-nowrap ${
                  isCarteleraOpen ? 'text-[#F6AD38]' : ''
                }`}
              >
                CARTELERA
                <FiChevronDown
                  className={`transition-transform duration-200 ${
                    isCarteleraOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isCarteleraOpen && <CarteleraDropdown />}
              </AnimatePresence>
            </li>

            {/* LINKS */}
            {NAV_LINKS.map((link) => (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className="whitespace-nowrap hover:text-[#F6AD38] transition-colors"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* ACCIONES INTERCEPTADAS POR INITIALIZING */}
        <div className="order-2 md:order-3 flex items-center gap-2 md:gap-4 min-w-[100px] sm:min-w-[130px] justify-end">
          {initializing ? (
            // 🟢 Mientras verifica la sesión, dejamos un espacio vacío o un micro-spinner discreto
            <div className="w-5 h-5 border-2 border-[#F6AD38] border-t-transparent rounded-full animate-spin opacity-40 mr-4" />
          ) : !isLoggedIn ? (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1 border border-[#F6AD38] text-[#F6AD38] px-2 sm:px-3 md:px-5 py-1 rounded-full font-bold text-[8px] sm:text-[10px] md:text-sm hover:bg-[#F6AD38] hover:text-[#2A154B] transition-all whitespace-nowrap animate-fadeIn"
            >
              INGRESAR
              <LoginIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0" />
            </button>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 shrink-0 animate-fadeIn">
              {/* PERFIL */}
              <div className="relative">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(!isUserMenuOpen)
                    setIsCarteleraOpen(false)
                  }}
                  className="flex items-center gap-2 cursor-pointer group shrink-0"
                >
                  <ProfileIcon className="w-9 h-9 md:w-8 md:h-8 text-[#F6AD38]" />

                  <span className="hidden lg:block text-lg font-bold tracking-tight text-white whitespace-nowrap">
                    ¡Hola {displayName}!
                  </span>

                  <FiChevronDown
                    className={`text-[#F6AD38] text-2xl transition-transform ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && <UserMenuDropdown />}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header