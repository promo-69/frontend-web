import React, { useEffect, useState } from 'react'
import { FiCalendar, FiMapPin, FiClock, FiUsers, FiTag, FiBookOpen, FiInfo } from 'react-icons/fi'
import Footer from '../../../components/ui/Footer'
import SuccessModal from '../../../components/ui/SuccessModal'
import cinemaPeopleImg from '../../../assets/images/room-rent.webp'
import { getCinemas, getRoomsByCinema, createRequestRentRoom } from '../../../services/info.service'

const EVENT_TYPES = [
  { id: 1, name: "Corporativo" },
  { id: 2, name: "Cumpleaños" },
  { id: 3, name: "Evento Privado" },
  { id: 4, name: "Lanzamiento de Producto" },
]

export default function RoomRent() {
  const [cinemas, setCinemas] = useState([])
  const [selectedCinemaId, setSelectedCinemaId] = useState('')
  const [rooms, setRooms] = useState([])
  
  const [formData, setFormData] = useState({
    room: '',
    event_type: '',
    event_name: '',
    event_description: '',
    event_date: '',
    requested_start_time: '',
    requested_end_time: '',
    attendees: '',
  })

  const [loadingCinemas, setLoadingCinemas] = useState(true)
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [submitting, setSubmitting] = useState(false) 
  const [successModalMessage, setSuccessModalMessage] = useState('')

  const getMinEventDate = () => {
    const minDate = new Date()
    minDate.setDate(minDate.getDate() + 14)
    return minDate.toISOString().split('T')[0]
  }

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    async function loadInitialData() {
      try {
        const response = await getCinemas()
        const dataPayload = response?.data || response || []
        setCinemas(dataPayload)
      } catch (error) {
        console.error('❌ Error al cargar sucursales:', error)
        setCinemas([])
      } finally {
        setLoadingCinemas(false)
      }
    }
    loadInitialData()
  }, [])

  useEffect(() => {
    if (!selectedCinemaId) {
      setRooms([])
      setFormData(prev => ({ ...prev, room: '' }))
      return
    }
    async function loadRooms() {
      setLoadingRooms(true)
      try {
        const response = await getRoomsByCinema(selectedCinemaId)
        const dataPayload = response?.data || response || []
        setRooms(dataPayload)
      } catch (error) {
        setRooms([])
      } finally {
        setLoadingRooms(false)
      }
    }
    loadRooms()
  }, [selectedCinemaId])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCinemaChange = (e) => {
    const cinemaId = e.target.value
    setSelectedCinemaId(cinemaId)
    setFormData(prev => ({ ...prev, room: '' }))
  }

  const handleNumberInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value === '' ? '' : parseInt(value, 10) }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const { room, event_type, event_name, event_description, event_date, requested_start_time, requested_end_time, attendees } = formData

    if (!selectedCinemaId || !room || !event_type || !event_name.trim() || !event_description.trim() || !event_date || !requested_start_time || !requested_end_time || !attendees) {
      alert("Por favor, complete todos los campos del formulario. Todos son obligatorios.")
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedDate = new Date(`${event_date}T00:00:00`)
    
    const timeDiff = selectedDate.getTime() - today.getTime()
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))

    if (daysDiff < 14) {
      alert("Lo sentimos, las reservas de sala deben solicitarse con un mínimo de 2 semanas (14 días) de anticipación.")
      return
    }

    setSubmitting(true)

    try {
      const startISO = new Date(`${event_date}T${requested_start_time}:00Z`).toISOString()
      const endISO = new Date(`${event_date}T${requested_end_time}:00Z`).toISOString()

      const submissionData = { 
        ...formData, 
        requested_start_time: startISO, 
        requested_end_time: endISO 
      }

      await createRequestRentRoom(submissionData)
      setSuccessModalMessage('¡Solicitud enviada con éxito! Te contactaremos pronto.')
      
      setFormData({ room: '', event_type: '', event_name: '', event_description: '', event_date: '', requested_start_time: '', requested_end_time: '', attendees: '' })
      setSelectedCinemaId('')

    } catch (error) {
      console.error('❌ Error al enviar la solicitud al servidor:', error)
      alert(error?.response?.data?.message || 'Hubo un inconveniente al procesar tu solicitud de alquiler. Por favor, intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const commonInputClass = "bg-white/10 w-full text-white outline-none py-3 px-4 text-sm rounded-xl border border-white/10 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all placeholder:text-white/30"
  const dropdownOptionClass = "bg-[#231640] text-white"

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#2A154B] via-[#7B1A82] to-[#231640] text-white font-['Montserrat'] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />
      
      <section className="px-4 md:px-8 lg:px-16 w-full flex-grow relative z-10 py-16">
        <div className="max-w-7xl mx-auto">
          
          <div className="border-l-4 border-yellow-500 pl-4 mb-12">
            <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
              Alquiler <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">de Sala</span>
            </h3>
            <p className="text-sm text-gray-300 mt-2 max-w-xl">
              Organiza tus eventos privados con la mejor tecnología cinematográfica. Planifica tu evento perfecto en nuestras instalaciones.
            </p>
          </div>

          {/* Grid modificado: lg:items-stretch para forzar alturas iguales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-stretch items-start">
            
            {/* Formulario adaptado para aprovechar el espacio exacto sin desbordarse */}
            <form 
              onSubmit={handleSubmit} 
              className="bg-[#231640] p-6 md:p-8 lg:p-8 rounded-[2rem] border border-white/10 shadow-2xl lg:order-1 flex flex-col gap-4 lg:gap-3.5 justify-between lg:h-full"
            >
                {/* Sucursal y Sala */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-yellow-500 ml-1">Sucursal *</label>
                    <div className="relative flex items-center">
                      <FiMapPin className="absolute left-4 text-gray-400" />
                      <select value={selectedCinemaId} onChange={handleCinemaChange} required disabled={submitting} className={`${commonInputClass} pl-11`}>
                        <option value="" className={dropdownOptionClass}>Seleccionar...</option>
                        {cinemas.map(c => <option key={c.id} value={c.id} className={dropdownOptionClass}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-yellow-500 ml-1">Sala *</label>
                    <div className="relative flex items-center">
                      <FiBookOpen className="absolute left-4 text-gray-400" />
                      <select name="room" value={formData.room} onChange={handleNumberInputChange} required disabled={!selectedCinemaId || submitting} className={`${commonInputClass} pl-11`}>
                        <option value="" className={dropdownOptionClass}>{loadingRooms ? 'Cargando...' : 'Seleccionar...'}</option>
                        {rooms.map(r => <option key={r.id} value={r.id} className={dropdownOptionClass}>{r.name} ({r.current_capacity || r.capacity} pers.)</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tipo y Nombre */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5 col-span-1">
                    <label className="text-[10px] uppercase font-bold text-yellow-500 ml-1">Categoría *</label>
                    <select name="event_type" value={formData.event_type} onChange={handleNumberInputChange} required disabled={submitting} className={commonInputClass}>
                      <option value="" className={dropdownOptionClass}>Tipo...</option>
                      {EVENT_TYPES.map(t => <option key={t.id} value={t.id} className={dropdownOptionClass}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5 col-span-2">
                    <label className="text-[10px] uppercase font-bold text-yellow-500 ml-1">Nombre del Evento *</label>
                    <input type="text" name="event_name" value={formData.event_name} onChange={handleInputChange} required disabled={submitting} placeholder="Ej: Mi Fiesta VIP" className={commonInputClass} />
                  </div>
                </div>

                {/* Descripción */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-yellow-500 ml-1">Descripción y Requerimientos *</label>
                  <textarea name="event_description" value={formData.event_description} onChange={handleInputChange} required disabled={submitting} rows="2" placeholder="Detalles obligatorios del evento..." className={`${commonInputClass} resize-none`} />
                </div>

                {/* Fecha y Horas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-yellow-500 ml-1">Fecha *</label>
                    <div className="relative flex items-center">
                      <FiCalendar className="absolute left-4 text-gray-400" />
                      <input 
                        type="date" 
                        name="event_date" 
                        value={formData.event_date} 
                        onChange={handleInputChange} 
                        min={getMinEventDate()}
                        required 
                        disabled={submitting}
                        className={`${commonInputClass} pl-11`} 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-yellow-500 ml-1">Hora Inicio *</label>
                    <div className="relative flex items-center">
                      <FiClock className="absolute left-4 text-gray-400" />
                      <input type="time" name="requested_start_time" value={formData.requested_start_time} onChange={handleInputChange} required disabled={submitting} className={`${commonInputClass} pl-11`} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-yellow-500 ml-1">Hora Fin *</label>
                    <div className="relative flex items-center">
                      <FiClock className="absolute left-4 text-gray-400" />
                      <input type="time" name="requested_end_time" value={formData.requested_end_time} onChange={handleInputChange} required disabled={submitting} className={`${commonInputClass} pl-11`} />
                    </div>
                  </div>
                </div>

                {/* Asistentes */}
                <div className="flex flex-col gap-1.5 md:max-w-[150px]">
                    <label className="text-[10px] uppercase font-bold text-yellow-500 ml-1">Asistentes *</label>
                    <div className="relative flex items-center">
                      <FiUsers className="absolute left-4 text-gray-400" />
                      <input type="number" name="attendees" value={formData.attendees} onChange={handleNumberInputChange} required min="1" disabled={submitting} placeholder="0" className={`${commonInputClass} pl-11`} />
                    </div>
                </div>

                {/* BLOQUE DE NOTA DE ANTICIPACIÓN */}
                <div className="flex items-start gap-3 bg-yellow-500/10 border border-yellow-500/20 p-3.5 rounded-xl text-xs text-amber-400/90 leading-relaxed">
                  <FiInfo className="w-4 h-4 mt-0.5 shrink-0 text-yellow-500" />
                  <p>
                    <strong>Nota importante:</strong> Solicitud con un mínimo de <strong>2 semanas (14 días) de anticipación</strong>.
                  </p>
                </div>

                <button 
                  type="submit" 
                  disabled={loadingCinemas || loadingRooms || submitting}
                  className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-[#231640] font-black py-3.5 rounded-xl hover:scale-[1.01] active:scale-95 transition-all shadow-xl uppercase tracking-widest disabled:opacity-50 text-xs md:text-sm"
                >
                  {submitting ? 'Enviando solicitud...' : (loadingCinemas ? 'Cargando sucursales...' : 'Solicitar Alquiler')}
                </button>
            </form>

            {/* IMAGEN LADO DERECHO - Ahora se expande simétricamente para calzar al 100% con la altura del form */}
            <div className="lg:order-2 lg:h-full flex flex-col">
              <div className="w-full h-full relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl aspect-video lg:aspect-auto lg:grow flex">
                <img src={cinemaPeopleImg} alt="Gente en el cine" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#231640]/80 via-transparent to-transparent" />
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
      {!!successModalMessage && <SuccessModal message={successModalMessage} onClose={() => setSuccessModalMessage('')} />}
    </div>
  )
}