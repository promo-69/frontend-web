import React, { useEffect, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { FiX, FiCalendar, FiHash, FiClock, FiChevronDown, FiChevronUp } from 'react-icons/fi'

export default function MyRentRequests({ isOpen, onClose, fetchService }) {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  // 1. Envolver la petición en useCallback para evitar re-creaciones infinitas
  const loadRequests = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchService()
      setRequests(data || [])
    } catch (error) {
      console.error("❌ Error recuperando mis solicitudes de alquiler:", error)
      setRequests([])
    } finally {
      setLoading(false)
    }
  }, [fetchService])

  // 2. Manejo limpio del scroll del body
  useEffect(() => {
    if (isOpen) {
      loadRequests()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen, loadRequests])

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const formatEventDate = (dateISO) => {
    if (!dateISO) return ''
    const dateObj = new Date(dateISO)
    return dateObj.toLocaleDateString('es-VE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).replace('.', '')
  }

  const getStatusStyles = (statusDesc) => {
    const desc = statusDesc?.toLowerCase() || ''
    if (desc.includes('aprobada') || desc.includes('aceptada') || desc.includes('completada')) {
      return {
        badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30",
        box: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300/90",
        message: "¡Tu solicitud ha sido aprobada! Nuestro equipo se pondrá en contacto contigo para coordinar los detalles finales de tu pago y logística."
      }
    }
    if (desc.includes('rechazada') || desc.includes('cancelada')) {
      return {
        badge: "bg-rose-500/10 text-rose-400 border border-rose-500/30",
        box: "border-rose-500/40 bg-rose-500/5 text-rose-300/90",
        message: "Esta solicitud no fue aprobada. Puedes intentar con otra fecha, sucursal o sala disponible."
      }
    }
    return {
      badge: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
      box: "border-amber-500/30 bg-amber-500/5 text-amber-300/90",
      message: "Tu solicitud está siendo evaluada por la administración del complejo cinematográfico. Te notificaremos pronto."
    }
  }

  // 3. En lugar de retornar null, manejamos la visibilidad con clases de Tailwind
  // Esto permite que las animaciones de entrada y salida funcionen nativamente.
  return createPortal(
    <div 
      className={`fixed inset-0 z-50 flex justify-end font-['Montserrat'] transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop Traslúcido */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Cuerpo del Panel Lateral (Drawer con transiciones de Tailwind puras) */}
      <div 
        className={`relative w-full max-w-md h-full bg-[#231640] border-l border-white/10 shadow-2xl flex flex-col z-10 text-white transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1b1032]">
          <div>
            <h4 className="text-lg font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
              Mis Solicitudes
            </h4>
            <p className="text-[11px] text-gray-400 mt-0.5">Historial y estados de reserva de sala</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full border border-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido / Listado */}
        <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-4">
          {loading ? (
            <div className="h-48 flex flex-col justify-center items-center gap-3">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-yellow-500 border-t-transparent rounded-full" />
              <p className="text-xs text-gray-400 tracking-wider uppercase">Consultando servidor...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-12 px-4 border border-white/5 bg-white/[0.02] rounded-2xl text-center text-sm text-gray-400 italic">
              Aún no has realizado solicitudes de alquiler de sala.
            </div>
          ) : (
            requests.map((req) => {
              const isExpanded = expandedId === req.id
              const statusCfg = getStatusStyles(req.status?.description)
              
              return (
                <div 
                  key={req.id}
                  className="bg-[#2a1b4d]/60 border border-white/10 rounded-2xl transition-all duration-300 overflow-hidden"
                >
                  {/* Fila Principal / Colapsada */}
                  <div 
                    onClick={() => toggleExpand(req.id)}
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-indigo-700 border border-white/10 rounded-xl flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 6h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-sm text-white truncate max-w-[180px]">
                          {req.event_name}
                        </h5>
                        <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <FiCalendar className="w-3 h-3 shrink-0" />
                          {req.requested_start_time ? new Date(req.requested_start_time).toLocaleDateString('es-VE') : 'S/F'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${statusCfg.badge}`}>
                        {req.status?.description || 'Pendiente'}
                      </span>
                      {isExpanded ? <FiChevronUp className="text-gray-400 w-4 h-4" /> : <FiChevronDown className="text-gray-400 w-4 h-4" />}
                    </div>
                  </div>

                  {/* Bloque Desplegable Interno controlado por altura máxima de Tailwind */}
                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded ? 'max-h-[350px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-4 pb-4 pt-1 border-t border-white/5 bg-[#1e123a]/40 text-xs text-gray-300 flex flex-col gap-3">
                      <div className="h-[1px] bg-white/5 my-0.5" />
                      
                      <div className="flex items-center gap-2">
                        <FiHash className="text-yellow-500 w-3.5 h-3.5" />
                        <p><strong>Referencia:</strong> #{req.id}</p>
                      </div>

                      <div className="flex items-start gap-2">
                        <FiClock className="text-yellow-500 w-3.5 h-3.5 mt-0.5" />
                        <p>
                          <strong>Fecha y hora:</strong><br />
                          <span className="text-white text-[11px] font-medium block mt-0.5">
                            {formatEventDate(req.requested_start_time)}
                          </span>
                        </p>
                      </div>

                      <div className={`mt-1 border p-3 rounded-xl flex flex-col gap-1 text-[11px] leading-relaxed ${statusCfg.box}`}>
                        <strong className="text-xs uppercase font-bold tracking-wide">
                          {req.status?.description || 'Pendiente'}
                        </strong>
                        <p>{statusCfg.message}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}