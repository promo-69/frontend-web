import { useEffect } from 'react'
import { useRef } from 'react'
import QRCode from 'react-qr-code'
import { useLocation, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

export default function SuccessQR() {
  const location = useLocation()
  const navigate = useNavigate()
  const { clearCart } = useCart()

  // Extraemos los datos enviados a través del estado de navegación
  const { orderId, qrCode } = location.state || {}

  const qrRef = useRef(null)

  const downloadQr = async () => {
    try {
      const svg = qrRef.current?.querySelector('svg')
      if (!svg) return
      const serializer = new XMLSerializer()
      const svgString = serializer.serializeToString(svg)
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const img = new Image()
      const size = 600
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        URL.revokeObjectURL(url)
        canvas.toBlob((blobPng) => {
          const a = document.createElement('a')
          a.href = URL.createObjectURL(blobPng)
          a.download = `order-${orderId || 'qr'}.png`
          document.body.appendChild(a)
          a.click()
          a.remove()
        }, 'image/png')
      }
      img.onerror = (e) => {
        console.error('Error loading SVG as image for download', e)
        URL.revokeObjectURL(url)
      }
      img.src = url
    } catch (e) {
      console.error('downloadQr failed', e)
    }
  }

  useEffect(() => {
    if (orderId) {
      clearCart() 
    } else {
      navigate('/')
    }
  }, [orderId, clearCart, navigate])

  if (!orderId) return null

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 text-white"
      style={{
        background:
          'linear-gradient(to bottom, #231640 0%, #4c115c 50%, #231640 100%)',
      }}
    >
      {/* 🎉 Animación/Efecto superior de éxito */}
      <div className="text-center space-y-2 mb-6 animate-fade-in">
        <div className="w-16 h-16 bg-green-500/20 text-green-400 border border-green-500/40 rounded-full flex items-center justify-center text-3xl mx-auto shadow-lg shadow-green-500/10 animate-bounce">
          ✓
        </div>
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-200">
          ¡Disfruta tu Función!
        </h1>
        <p className="text-gray-300 text-sm">
          Tu pago ha sido procesado de manera exitosa.
        </p>
      </div>

      {/* 🎟️ BOLETO DIGITAL ANIMADO */}
      <div className="w-full max-w-sm bg-[#1f1533] border border-gray-700 rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="absolute top-[68%] -left-4 w-8 h-8 bg-[#3d1353] rounded-full border-r border-gray-700 hidden sm:block"></div>
        <div className="absolute top-[68%] -right-4 w-8 h-8 bg-[#3d1353] rounded-full border-l border-gray-700 hidden sm:block"></div>

        {/* Encabezado del Ticket */}
        <div className="bg-[#2D1748] p-5 text-center border-b border-dashed border-gray-700/60">
          <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">
            Código de Entrada
          </p>
          <p className="text-lg font-bold text-yellow-400 mt-1">
            Orden #{orderId}
          </p>
        </div>

        {/* Cuerpo del Ticket: Renderizado del QR */}
        <div className="p-6 flex flex-col items-center bg-black/10">
          <div className="bg-white p-4 rounded-2xl shadow-inner shadow-black/40 transition-transform hover:scale-105 duration-300">
              {/* Build a safe QR image source: data URL, remote URL, or generate via public API */}
              {(() => {
                if (!qrCode) return null
                const trimmed = String(qrCode).trim()
                if (!trimmed) return null
                const isToken = !trimmed.startsWith('data:') && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')
                if (isToken) {
                  return (
                    <div className="mb-4 flex items-center justify-center">
                      <div ref={qrRef} className="bg-white p-2 rounded-md inline-block">
                        <QRCode value={trimmed} size={192} />
                      </div>
                      <div className="ml-4">
                        <button onClick={downloadQr} className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-semibold">Descargar QR</button>
                      </div>
                    </div>
                  )
                }
                const src = trimmed.startsWith('data:') ? trimmed : `data:image/png;base64,${trimmed}`
                return (
                  <div className="mb-4">
                    <div ref={qrRef}>
                      <img
                        src={src}
                        alt={`Código QR de la orden ${orderId}`}
                        className="w-48 h-48 object-contain"
                        onError={(e) => {
                          console.error('Error cargando la imagen del código QR.', e)
                        }}
                      />
                    </div>
                    <div className="mt-3">
                      <button onClick={downloadQr} className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-semibold">Descargar QR</button>
                    </div>
                  </div>
                )
              })()}
          </div>

          <p className="text-xs text-gray-400 text-center mt-5 max-w-[240px] leading-relaxed">
            Muestra este código QR directamente desde tu teléfono en el punto de
            control de la entrada del cine.
          </p>
        </div>

        {/* Pie de Boleto: Recordatorios de Seguridad */}
        <div className="p-5 bg-[#25193e] border-t border-gray-800 text-center space-y-3">
          <div className="flex justify-center gap-6 text-xs text-gray-400">
            <div className="text-center">
              <p className="font-semibold text-gray-300">🍿 CONFITERÍA</p>
              <p className="text-[10px] text-green-400 mt-0.5">
                Lista para retirar
              </p>
            </div>
            <div className="w-px bg-gray-700 h-6 self-center"></div>
            <div className="text-center">
              <p className="font-semibold text-gray-300">🎟️ BUTACAS</p>
              <p className="text-[10px] text-green-400 mt-0.5">Asignadas</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full mt-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black py-2.5 rounded-xl font-bold transition-all text-sm shadow-md shadow-yellow-600/10 active:scale-[0.98]"
          >
            Volver a la Cartelera
          </button>
        </div>
      </div>
    </div>
  )
}
