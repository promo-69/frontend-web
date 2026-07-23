import React from 'react'
import { FaInstagram, FaFacebookF, FaTiktok, FaWhatsapp } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { Link } from 'react-router-dom'
import logoCineflix from '../../assets/images/logotype/logoCineflix.png'

export default function Footer() {
  return (
    <footer className="bg-[#2A154B] text-white pt-12 pb-6 border-t-2 border-[#7B1A82] font-['Montserrat'] flex-shrink-0">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo y descripción */}
          <div className="flex flex-col items-center md:items-start">
            <img src={logoCineflix} alt="Cineflix Logo" className="h-16 mb-4 object-contain" />
            <p className="text-gray-400 text-sm text-center md:text-left mb-6">
              Vive la magia del cine con la mejor calidad y servicio. Tu entretenimiento es nuestra prioridad.
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-[#F6AD38] font-bold uppercase tracking-wider mb-4 text-sm">Explora</h3>
            <div className="flex flex-col gap-2 text-sm text-gray-300 items-center md:items-start">
              <Link to="/billboard" className="hover:text-[#F6AD38] transition-colors">Cartelera</Link>
              <Link to="/confectionery" className="hover:text-[#F6AD38] transition-colors">Confitería</Link>
              <Link to="/cinemas" className="hover:text-[#F6AD38] transition-colors">Sucursales</Link>
              <Link to="/business" className="hover:text-[#F6AD38] transition-colors">Empresa</Link>
            </div>
          </div>

          {/* Contacto */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-[#F6AD38] font-bold uppercase tracking-wider mb-4 text-sm">Contacto</h3>
            <div className="flex flex-col gap-2 text-sm text-gray-300 items-center md:items-start">
              <p>Email: contacto@cineflix.com</p>
              <div className="flex items-center gap-2 mt-1">
                <FaWhatsapp className="text-lg text-green-500" />
                <a href="https://wa.me/584245995961" target="_blank" rel="noreferrer" className="hover:text-[#F6AD38] transition-colors">
                  0424 599 5961
                </a>
              </div>
            </div>
          </div>

          {/* Redes Sociales */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-[#F6AD38] font-bold uppercase tracking-wider mb-4 text-sm">Síguenos</h3>
            <p className="text-gray-400 text-sm mb-4">@cineflix.promo69</p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com/cineflix.promo69"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-[#7B1A82]/30 flex items-center justify-center text-gray-300 hover:bg-[#F6AD38] hover:text-[#2A154B] transition-all"
                aria-label="Instagram"
              >
                <FaInstagram className="text-lg" />
              </a>
              <a
                href="https://x.com/cineflix.promo69"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-[#7B1A82]/30 flex items-center justify-center text-gray-300 hover:bg-[#F6AD38] hover:text-[#2A154B] transition-all"
                aria-label="X (Twitter)"
              >
                <FaXTwitter className="text-lg" />
              </a>
              <a
                href="https://tiktok.com/@cineflix.promo69"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-[#7B1A82]/30 flex items-center justify-center text-gray-300 hover:bg-[#F6AD38] hover:text-[#2A154B] transition-all"
                aria-label="TikTok"
              >
                <FaTiktok className="text-lg" />
              </a>
              <a
                href="https://facebook.com/cineflix.promo69"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-[#7B1A82]/30 flex items-center justify-center text-gray-300 hover:bg-[#F6AD38] hover:text-[#2A154B] transition-all"
                aria-label="Facebook"
              >
                <FaFacebookF className="text-lg" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} CINEFLIX - Todos los derechos reservados.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link to="/terms" className="hover:text-[#F6AD38] transition-colors">Términos y Condiciones</Link>
            <Link to="/privacy" className="hover:text-[#F6AD38] transition-colors">Políticas de Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
