import React from "react"
import { FiShoppingCart, FiMenu } from "react-icons/fi"
import { HiOutlineLocationMarker } from "react-icons/hi"
import logoCineflix from '../../assets/images/logotype/logoCineflix.png';

function Header({ isLoggedIn = false, userName = "Yessica" }) {
  return (
    <header className="fixed top-0 left-0 w-full bg-[#2A154B] text-white z-50 shadow-md">
      <div className="flex items-center justify-between px-8 py-4">

        {/* Logo */}
            <div className="flex items-center gap-2 font-bold text-xl">
                <img 
                    src={logoCineflix} 
                    alt="Logo" 
                    className=" h-20 object-contain" 
                />
            </div>

        {/* Navegación */}
        <nav className="hidden md:flex gap-8 text-sm font-medium">
          <a href="#" className="hover:text-yellow-400">Cartelera</a>
          <a href="#" className="hover:text-yellow-400">Estrenos</a>
          <a href="#" className="hover:text-yellow-400">Confitería</a>
          <a href="#" className="hover:text-yellow-400">Sucursales</a>
          <a href="#" className="hover:text-yellow-400">Empresa</a>
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-4">

          {/* Ubicación */}
          <div className="hidden md:flex items-center gap-1 bg-purple-600 px-3 py-1 rounded-full text-sm">
            <HiOutlineLocationMarker />
            <span>Barquisimeto</span>
          </div>

          {/* Si está logueado */}
          {isLoggedIn ? (
            <>
              <FiShoppingCart className="text-xl cursor-pointer hover:text-yellow-400" />

              <span className="hidden md:block text-sm">
                ¡Hola {userName}!
              </span>

              <FiMenu className="text-xl cursor-pointer" />
            </>
          ) : (
            /* Si NO está logueado */
            <button className="border border-yellow-400 text-yellow-400 px-4 py-1 rounded-full hover:bg-yellow-400 hover:text-black transition">
              Ingresar →
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header