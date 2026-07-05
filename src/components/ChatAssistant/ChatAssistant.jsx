import { useState, useEffect } from 'react'
import robotAvatar from '../../assets/images/robotIA.png' 

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [showBubble, setShowBubble] = useState(true)

  // Ocultar la burbuja flotante de "¡Hola!" después de unos segundos desaparece 
  useEffect(() => {
    const timer = setTimeout(() => setShowBubble(false), 8000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
      {/* VENTANA DE CHAT */}
      {isOpen && (
        <div className="bg-[#2d1b4e] border border-[#ffb800] rounded-2xl w-80 sm:w-96 h-[360px] shadow-2xl flex flex-col overflow-hidden mb-4 animate-fade-in-up">
          {/* Encabezado del Chat */}
          <div className="bg-[#1e0f35] p-4 flex items-center justify-between border-b border-[#ffb800]/30">
            <div className="flex items-center gap-3">
              <img
                src={robotAvatar}
                alt="Cineflix AI"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h3 className="text-white font-bold text-sm">
                  Asistente IA Cineflix
                </h3>
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 inline-block animate-pulse"></span>{' '}
                  En línea
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white text-xl p-1"
            >
              ✕
            </button>
          </div>

          {/* Cuerpo del Chat (Mensajes) */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#130726]">
            <div className="bg-[#2d1b4e] text-white p-3 rounded-lg max-w-[80%] text-sm rounded-tl-none border border-purple-900">
              ¡Hola! 🎬 Soy tu asistente de Cineflix. ¿Te ayudo a elegir tus
              asientos o snacks?
            </div>
          </div>

          <div className="p-3 bg-[#1e0f35] border-t border-[#ffb800]/20 flex gap-2">
            <input
              type="text"
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-[#2d1b4e] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#ffb800]"
            />
            <button className="bg-[#ffb800] text-[#1e0f35] font-bold px-4 py-2 rounded-lg text-sm hover:bg-[#e0a200] transition-colors">
              Enviar
            </button>
          </div>
        </div>
      )}

      {/* BOTÓN FLOTANTE  */}
      <div className="relative group cursor-pointer mt-auto">
        {showBubble && !isOpen && (
          <div className="absolute right-36 bottom-14 bg-[#ffb800] text-[#1e0f35] font-bold text-xs py-2 px-3.5 rounded-xl rounded-br-none shadow-lg whitespace-nowrap animate-bounce">
            ¡Hola! ¿Te ayudo con tu compra? ✨
          </div>
        )}

        {/* Imagen del Robot */}
        <button
          onClick={() => {
            setIsOpen(!isOpen)
            setShowBubble(false)
          }}
          className="transition-transform duration-300 hover:scale-105 focus:outline-none flex items-center justify-center"
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <img
            src={robotAvatar}
            alt="Abrir Asistente IA"
            className="w-40 h-40 sm:w-48 sm:h-48 object-contain drop-shadow-[0_8px_25px_rgba(147,51,234,0.4)]"
          />
        </button>
      </div>
    </div>
  )
}
