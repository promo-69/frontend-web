import { useLocation, useNavigate } from 'react-router-dom'
import { useRef, useEffect } from 'react'
import QRCode from 'react-qr-code'

export default function OrderSuccess() {
  const { state } = useLocation()
  const navigate = useNavigate()
  // fallback to sessionStorage in case location.state was lost
  let stored = null
  try {
    const raw = sessionStorage.getItem('last_order')
    if (raw) stored = JSON.parse(raw)
  } catch (e) {
    console.warn('Could not parse last_order from sessionStorage', e)
  }

  const orderId = state?.orderId ?? stored?.orderId
  const qrCode = state?.qrCode ?? stored?.qrCode

  const fallback = stored

  // clear fallback after mount (avoid side-effects during render — StrictMode mounts twice in dev)
  useEffect(() => {
    if (fallback) {
      try {
        sessionStorage.removeItem('last_order')
      } catch (e) {
        // ignore
      }
    }
  }, [fallback])

  console.log('OrderSuccess state:', { state, orderId, qrCode })

  if (!orderId && !qrCode) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-xl font-semibold">No hay detalles de la orden.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-yellow-500 text-black px-4 py-2 rounded-xl"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  // Build a safe image source for the QR. Backend may return:
  // - a full data URL (data:image/...)
  // - a remote URL (http/https)
  // - a token/string (JWT) that should be encoded into a QR image
  const buildQrSrc = (code) => {
    if (!code) return null
    if (typeof code !== 'string') return null
    const trimmed = code.trim()
    if (trimmed.startsWith('data:')) return trimmed
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed
    // Fallback: generate via public QR API
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(trimmed)}`
  }

  const qrSrc = buildQrSrc(qrCode)
  const isToken = qrCode && typeof qrCode === 'string' && !qrCode.trim().startsWith('data:') && !qrCode.trim().startsWith('http://') && !qrCode.trim().startsWith('https://')
  const qrRef = useRef(null)

  const downloadQrImage = async () => {
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
      console.error('downloadQrImage failed', e)
    }
  }

  return (
    <div className="min-h-screen p-6 text-white flex items-center justify-center">
      <div className="bg-[#1f1533] border border-gray-700 p-8 rounded-2xl text-center max-w-md">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Pago confirmado</h2>
        <p className="text-gray-300 mb-4">Orden ID: <span className="font-bold">{orderId}</span></p>

        {isToken ? (
          <div className="mb-4 flex items-center justify-center">
            <div ref={qrRef} className="bg-white p-2 rounded-md inline-block">
              <QRCode value={String(qrCode)} size={192} />
            </div>
            <div className="ml-4">
              <button onClick={downloadQrImage} className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-semibold">Descargar QR</button>
            </div>
          </div>
        ) : qrSrc ? (
          <div className="mb-4">
            <div ref={qrRef} className="mx-auto w-48 h-48">
              <img
                src={qrSrc}
                alt="QR Code"
                className="mx-auto w-48 h-48 object-contain"
                onError={(e) => {
                  console.error('OrderSuccess: error cargando QR image', e)
                }}
              />
            </div>
            <div className="mt-3">
              <button onClick={downloadQrImage} className="bg-yellow-500 text-black px-4 py-2 rounded-xl font-semibold">Descargar QR</button>
            </div>
          </div>
        ) : (
          <p className="text-gray-400 mb-4">No se proporcionó código QR.</p>
        )}

        <button
          onClick={() => navigate('/')}
          className="mt-4 bg-yellow-500 text-black px-4 py-2 rounded-xl font-bold"
        >
          Ir al inicio
        </button>
      </div>
    </div>
  )
}
