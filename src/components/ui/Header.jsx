import React, { useState } from "react";
import { FiShoppingCart } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from 'react-router-dom';

// Asumiendo que estos componentes existen en tu proyecto
import logoCineflix from '../../assets/images/logotype/logoCineflix.png';
import { LoginIcon, LocationIcon } from "../ui/IconosProyect";

// Datos fuera del componente para evitar re-renderizados innecesarios
const CITIES = [
  { state: "Carabobo", name: "Valencia", id: "val" },
  { state: "Lara", name: "Barquisimeto", id: "barq" },
  { state: "Caracas", name: "Chacao", id: "cha" },
  { state: "Anzoategui", name: "Aragua de Barcelona", id: "ara" },
];

const NAV_LINKS = [
  { name: "Cartelera", path: "/cartelera" },
  { name: "Estrenos", path: "/estrenos" },
  { name: "Confitería", path: "/confiteria" },
  { name: "Sucursales", path: "/sucursales" },
  { name: "Empresa", path: "/empresa" },
];

function Header({ isLoggedIn = false, userName = "Yessica" }) {
  const navigate = useNavigate();
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Barquisimeto");

  // Componente interno para el Dropdown de ciudades
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
          onClick={() => {
            setSelectedCity(city.name);
            setIsCityOpen(false);
          }}
          className={`w-full text-left px-4 py-3 cursor-pointer hover:bg-[#231640]/40 transition-colors border-b border-white/5 last:border-none ${
            selectedCity === city.name ? 'bg-[#231640]/20' : ''
          }`}
        >
          <p className="font-bold uppercase text-[9px] text-[#F6AD38] opacity-90 leading-none mb-1">
            {city.state}
          </p>
          <p className="text-sm text-white">{city.name}</p>
        </button>
      ))}
    </motion.div>
  );

  return (
    <header className="fixed top-0 left-0 w-full bg-[#2A154B] text-white z-50 shadow-lg font-['Montserrat']">
      
      {/* OVERLAY: Esto permite cerrar el dropdown haciendo clic en cualquier parte vacía */}
      <AnimatePresence>
        {isCityOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCityOpen(false)}
            className="fixed inset-0 bg-black/20 z-[55] backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>

      <div className="relative z-[60] flex flex-wrap md:flex-nowrap items-center justify-between px-4 max-w-7xl mx-auto py-3 md:py-0 md:h-20 gap-y-3">
        
        {/* LOGO */}
        <div 
          className="flex shrink-0 items-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate('/')}
        >
          <img 
            src={logoCineflix} 
            alt="Cineflix Logo" 
            className="h-9 sm:h-16 md:h-16 lg:h-20 w-auto object-contain"
          />
        </div>

        {/* NAVEGACIÓN PRINCIPAL */}
        <nav className="order-3 md:order-2 w-full md:w-auto">
          <ul className="flex flex-wrap justify-center gap-x-3 sm:gap-x-5 md:gap-x-6 lg:gap-x-8 
                         text-[9px] sm:text-[11px] lg:text-sm font-bold uppercase tracking-wider">
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

        {/* ACCIONES (Ciudad y Login) */}
        <div className="order-2 md:order-3 flex items-center gap-2 min-w-0">
          
          {/* SELECTOR DE CIUDAD */}
          <div className="relative">
            <button 
              onClick={() => setIsCityOpen(!isCityOpen)}
              className="flex items-center gap-1.5 bg-[#7B1A82] px-2 sm:px-3 md:px-4 py-1.5 rounded-full 
                         text-[9px] sm:text-[10px] lg:text-xs font-bold transition-all 
                         hover:bg-[#8e2296] active:scale-95"
            >
              <LocationIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F6AD38]" />
              <span className="w-[10ch] sm:w-auto sm:min-w-[8ch] max-w-[12ch] truncate text-left">
                {selectedCity}
              </span>
            </button>

            <AnimatePresence>
              {isCityOpen && <CityDropdown />}
            </AnimatePresence>
          </div>

          {/* LOGIN / USUARIO */}
          {!isLoggedIn ? (
            <button 
              onClick={() => navigate('/login')} 
              className="flex items-center gap-1 border border-[#F6AD38] text-[#F6AD38] 
                        px-2 sm:px-3 md:px-5 py-1 rounded-full 
                        font-bold text-[8px] sm:text-[10px] md:text-sm 
                        hover:bg-[#F6AD38] hover:text-[#2A154B] 
                        transition-all whitespace-nowrap"
            >
              <span>INGRESAR</span>
              <LoginIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0" />
            </button>
          ) : (
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative cursor-pointer group">
                <FiShoppingCart className="text-xl lg:text-2xl hover:text-[#F6AD38] transition-colors" />
                {/* Badge opcional para el carrito */}
                <span className="absolute -top-1 -right-1 bg-[#F6AD38] text-[#2A154B] text-[8px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  0
                </span>
              </div>
              <span className="hidden sm:block text-[10px] sm:text-xs font-bold truncate">
                ¡Hola {userName}!
              </span>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}

export default Header;