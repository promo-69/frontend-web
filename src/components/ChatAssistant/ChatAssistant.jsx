import { useState, useEffect } from 'react'
import robotAvatar from '../../assets/images/robotIA.png' 

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [showBubble, setShowBubble] = useState(true)
  const [input, setInput] = useState('')
  const [isListening, setIsListening] = useState(false)

  // Ocultar la burbuja flotante de "¡Hola!" después de unos segundos desaparece
  useEffect(() => {
    const timer = setTimeout(() => setShowBubble(false), 8000)
    return () => clearTimeout(timer)
  }, [])

  // ========================================================
  //  RECONOCIMIENTO DE VOZ NATIVO (WEB SPEECH API)
  // ========================================================
  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      alert(
        'Tu navegador no soporta el reconocimiento de voz de forma nativa. ¡Te recomendamos usar Google Chrome!',
      )
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'es-VE' 
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    if (!isListening) {
      setIsListening(true)
      recognition.start()

      recognition.onresult = (event) => {
        const speechToText = event.results[0][0].transcript
        setInput((prev) => (prev ? `${prev} ${speechToText}` : speechToText))
      }

      recognition.onerror = (event) => {
        console.error('Error en reconocimiento de voz:', event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }
    }
  }

  const handleSend = () => {
    if (!input.trim()) return

    // Lógica/fetch para mandar el mensaje "input" al backend
    console.log('Mensaje enviado:', input)

    setInput('')
  }

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

          {/* Área de Entrada Integrada (Texto + Micrófono) */}
          <div className="p-3 bg-[#1e0f35] border-t border-[#ffb800]/20 flex gap-2 items-center">
            <div className="flex-1 bg-[#2d1b4e] rounded-lg px-3 py-2 flex items-center gap-2 border border-transparent focus-within:border-[#ffb800] transition-colors">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={
                  isListening ? 'Escuchando tu voz...' : 'Escribe un mensaje...'
                }
                className="flex-1 bg-transparent text-white text-sm focus:outline-none placeholder-gray-400"
              />

              {/* Botón de reconocimiento por voz */}
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`p-1 rounded-md transition-all ${
                  isListening
                    ? 'text-red-500 bg-red-500/10 scale-110 animate-pulse'
                    : 'text-gray-400 hover:text-[#ffb800]'
                }`}
                title="Dictar mensaje por voz"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                  />
                </svg>
              </button>
            </div>

            <button
              onClick={handleSend}
              className="bg-[#ffb800] text-[#1e0f35] font-bold px-4 py-2 rounded-lg text-sm hover:bg-[#e0a200] transition-colors"
            >
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
