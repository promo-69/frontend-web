import { useLocation, useNavigate } from 'react-router-dom'
import { useRef, useEffect, useState } from 'react'
import QRCode from 'react-qr-code'
import useDocumentTitle from '../../../hooks/useDocumentTitle';


export default function OrderSuccess() {
  useDocumentTitle('Orden Exitosa');

  const { state } = useLocation()
  const navigate = useNavigate()

  const [localOrder, setLocalOrder] = useState(() => {
    if (state?.orderId || state?.qrCode) return { orderId: state?.orderId, qrCode: state?.qrCode, summary: state?.summary }
    try {
      const raw = sessionStorage.getItem('last_order')
      if (raw) return JSON.parse(raw)
    } catch (e) {
      console.warn('Could not parse last_order from sessionStorage', e)
    }
    return null
  })

  // If not present, poll sessionStorage briefly to allow previous page or socket to write it.
  useEffect(() => {
    if (localOrder) {
      // clear persisted fallback once we've consumed it
      try {
        sessionStorage.removeItem('last_order')
      } catch (e) {
        // ignore
      }
      return
    }

    let attempts = 0
    const maxAttempts = 10
    const interval = 200
    const id = setInterval(() => {
      attempts += 1
      try {
        const raw = sessionStorage.getItem('last_order')
        if (raw) {
          const parsed = JSON.parse(raw)
          setLocalOrder(parsed)
          try { sessionStorage.removeItem('last_order') } catch (e) {}
          clearInterval(id)
          return
        }
      } catch (e) {
        // ignore parse errors
      }

      if (attempts >= maxAttempts) {
        clearInterval(id)
      }
    }, interval)

    return () => clearInterval(id)
  }, [localOrder])

  const orderId = state?.orderId ?? localOrder?.orderId
  const qrCode = state?.qrCode ?? localOrder?.qrCode



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
    <div
      className="min-h-screen p-6 text-white flex flex-col items-center justify-center gap-6"
      style={{
        background:
          'linear-gradient(to bottom, #231640 0%, #4c115c 50%, #231640 100%)',
      }}
    >
      <div className="bg-[#1f1533]/95 border border-gray-700/60 p-8 rounded-3xl text-center max-w-md w-full shadow-2xl shadow-black/40">
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-200 mb-4">¡Pago Confirmado!</h2>
        <p className="text-gray-300 mb-4">Orden #{orderId}</p>

        {/* Purchase Summary */}
        {localOrder?.summary && (
          <div className="bg-white/5 rounded-2xl p-4 mb-5 text-left space-y-2 text-sm">
            {localOrder.summary.movie && (
              <div className="pb-2 border-b border-white/10">
                <p className="font-bold text-yellow-400">{localOrder.summary.movie}</p>
                <p className="text-white/50 text-xs">{localOrder.summary.showtime}</p>
                {localOrder.summary.seats && (
                  <div className="flex gap-1 flex-wrap mt-1">
                    {localOrder.summary.seats.map((s, i) => (
                      <span key={i} className="bg-yellow-400/20 text-yellow-400 px-1.5 py-0.5 rounded text-[10px] font-bold">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {localOrder.summary.concessions && localOrder.summary.concessions.length > 0 && (
              <div className="pb-2 border-b border-white/10">
                <p className="text-xs font-semibold text-white/70 mb-1">Confitería</p>
                {localOrder.summary.concessions.map((c, i) => (
                  <div key={i} className="flex justify-between text-xs text-white/50">
                    <span>{c.name} ×{c.qty}</span>
                    <span>${c.subtotal?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-between items-center pt-1">
              <span className="font-bold text-white">Total</span>
              <div className="text-right">
                <span className="text-yellow-400 font-bold block">
                  Bs. {localOrder.summary.totalBs?.toFixed(2) || localOrder.summary.total?.toFixed(2) || '—'}
                </span>
                <span className="text-white/40 text-xs">≈ ${localOrder.summary.total?.toFixed(2) || '—'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Descargar QR arriba */}
        {(isToken || qrSrc) && (
          <button onClick={downloadQrImage} className="mb-3 w-full bg-yellow-500 text-black py-2.5 rounded-xl font-semibold text-sm hover:brightness-110 transition-all">
            Descargar QR
          </button>
        )}

        {isToken ? (
          <div ref={qrRef} className="bg-white p-3 rounded-xl inline-block mx-auto">
            <QRCode value={String(qrCode)} size={192} />
          </div>
        ) : qrSrc ? (
          <div ref={qrRef} className="mx-auto w-48 h-48 bg-white p-2 rounded-xl">
            <img
              src={qrSrc}
              alt="QR Code"
              className="w-full h-full object-contain"
              onError={(e) => console.error('OrderSuccess: error cargando QR image', e)}
            />
          </div>
        ) : (
          <p className="text-gray-400 mb-4">No se proporcionó código QR.</p>
        )}
      </div>

      <button
        onClick={() => navigate('/')}
        className="bg-gradient-to-r from-yellow-500 to-amber-400 hover:from-yellow-600 hover:to-amber-300 text-black px-8 py-3 rounded-2xl font-bold shadow-lg shadow-yellow-500/20 transition-transform active:scale-[0.98]"
      >
        Ir al inicio
      </button>
    </div>
  )
}
