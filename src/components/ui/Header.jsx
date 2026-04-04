import React, { useState } from "react";
import { FiShoppingCart, FiMenu, FiX } from "react-icons/fi"; 
import { HiOutlineLocationMarker } from "react-icons/hi";
import logoCineflix from '../../assets/images/logotype/logoCineflix.png';
import { LoginIcon } from "../ui/Icons";

function Header({ isLoggedIn = false, userName = "Yessica" }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full bg-[#2A154B] text-white z-50 shadow-lg">
      <div className="flex items-center justify-between px-4 max-w-7xl mx-auto h-16 md:h-20">
        
        {/* Logo - Ajustado tamaño para móvil y desktop */}
        <div className="flex items-center shrink-0">
          <img 
            src={logoCineflix} 
            alt="Logo" 
            className="h-12 md:h-28 w-auto object-contain transition-all"
          />
        </div>

        {/* Navegación Desktop */}
        <nav className="hidden lg:flex gap-6 text-sm font-medium">
          <a href="#" className="hover:text-yellow-400 transition-colors">Cartelera</a>
          <a href="#" className="hover:text-yellow-400 transition-colors">Estrenos</a>
          <a href="#" className="hover:text-yellow-400 transition-colors">Confitería</a>
          <a href="#" className="hover:text-yellow-400 transition-colors">Sucursales</a>
          <a href="#" className="hover:text-yellow-400 transition-colors">Empresa</a>
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Ubicación - Se oculta en móviles muy pequeños */}
          <div className="hidden sm:flex items-center gap-1 bg-purple-600/50 px-2.5 py-1 rounded-full text-[10px] md:text-xs">
            <HiOutlineLocationMarker />
            <span>Barquisimeto</span>
          </div>

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <FiShoppingCart className="text-xl cursor-pointer hover:text-yellow-400 transition-colors" />
              <span className="hidden md:block text-xs font-semibold">¡Hola {userName}!</span>
              {/* Botón menú móvil (solo logueado) */}
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden">
                {isMenuOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              
              <button className="
                  flex items-center gap-2 
                  border border-[#F6AD38] 
                  text-[#F6AD38] 
                  px-5 py-1 
                  rounded-full 
                  font-['Montserrat'] font-semibold text-sm
                  hover:bg-[#F6AD38] hover:text-[#2A154B] 
                  transition-all duration-300 group
                ">
                  <span>Ingresar</span>
                  
                  {/* Llamas a la función del icono */}
                  <LoginIcon className="w-5 h-5 transition-all duration-300" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MENÚ DESPLEGABLE MÓVIL */}
      {isMenuOpen && (
        <div className="lg:hidden bg-[#351b5e] border-t border-purple-800 animate-fade-in-down">
          <nav className="flex flex-col p-4 gap-4 text-sm font-medium">
            <a href="#" className="py-2 border-b border-purple-800/50">Cartelera</a>
            <a href="#" className="py-2 border-b border-purple-800/50">Estrenos</a>
            <a href="#" className="py-2 border-b border-purple-800/50">Confitería</a>
            <a href="#" className="py-2 border-b border-purple-800/50">Sucursales</a>
            <a href="#" className="py-2">Empresa</a>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;