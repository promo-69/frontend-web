import React, { useState } from "react";
import { FiShoppingCart } from "react-icons/fi"; 
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from 'react-router-dom';

import logoCineflix from '../../assets/images/logotype/logoCineflix.png';
import { LoginIcon, LocationIcon } from "../ui/Icons";

function Header({ isLoggedIn = false, userName = "Yessica" }) {
  const navigate = useNavigate();
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Barquisimeto");

  const cities = [
    { state: "Carabobo", name: "Valencia" },
    { state: "Lara", name: "Barquisimeto" },
    { state: "Caracas", name: "Chacao" },
    { state: "Anzoategui", name: "Aragua de Barcelona" },
  ];

  const navLinks = ["Cartelera", "Estrenos", "Confitería", "Sucursales", "Empresa"];

  const CityDropdown = () => (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute top-full mt-2 right-0 w-52 bg-[#7B1A82] rounded-2xl overflow-hidden shadow-2xl z-[60] border border-white/10"
    >
      {cities.map((city, index) => (
        <div 
          key={index}
          onClick={() => { 
            setSelectedCity(city.name); 
            setIsCityOpen(false); 
          }}
          className={`px-4 py-3 text-xs cursor-pointer hover:bg-[#231640]/40 transition-colors border-b border-white/5 last:border-none ${
            selectedCity === city.name ? 'text-[#F6AD38] bg-[#231640]/20' : 'text-white'
          }`}
        >
          <p className="font-bold uppercase text-[9px] opacity-70 leading-none mb-1">
            {city.state}
          </p>
          <p className="text-sm">{city.name}</p>
        </div>
      ))}
    </motion.div>
  );

  return (
    <header className="fixed top-0 left-0 w-full bg-[#2A154B] text-white z-50 shadow-lg font-['Montserrat']">
      
      <div className="flex flex-wrap md:flex-nowrap items-center justify-between px-4 max-w-7xl mx-auto py-3 md:py-0 md:h-20 gap-y-3">
        
        {/* LOGO */}
        <div className="flex shrink-0 items-center">
          <img 
            src={logoCineflix} 
            alt="Logo" 
            className="h-9 sm:h-16 md:h-16 lg:h-20 w-auto object-contain"
          />
        </div>

        {/* NAV */}
        <nav className="order-3 md:order-2 w-full md:w-auto">
          <ul className="flex flex-wrap justify-center gap-x-3 sm:gap-x-5 md:gap-x-6 lg:gap-x-8 
                         text-[9px] sm:text-[11px] lg:text-sm font-bold uppercase tracking-wider">
            {navLinks.map((link) => (
              <li key={link}>
                <a href="#" className="whitespace-nowrap hover:text-[#F6AD38] transition-colors">
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* ACTIONS */}
        <div className="order-2 md:order-3 flex items-center gap-2 min-w-0">
          
          {/* CITY SELECTOR */}
          <div className="relative min-w-0">
            <button 
              onClick={() => setIsCityOpen(!isCityOpen)}
              className="flex items-center gap-1.5 bg-[#7B1A82] px-2 sm:px-3 md:px-4 py-1.5 rounded-full 
                         text-[9px] sm:text-[10px] lg:text-xs font-bold transition-all active:scale-95 max-w-full"
            >
              <LocationIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#F6AD38]" />
                  <span className="min-w-[10ch] max-w-[16ch] truncate text-left">
                    {selectedCity}
                  </span>
            </button>

            <AnimatePresence>
              {isCityOpen && <CityDropdown />}
            </AnimatePresence>
          </div>

          {/* LOGIN / USER */}
          {!isLoggedIn ? (
            <button 
              onClick={() => navigate('/login')} 
              className="flex items-center gap-1 border border-[#F6AD38] text-[#F6AD38] 
                        px-2 sm:px-3 md:px-5 py-1 rounded-full 
                        font-bold text-[8px] sm:text-[10px] md:text-sm 
                        hover:bg-[#F6AD38] hover:text-[#2A154B] 
                        transition-all whitespace-nowrap max-w-full">
              <span className="truncate">Ingresar</span>
              <LoginIcon className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 shrink-0" />
            </button>
          ) : (
            <div className="flex items-center gap-3 min-w-0">
              <FiShoppingCart className="text-xl lg:text-2xl cursor-pointer hover:text-[#F6AD38]" />
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