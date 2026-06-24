import React, { useEffect, useState } from 'react'
import { FiCalendar, FiMapPin, FiClock, FiUsers, FiTag, FiBookOpen } from 'react-icons/fi'
import Footer from '../../../components/ui/Footer'
import SuccessModal from '../../../components/ui/SuccessModal'
import cinemaPeopleImg from '../../../assets/images/room-rent.webp'
import { getCinemas, getRoomsByCinema } from '../../../services/info.service'

// Constante local para tipos de eventos (Ya que no posee endpoint en el backend)
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
  const [successModalMessage, setSuccessModalMessage] = useState('')

  // Cargar las sucursales iniciales al montar el componente
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })

    async function loadInitialData() {
      try {
        const response = await getCinemas()
        // Manejo flexible de la estructura de respuesta de la API
        const dataPayload = response?.data || response || []
        setCinemas(dataPayload)
      } catch (error) {
        console.error('❌ Error al cargar listado de sucursales:', error)
        setCinemas([])
      } finally {
        setLoadingCinemas(false)
      }
    }
    loadInitialData()
  }, [])

  // Escuchar el cambio de sucursal para traer sus salas correspondientes
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
        console.error(`❌ Error al cargar salas para el cinemaId ${selectedCinemaId}:`, error)
        setRooms([])
      } finally {
        setLoadingRooms(false)
      }
    }
    loadRooms()
  }, [selectedCinemaId])

  // Manejadores de cambios en inputs genéricos
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Manejador específico para Sucursales (resetea la sala seleccionada previamente)
  const handleCinemaChange = (e) => {
    const cinemaId = e.target.value
    setSelectedCinemaId(cinemaId)
    setFormData(prev => ({ ...prev, room: '' }))
  }

  // Casteo automático a entero para cumplir estrictamente con el payload JSON requerido
  const handleNumberInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value === '' ? '' : parseInt(value, 10) }))
  }

  // Envío del Formulario
  const handleSubmit = (e) => {
    e.preventDefault()

    const { event_date, requested_start_time, requested_end_time } = formData
    if (!event_date || !requested_start_time || !requested_end_time) {
        alert("Por favor, complete todos los campos de fecha y hora.")
        return
    }

    const startISO = new Date(`${event_date}T${requested_start_time}:00Z`).toISOString()
    const endISO = new Date(`${event_date}T${requested_end_time}:00Z`).toISOString()

    // Payload final unificado listo para enviar al backend
    const submissionData = {
        room: formData.room,
        event_type: formData.event_type,
        event_name: formData.event_name,
        event_description: formData.event_description,
        event_date: formData.event_date,
        requested_start_time: startISO,
        requested_end_time: endISO,
        attendees: formData.attendees,
    }

    console.log('🚀 Payload de alquiler estructurado:', JSON.stringify(submissionData, null, 2))
    
    // Aquí puedes invocar tu servicio de guardado / reserva
    setSuccessModalMessage('¡Solicitud de alquiler enviada correctamente! Un ejecutivo se pondrá en contacto con usted pronto.')
    
    // Reset del estado del formulario
    setFormData({
        room: '',
        event_type: '',
        event_name: '',
        event_description: '',
        event_date: '',
        requested_start_time: '',
        requested_end_time: '',
        attendees: '',
    })
    setSelectedCinemaId('')
  }

  // Estilos reutilizables optimizados para Inputs y Selects
  const commonInputClass = "bg-white/5 w-full text-white outline-none py-3 px-4 text-sm rounded-xl border border-white/10 focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400/20 transition-all disabled:opacity-50"
  const commonIconClass = "w-5 h-5 text-gray-400 mr-3"
  
  // Forzar al dropdown nativo a tener fondo oscuro y letras claras
  const dropdownOptionClass = "bg-[#231640] text-white"

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#2A154B] via-[#7B1A82] to-[#231640] text-white justify-between font-['Montserrat'] relative overflow-hidden">
      
      {/* Efectos ambientales de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-5%] w-[40vw] h-[40vw] bg-white/[0.01] rounded-full blur-[140px] pointer-events-none" />

      <section className="px-4 md:px-8 lg:px-16 w-full flex-grow flex flex-col relative z-10 py-16">
        <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col">
          
          {/* CABECERA */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/5 pb-6 mb-10 gap-6">
            <div className="border-l-4 border-yellow-500 pl-4 text-left">
              <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-none">
                Alquiler <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">de Sala</span>
              </h3>
              <p className="text-xs md:text-sm text-gray-400 mt-3 tracking-wide font-medium max-w-xl leading-relaxed">
                Planifica tu evento perfecto en nuestras instalaciones. Completa el formulario para solicitar el alquiler de una sala de cine.
              </p>
            </div>
          </div>

          {/* Grid de Formulario e Imagen Adaptativo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-start">
            
            {/* Columna de Imagen (Lado derecho en pantallas grandes) */}
            <div className="relative group lg:order-2">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 transform group-hover:scale-[1.02]">
                <img 
                    src={cinemaPeopleImg} 
                    alt="Gente disfrutando en el cine" 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 group-hover:from-black/60 transition-colors" />
              </div>
              <div className="absolute inset-0 z-0 bg-white/5 rounded-3xl blur-[60px] opacity-20 scale-105 pointer-events-none" />
            </div>

            {/* Columna de Formulario (Lado izquierdo) */}
            <form onSubmit={handleSubmit} className="bg-black/10 p-6 md:p-8 rounded-3xl border border-white/10 shadow-xl backdrop-blur-sm lg:order-1 flex flex-col gap-6">
              
                {/* Selector de Sucursal y Sala */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative flex items-center">
                        <FiMapPin className={commonIconClass} />
                        <select 
                            value={selectedCinemaId}
                            onChange={handleCinemaChange}
                            required
                            disabled={loadingCinemas}
                            className={commonInputClass}
                        >
                            <option value="" className={dropdownOptionClass}>Seleccionar Sucursal</option>
                            {cinemas.map(cinema => (
                                <option key={cinema.id} value={cinema.id} className={dropdownOptionClass}>
                                  {cinema.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="relative flex items-center">
                        <FiBookOpen className={commonIconClass} />
                        <select 
                            name="room"
                            value={formData.room}
                            onChange={handleNumberInputChange}
                            required
                            disabled={!selectedCinemaId || loadingRooms}
                            className={commonInputClass}
                        >
                            <option value="" className={dropdownOptionClass}>
                              {loadingRooms ? 'Cargando salas...' : 'Seleccionar Sala'}
                            </option>
                            {rooms.map(room => (
                                <option key={room.id} value={room.id} className={dropdownOptionClass}>
                                  {room.name} (Cap. {room.capacity} p.)
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Tipo de Evento y Nombre */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="relative flex items-center col-span-1">
                        <FiTag className={commonIconClass} />
                        <select 
                            name="event_type"
                            value={formData.event_type}
                            onChange={handleNumberInputChange}
                            required
                            className={commonInputClass}
                        >
                            <option value="" className={dropdownOptionClass}>Tipo de Evento</option>
                            {EVENT_TYPES.map(type => (
                                <option key={type.id} value={type.id} className={dropdownOptionClass}>
                                  {type.name}
                                </option>
                            ))}
                        </select>
                    </div>
                     <div className="relative flex items-center col-span-2">
                        <input 
                            type="text" 
                            name="event_name"
                            value={formData.event_name}
                            onChange={handleInputChange}
                            required
                            placeholder="Nombre del Evento (ej: Acto de Grado 2026)"
                            className={commonInputClass}
                        />
                    </div>
                </div>

                {/* Descripción */}
                <div className="relative flex items-start">
                    <FiTag className={`${commonIconClass} mt-3`} />
                    <textarea 
                        name="event_description"
                        value={formData.event_description}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Descripción del Evento y Requerimientos Especiales (ej: Uso de micrófonos requerido)"
                        className={commonInputClass}
                    />
                </div>

                {/* Fechas y Horas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative flex items-center">
                        <FiCalendar className={commonIconClass} />
                        <input 
                            type="date" 
                            name="event_date"
                            value={formData.event_date}
                            onChange={handleInputChange}
                            required
                            className={`${commonInputClass} ${formData.event_date ? '' : 'text-gray-400'}`}
                        />
                    </div>

                    <div className="relative flex items-center">
                        <FiClock className={commonIconClass} />
                        <input 
                            type="time" 
                            name="requested_start_time"
                            value={formData.requested_start_time}
                            onChange={handleInputChange}
                            required
                            step="60"
                            className={`${commonInputClass} ${formData.requested_start_time ? '' : 'text-gray-400'}`}
                        />
                        <span className="absolute right-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider pointer-events-none">Inicio</span>
                    </div>

                    <div className="relative flex items-center">
                        <FiClock className={commonIconClass} />
                        <input 
                            type="time" 
                            name="requested_end_time"
                            value={formData.requested_end_time}
                            onChange={handleInputChange}
                            required
                            step="60"
                            className={`${commonInputClass} ${formData.requested_end_time ? '' : 'text-gray-400'}`}
                        />
                        <span className="absolute right-4 text-[10px] text-gray-400 font-bold uppercase tracking-wider pointer-events-none">Fin</span>
                    </div>
                </div>

                {/* Aforo / Asistentes */}
                <div className="relative flex items-center md:max-w-xs">
                    <FiUsers className={commonIconClass} />
                    <input 
                        type="number" 
                        name="attendees"
                        value={formData.attendees}
                        onChange={handleNumberInputChange}
                        required
                        min="1"
                        placeholder="Asistentes Previstos (ej: 150)"
                        className={commonInputClass}
                    />
                </div>

                {/* Botón de Envío */}
                <button 
                  type="submit" 
                  disabled={loadingCinemas || loadingRooms}
                  className="w-full mt-4 bg-gradient-to-r from-yellow-400 to-amber-500 text-[#231640] font-black text-sm px-6 py-4 rounded-xl transition-all transform hover:scale-[1.01] active:scale-95 shadow-md shadow-amber-500/10 tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingCinemas ? 'Cargando Configuraciones...' : 'Solicitar Alquiler'}
                </button>
            </form>
          </div>

        </div>
      </section>

      <Footer />

      {/* MODAL DE ÉXITO DECLARATIVO */}
      {!!successModalMessage && (
        <SuccessModal 
          message={successModalMessage}
          onClose={() => setSuccessModalMessage('')} 
        />
      )}
    </div>
  )
}