import React, { useState } from "react";
import { FiShoppingCart, FiMenu, FiX } from "react-icons/fi"; 
import { motion, AnimatePresence } from "framer-motion"; // Importación necesaria

import logoCineflix from '../../assets/images/logotype/logoCineflix.png';
import { LoginIcon, LocationIcon } from "../ui/Icons";

function Header({ isLoggedIn = false, userName = "Yessica" }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Barquisimeto");

  const cities = [
    { state: "Carabobo", name: "Valencia" },
    { state: "Lara", name: "Barquisimeto" },
    { state: "Caracas", name: "Chacao" },
    { state: "Anzoategui", name: "Aragua de Barcelona" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full bg-[#2A154B] text-white z-50 shadow-lg">
      <div className="flex items-center justify-between px-4 max-w-7xl mx-auto h-16 md:h-20">
        
        {/* Logo */}
        <div className="flex items-center shrink-0">
          <img 
            src={logoCineflix} 
            alt="Logo" 
            className="h-28 md:h-28 w-auto object-contain transition-all"
          />
        </div>

        {/* Navegación Desktop */}
        <nav className="hidden lg:flex gap-5 text-m font-medium">
          <a href="#" className="hover:text-[#F6AD38] transition-colors">Cartelera</a>
          <a href="#" className="hover:text-[#F6AD38] transition-colors">Estrenos</a>
          <a href="#" className="hover:text-[#F6AD38] transition-colors">Confitería</a>
          <a href="#" className="hover:text-[#F6AD38] transition-colors">Sucursales</a>
          <a href="#" className="hover:text-[#F6AD38] transition-colors">Empresa</a>
        </nav>

        {/* Contenedor de Acciones */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Selector de Ciudad (Combo Box con Animación) */}
            <div className="relative font-['Montserrat']">
            <button 
              onClick={() => setIsCityOpen(!isCityOpen)}
              className="flex items-center justify-between w-[130px] md:w-[160px] bg-[#7B1A82] hover:bg-[#7B1A82]/60 px-3 py-1.5 rounded-full transition-all duration-300"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <LocationIcon className="w-5 h-5 text-[#F6AD38] shrink-0" /> 
                {/* truncate evita que nombres largos como "Aragua de Barcelona" empujen el resto */}
                <span className="text-[10px] md:text-xs font-medium truncate">
                  {selectedCity}
                </span>
              </div>
              
              <div className={`ml-1 shrink-0 transition-transform duration-300 ${isCityOpen ? 'rotate-180' : ''}`}>
                <svg width="10" height="7.5" viewBox="0 0 10 7" fill="none">
                  <path d="M5 7L0.669873 0.25L9.33013 0.25L5 7Z" fill="#F6A638"/>
                </svg>
              </div>
            </button>

            {/* Animación de entrada y salida */}
            <AnimatePresence>
              {isCityOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full mt-2 left-0 w-48 bg-[#7B1A82] border border-[#7B1A82]/30 rounded-2xl overflow-hidden shadow-2xl z-50"
                >
                  {cities.map((city, index) => (
                    <div 
                      key={index}
                      onClick={() => {
                        setSelectedCity(city.name);
                        setIsCityOpen(false);
                      }}
                      className={`
                        px-4 py-2.5 text-xs cursor-pointer transition-colors border-b border-[#7B1A82]/10 last:border-none
                        hover:bg-[#231640]/40
                        ${selectedCity === city.name ? 'bg-[#231640]/40 text-[#F6AD38]' : 'text-white'}
                      `}
                    >
                      <span className="font-semibold">{city.state}</span>
                      <span className="ml-1 opacity-90">{city.name}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Lógica de Autenticación */}
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <FiShoppingCart className="text-xl cursor-pointer hover:text-[#F6AD38] transition-colors" />
              <span className="hidden md:block text-xs font-semibold">¡Hola {userName}!</span>
              
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden">
                {isMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button className="
                flex items-center gap-2 border border-[#F6AD38] text-[#F6AD38] px-5 py-1.5
                rounded-full font-['Montserrat'] font-semibold text-sm hover:bg-[#F6AD38] hover:text-[#2A154B] 
                transition-all duration-300 group"
              >
                <span>Ingresar</span>
                <LoginIcon className="w-6 h-6 transition-all duration-300" />
              </button>

              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-1">
                {isMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MENÚ DESPLEGABLE MÓVIL */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="lg:hidden bg-[#351b5e] border-t border-purple-800 overflow-hidden"
          >
            <nav className="flex flex-col p-4 gap-4 text-sm font-medium">
              <a href="#" className="py-2 border-b border-purple-800/50">Cartelera</a>
              <a href="#" className="py-2 border-b border-purple-800/50">Estrenos</a>
              <a href="#" className="py-2 border-b border-purple-800/50">Confitería</a>
              <a href="#" className="py-2 border-b border-purple-800/50">Sucursales</a>
              <a href="#" className="py-2">Empresa</a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;