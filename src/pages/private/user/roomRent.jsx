import React, { useEffect, useState } from 'react'
import { FiCalendar, FiMapPin, FiClock, FiUsers, FiTag, FiBookOpen } from 'react-icons/fi'
import Footer from '../../../components/ui/Footer'
import SuccessModal from '../../../components/ui/SuccessModal'
import cinemaPeopleImg from '../../../assets/images/room-rent.webp' // Importar la imagen adjuntada

// --- Mock Services for dynamic data (Replace with actual services) ---

// Mock data for cinemas
const mockCinemas = [
  { id: 1, name: "Cineflix Sambil" },
  { id: 2, name: "Cineflix Parque Los Aviadores" },
  { id: 3, name: "Cineflix Metropolis" },
  { id: 4, name: "Cineflix Costazul" },
]

// Mock data for rooms per cinema
const mockRoomsByCinema = {
  1: [
    { id: 101, name: "Sala 1", capacity: 200 },
    { id: 102, name: "Sala 2", capacity: 150 },
    { id: 103, name: "Sala 3 VIP", capacity: 80 },
  ],
  2: [
    { id: 201, name: "Sala A", capacity: 250 },
    { id: 202, name: "Sala B", capacity: 180 },
  ],
  3: [
    { id: 301, name: "Sala Única XL", capacity: 300 },
  ],
  4: [
    { id: 401, name: "Sala Mar", capacity: 210 },
    { id: 402, name: "Sala Sol", capacity: 170 },
    { id: 403, name: "Sala Estrella VIP", capacity: 90 },
  ],
}

// Mock data for event types
const mockEventTypes = [
  { id: 1, name: "Corporativo" },
  { id: 2, name: "Cumpleaños" },
  { id: 3, name: "Evento Privado" },
  { id: 4, name: "Lanzamiento de Producto" },
]

// Simulated service calls
const getCinemasService = () => new Promise(resolve => setTimeout(() => resolve(mockCinemas), 500))
const getRoomsByCinemaService = (cinemaId) => new Promise(resolve => setTimeout(() => resolve(mockRoomsByCinema[cinemaId] || []), 500))
const getEventTypesService = () => new Promise(resolve => setTimeout(() => resolve(mockEventTypes), 500))

// --- Main Component ---

export default function RoomRent() {
  const [cinemas, setCinemas] = useState([])
  const [selectedCinemaId, setSelectedCinemaId] = useState('')
  const [rooms, setRooms] = useState([])
  const [eventTypes, setEventTypes] = useState([])
  
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
  const [loadingEventTypes, setLoadingEventTypes] = useState(true)
  
  const [successModalMessage, setSuccessModalMessage] = useState('')

  // Load initial data on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })

    const loadInitialData = async () => {
      try {
        const [cinemasData, eventTypesData] = await Promise.all([getCinemasService(), getEventTypesService()])
        setCinemas(cinemasData)
        setEventTypes(eventTypesData)
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error)
      } finally {
        setLoadingCinemas(false)
        setLoadingEventTypes(false)
      }
    }
    loadInitialData()
  }, [])

  // Load rooms when a cinema is selected
  useEffect(() => {
    if (!selectedCinemaId) {
      setRooms([])
      setFormData(prev => ({ ...prev, room: '' }))
      return
    }

    const loadRooms = async () => {
      setLoadingRooms(true)
      try {
        const roomsData = await getRoomsByCinemaService(selectedCinemaId)
        setRooms(roomsData)
      } catch (error) {
        console.error('Error al cargar salas:', error)
      } finally {
        setLoadingRooms(false)
      }
    }
    loadRooms()
  }, [selectedCinemaId])

  // Handle generic form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Handle cinema selection change separately to trigger room fetching
  const handleCinemaChange = (e) => {
    const cinemaId = e.target.value
    setSelectedCinemaId(cinemaId)
    setFormData(prev => ({ ...prev, room: '' })) // Reset room when cinema changes
  }

  // Handle number conversion for certain fields
  const handleNumberInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value === '' ? '' : parseInt(value, 10) }))
  }

  // Form submission logic
  const handleSubmit = (e) => {
    e.preventDefault()

    // Construction of requested_start_time and requested_end_time in ISO string format
    const { event_date, requested_start_time, requested_end_time } = formData
    if (!event_date || !requested_start_time || !requested_end_time) {
        alert("Por favor, complete la fecha y las horas de inicio y fin.")
        return
    }

    const startISO = new Date(`${event_date}T${requested_start_time}:00Z`).toISOString()
    const endISO = new Date(`${event_date}T${requested_end_time}:00Z`).toISOString()

    // Construct the final data object matching the expected JSON structure
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

    console.log('Datos de alquiler de sala a enviar:', JSON.stringify(submissionData, null, 2))
    
    // Simulate API call and show success modal
    setSuccessModalMessage('¡Solicitud de alquiler enviada correctamente! Un ejecutivo se pondrá en contacto con usted pronto.')
    
    // Reset the form if needed
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

  const commonInputClass = "bg-white/5 w-full text-white outline-none py-3 px-4 text-sm rounded-xl border border-white/10 focus-within:border-yellow-400 focus-within:ring-2 focus-within:ring-yellow-400/20 transition-all disabled:opacity-50"
  const commonIconClass = "w-5 h-5 text-gray-400 mr-3"

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#2A154B] via-[#7B1A82] to-[#231640] text-white justify-between font-['Montserrat'] relative overflow-hidden">
      
      {/* Fondos ambientales sutiles (igual que en Subscriptions) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-5%] w-[40vw] h-[40vw] bg-white/[0.01] rounded-full blur-[140px] pointer-events-none" />

      <section className="px-4 md:px-8 lg:px-16 w-full flex-grow flex flex-col relative z-10 py-16">
        <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col">
          
          {/* SECCIÓN CABECERA */}
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

          {/* Form and Image Section - Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:items-start">
            
            {/* Image Column - Visible on all screens, stacks on small, on right on large */}
            <div className="relative group lg:order-2">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 transform group-hover:scale-[1.02]">
                <img 
                    src={cinemaPeopleImg} 
                    alt="Gente disfrutando en el cine señalando" 
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                 {/* Capa de degradado sutil */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 group-hover:from-black/60 transition-colors" />
              </div>
              <div className="absolute inset-0 z-0 bg-white/5 rounded-3xl blur-[60px] opacity-20 scale-105 pointer-events-none" />
            </div>

            {/* Form Column - order-2 for small, order-1 for large */}
            <form onSubmit={handleSubmit} className="bg-black/10 p-8 rounded-3xl border border-white/10 shadow-xl backdrop-blur-sm lg:order-1 flex flex-col gap-6">
              
                {/* Branch and Room Selection */}
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
                            <option value="">Seleccionar Sucursal</option>
                            {loadingCinemas ? <option>Cargando sucursales...</option> : null}
                            {cinemas.map(cinema => (
                                <option key={cinema.id} value={cinema.id}>{cinema.name}</option>
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
                            <option value="">Seleccionar Sala</option>
                            {loadingRooms ? <option>Cargando salas...</option> : null}
                            {rooms.map(room => (
                                <option key={room.id} value={room.id}>{room.name} (Cap. {room.capacity} p.)</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Event Type and Name */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div className="relative flex items-center col-span-1">
                        <FiTag className={commonIconClass} />
                        <select 
                            name="event_type"
                            value={formData.event_type}
                            onChange={handleNumberInputChange}
                            required
                            disabled={loadingEventTypes}
                            className={commonInputClass}
                        >
                            <option value="">Tipo de Evento</option>
                            {loadingEventTypes ? <option>Cargando tipos...</option> : null}
                            {eventTypes.map(type => (
                                <option key={type.id} value={type.id}>{type.name}</option>
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

                {/* Description */}
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

                {/* Date and Times */}
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
                            step="60" // step in seconds, 60s for minute resolution
                            className={`${commonInputClass} ${formData.requested_start_time ? '' : 'text-gray-400'}`}
                        />
                        <span className="absolute right-12 text-xs text-gray-500 font-bold uppercase tracking-wider">Inicio</span>
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
                        <span className="absolute right-12 text-xs text-gray-500 font-bold uppercase tracking-wider">Fin</span>
                    </div>
                </div>

                {/* Attendees */}
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

                {/* Submit Button */}
                <button 
                  type="submit" 
                  disabled={loadingCinemas || loadingRooms || loadingEventTypes}
                  className="w-full mt-6 bg-gradient-to-r from-yellow-400 to-amber-500 text-[#231640] font-black text-sm px-6 py-4 rounded-xl transition-all transform hover:scale-[1.01] active:scale-95 shadow-md shadow-amber-500/10 tracking-wider uppercase disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Solicitar Alquiler
                </button>
            </form>
          </div>

        </div>
      </section>

      <Footer />

      {/* MODAL DE ÉXITO */}
      {!!successModalMessage && (
        <SuccessModal 
          message={successModalMessage}
          onClose={() => setSuccessModalMessage('')} 
        />
      )}
    </div>
  )
}