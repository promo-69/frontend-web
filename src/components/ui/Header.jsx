import React, { useState } from "react";
import { FiShoppingCart, FiChevronDown, FiLogOut} from "react-icons/fi"; // Nuevos iconos
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from 'react-router-dom';

// Assets e Iconos
import logoCineflix from '../../assets/images/logotype/logoCineflix.png';
import { LoginIcon, LocationIcon, ProfileIcon } from "../ui/IconosProyect";

const CITIES = [
  { state: "Carabobo", name: "Valencia", id: "val" },
  { state: "Lara", name: "Barquisimeto", id: "barq" },
  { state: "Caracas", name: "Chacao", id: "cha" },
  { state: "Anzoategui", name: "Aragua de Barcelona", id: "ara" },
];

const NAV_LINKS = [
  { name: "Confitería", path: "/confiteria" },
  { name: "Sucursales", path: "/sucursales" },
  { name: "Empresa", path: "/empresa" },
];

function Header({ isLoggedIn = true, userName = "Yessea" }) {
  const navigate = useNavigate();
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isCarteleraOpen, setIsCarteleraOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Barquisimeto");

  // Dropdown para Cartelera
  const CarteleraDropdown = () => (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="absolute top-full mt-2 left-0 w-44 bg-[#7B1A82] rounded-2xl overflow-hidden shadow-2xl z-[70] border border-white/10"
    >
      <Link to="/cartelera" onClick={() => setIsCarteleraOpen(false)} className="block px-4 py-3 text-sm text-white hover:bg-[#231640]/40 transition-colors border-b border-white/5 font-bold uppercase tracking-tighter">CARTELERA</Link>
      <Link to="/estrenos" onClick={() => setIsCarteleraOpen(false)} className="block px-4 py-3 text-sm text-white hover:bg-[#231640]/40 transition-colors font-bold uppercase tracking-tighter">Estrenos</Link>
    </motion.div>
  );

  //Dropdown para Locaciones/Sucursales
  const CityDropdown = () => (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="absolute top-full mt-2 right-0 w-52 bg-[#7B1A82] rounded-2xl overflow-hidden shadow-2xl z-[70] border border-white/10"
    >
      {CITIES.map((city) => (
        <button
          key={city.id}
          onClick={() => { setSelectedCity(city.name); setIsCityOpen(false); }}
          className={`w-full text-left px-4 py-3 cursor-pointer hover:bg-[#231640]/40 transition-colors border-b border-white/5 last:border-none ${selectedCity === city.name ? 'bg-[#231640]/20' : ''}`}
        >
          <p className="font-bold uppercase text-[9px] text-[#F6AD38] opacity-90 leading-none mb-1">{city.state}</p>
          <p className="text-sm text-white">{city.name}</p>
        </button>
      ))}
    </motion.div>
  );

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
      
      <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-3 text-sm text-white hover:bg-[#7B1A82]/50 transition-colors border-b border-[#F6AD38]/30 font-bold tracking-tight">
         Perfil
      </Link>
      <Link to="/mis-compras" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-3 text-sm text-white hover:bg-[#7B1A82]/50 transition-colors border-b border-[#F6AD38]/30 font-bold tracking-tight">
         Historial de Compra
      </Link>
      <Link to="/canje-premios" onClick={() => setIsUserMenuOpen(false)} className="block px-4 py-3 text-sm text-white hover:bg-[#7B1A82]/50 transition-colors font-bold tracking-tight">
         Canje de Premios
      </Link>
      
      <button onClick={() => {navigate('/login'); }} className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm text-[#8F2925] hover:bg-red-500/10 transition-colors mt-2 border-t border-[#F6AD38]/50 font-bold tracking-tight">
        <span>Cerrar Sesión</span> <FiLogOut />
      </button>
    </motion.div>
  );

  return (
    <header className="fixed top-0 left-0 w-full bg-[#2A154B] text-white z-50 shadow-lg font-['Montserrat']">
      
      {/* OVERLAY */}
      <AnimatePresence>
        {(isCityOpen || isCarteleraOpen || isUserMenuOpen) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setIsCityOpen(false);
              setIsCarteleraOpen(false);
              setIsUserMenuOpen(false);
            }}
            className="fixed inset-0 bg-black/20 z-[55] backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      <div className="relative z-[60] flex flex-wrap md:flex-nowrap items-center justify-between px-4 max-w-7xl mx-auto py-3 md:py-0 md:h-20 gap-y-3">
        
        {/* LOGO */}
        <div className="flex shrink-0 items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
          <img src={logoCineflix} alt="Cineflix Logo" className="h-12 sm:h-16 md:h-16 lg:h-20 w-auto object-contain" />
        </div>

        {/* NAVEGACIÓN PRINCIPAL */}
        <nav className="order-3 md:order-2 w-full md:w-auto">
          <ul className="flex flex-wrap justify-center items-center gap-x-3 sm:gap-x-5 md:gap-x-6 lg:gap-x-8 text-[9px] sm:text-[11px] lg:text-sm font-bold uppercase tracking-wider">
            
            <li className="relative">
              <button onClick={() => { setIsCarteleraOpen(!isCarteleraOpen); setIsUserMenuOpen(false); }} className={`flex items-center gap-1 hover:text-[#F6AD38] transition-colors whitespace-nowrap ${isCarteleraOpen ? 'text-[#F6AD38]' : ''}`}>
                CARTELERA <FiChevronDown className={`transition-transform duration-200 ${isCarteleraOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>{isCarteleraOpen && <CarteleraDropdown />}</AnimatePresence>
            </li>

            {NAV_LINKS.map((link) => (
              <li key={link.name}><Link to={link.path} className="whitespace-nowrap hover:text-[#F6AD38] transition-colors">{link.name}</Link></li>
            ))}
          </ul>
        </nav>

        {/* ACCIONES - Locacion */}
        <div className="order-2 md:order-3 flex items-center gap-2 md:gap-4 min-w-0">
          
          <div className="relative">
            <button 
              onClick={() => { setIsCityOpen(!isCityOpen); setIsCarteleraOpen(false); setIsUserMenuOpen(false); }}
              className="flex items-center gap-1.5 bg-[#7B1A82] px-2 sm:px-3 md:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] lg:text-xs font-bold transition-all hover:bg-[#8e2296] active:scale-95 whitespace-nowrap"
            >
              <LocationIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F6AD38]" />
              <span className="w-[10ch] sm:w-auto sm:min-w-[8ch] max-w-[12ch] truncate text-left">{selectedCity}</span>
            </button>
            <AnimatePresence>{isCityOpen && <CityDropdown />}</AnimatePresence>
          </div>

          {/* LOGIN */}
          {!isLoggedIn ? (
            <button onClick={() => navigate('/login')} className="flex items-center gap-1 border border-[#F6AD38] text-[#F6AD38] px-2 sm:px-3 md:px-5 py-1 rounded-full font-bold text-[8px] sm:text-[10px] md:text-sm hover:bg-[#F6AD38] hover:text-[#2A154B] transition-all whitespace-nowrap">
              <span>INGRESAR</span> <LoginIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0" />
            </button>
          ) : (
            /*MODO LOGUEADO*/
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 shrink-0">
              
              {/* CARRITO AMARILLO */}
              <div className="relative cursor-pointer group shrink-0" onClick={() => navigate('/carrito')}>
                <FiShoppingCart className="text-2xl lg:text-3xl text-[#F6AD38] hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 bg-[#A133A9] text-[#F6AD38] text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  2
                </span>
              </div>

              {/* GRUPO PERFIL*/}
              <div className="relative">
                <button 
                  onClick={() => { setIsUserMenuOpen(!isUserMenuOpen); setIsCityOpen(false); setIsCarteleraOpen(false); }}
                  className="flex items-center gap-2 cursor-pointer group shrink-0"
                >
                  <ProfileIcon className="w-9 h-9 md:w-8 md:h-8 text-[#F6AD38] hover:opacity-80 transition-opacity" />
                  
                  {/* 🔥 Saludo: Visible en pantallas grandes, Montserrat Bold */}
                  <span className="hidden lg:block text-xl font-['Montserrat'] font-bold tracking-tight text-white whitespace-nowrap">
                    ¡Hola {userName}!
                  </span>
                  
                  <FiChevronDown className={`text-[#F6AD38] text-2xl transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Desplegable de Usuario */}
                <AnimatePresence>{isUserMenuOpen && <UserMenuDropdown />}</AnimatePresence>
              </div>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}

export default Header;