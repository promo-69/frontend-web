import React from 'react'
import { FaInstagram, FaFacebookF, FaTiktok, FaWhatsapp } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'

export default function Footer() {
  return (
    <footer className="py-8 md:py-12 text-center text-gray-500 border-t border-white/10 text-xs md:text-sm bg-[#2A154B] flex-shrink-0">
      <p className="mb-4 text-white font-bold tracking-wider uppercase text-xs md:text-sm">Síguenos en nuestras redes sociales</p>
      <div className="flex justify-center items-center gap-6 mb-6">
        <a
          href="https://instagram.com/cineflix.promo69"
          target="_blank"
          rel="noreferrer"
          className="text-gray-400 hover:text-[#F6AD38] transition-colors"
          aria-label="Instagram"
        >
          <FaInstagram className="text-xl md:text-2xl" />
        </a>
        <a
          href="https://x.com/cineflix.promo69"
          target="_blank"
          rel="noreferrer"
          className="text-gray-400 hover:text-[#F6AD38] transition-colors"
          aria-label="X (Twitter)"
        >
          <FaXTwitter className="text-xl md:text-2xl" />
        </a>
        <a
          href="https://tiktok.com/@cineflix.promo69"
          target="_blank"
          rel="noreferrer"
          className="text-gray-400 hover:text-[#F6AD38] transition-colors"
          aria-label="TikTok"
        >
          <FaTiktok className="text-xl md:text-2xl" />
        </a>
        <a
          href="https://facebook.com/cineflix.promo69"
          target="_blank"
          rel="noreferrer"
          className="text-gray-400 hover:text-[#F6AD38] transition-colors"
          aria-label="Facebook"
        >
          <FaFacebookF className="text-xl md:text-2xl" />
        </a>
      </div>
      <p className="mb-1 text-[#F6AD38] font-semibold tracking-wider">@cineflix.promo69</p>
      <div className="flex justify-center items-center gap-2 mb-4 text-gray-400 font-medium tracking-wide">
        <FaWhatsapp className="text-xl text-green-500" />
        <a href="https://wa.me/584245995961" target="_blank" rel="noreferrer" className="hover:text-[#F6AD38] transition-colors">04245995961</a>
      </div>
      <p>&copy; 2026 CINEFLIX - Todos los derechos reservados.</p>
    </footer>
  )
}
