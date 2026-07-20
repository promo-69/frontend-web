import React, { useEffect, useState } from 'react'
import { FiCalendar, FiMapPin, FiClock, FiUsers, FiTag, FiBookOpen, FiInfo, FiList } from 'react-icons/fi'
import Footer from '../../../components/ui/Footer'
import SuccessModal from '../../../components/ui/SuccessModal'
import cinemaPeopleImg from '../../../assets/images/room-rent.webp'
// 1. Añadida la importación del nuevo servicio
import { getCinemas, getRoomsByCinema, createRequestRentRoom, getMyRentRequest } from '../../../services/info.service'
import MyRentRequestsModal from '../../../components/ui/MyRentRequest'
import InputText from '../../../components/ui/InputText'
import InputSelect from '../../../components/ui/InputSelect'
import InputTextArea from '../../../components/ui/InputTextArea'
import Button from '../../../components/ui/Button'
import InlineNote from '../../../components/ui/InlineNote'

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
  
  // Estado para controlar el nuevo modal de solicitudes
  const [isRequestsOpen, setIsRequestsOpen] = useState(false)

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
          
          {/* Cabecera adaptada con Flexbox para posicionar el botón a la derecha en pantallas medianas/grandes */}
          <div className="border-l-4 border-yellow-500 pl-4 mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tight">
                Alquiler <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">de Sala</span>
              </h3>
              <p className="text-sm text-gray-300 mt-2 max-w-xl">
                Organiza tus eventos privados con la mejor tecnología cinematográfica. Planifica tu evento perfecto en nuestras instalaciones.
              </p>
            </div>
            
            {/* Botón Consultar Mis Solicitudes */}
            <button
              onClick={() => setIsRequestsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-[#231640] text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-yellow-500/10 active:scale-95"
            >
            <FiList className="w-4 h-4" /> Mis Solicitudes
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-stretch items-start">
            <form 
              onSubmit={handleSubmit} 
              className="bg-[#231640] p-6 md:p-8 lg:p-8 rounded-[2rem] border border-white/10 shadow-2xl lg:order-1 flex flex-col gap-4 lg:gap-3.5 justify-between lg:h-full"
            >
                {/* Campos de formulario idénticos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputSelect
                    id="cinema"
                    label="Sucursal *"
                    value={selectedCinemaId}
                    disabled={submitting}
                    options={[
                      { label: 'Seleccionar...', value: '' },
                      ...cinemas.map(c => ({ label: c.name, value: c.id }))
                    ]}
                    register={{
                      name: "cinema",
                      value: selectedCinemaId,
                      onChange: handleCinemaChange,
                      required: true
                    }}
                  />

                  <InputSelect
                    id="room"
                    label="Sala *"
                    value={formData.room}
                    disabled={!selectedCinemaId || submitting}
                    options={[
                      { label: loadingRooms ? 'Cargando...' : 'Seleccionar...', value: '' },
                      ...rooms.map(r => ({ label: `${r.name} (${r.current_capacity || r.capacity} pers.)`, value: r.id }))
                    ]}
                    register={{
                      name: "room",
                      value: formData.room,
                      onChange: handleNumberInputChange,
                      required: true
                    }}
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <InputSelect
                    id="event_type"
                    label="Categoría *"
                    value={formData.event_type}
                    disabled={submitting}
                    options={[
                      { label: 'Tipo...', value: '' },
                      ...EVENT_TYPES.map(t => ({ label: t.name, value: t.id }))
                    ]}
                    register={{
                      name: "event_type",
                      value: formData.event_type,
                      onChange: handleNumberInputChange,
                      required: true
                    }}
                  />
                  <InputText
                    id="event_name"
                    label="Nombre del Evento *"
                    type="text"
                    value={formData.event_name}
                    disabled={submitting}
                    register={{
                      name: "event_name",
                      value: formData.event_name,
                      onChange: handleInputChange,
                      required: true,
                      placeholder: "Ej: Mi Fiesta VIP"
                    }}
                  />
                </div>

                <InputTextArea
                  id="event_description"
                  label="Descripción y Requerimientos *"
                  value={formData.event_description}
                  disabled={submitting}
                  rows={2}
                  register={{
                    name: "event_description",
                    value: formData.event_description,
                    onChange: handleInputChange,
                    required: true,
                    placeholder: "Detalles obligatorios del evento..."
                  }}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputText
                    id="event_date"
                    label="Fecha *"
                    type="date"
                    value={formData.event_date}
                    disabled={submitting}
                    register={{
                      name: "event_date",
                      value: formData.event_date,
                      onChange: handleInputChange,
                      min: getMinEventDate(),
                      required: true
                    }}
                  />

                  <InputText
                    id="attendees"
                    label="Asistentes *"
                    type="number"
                    value={formData.attendees}
                    disabled={submitting}
                    filter="numbers"
                    register={{
                      name: "attendees",
                      value: formData.attendees,
                      onChange: handleNumberInputChange,
                      min: "1",
                      required: true,
                      placeholder: "0"
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputText
                    id="requested_start_time"
                    label="Hora Inicio *"
                    type="time"
                    value={formData.requested_start_time}
                    disabled={submitting}
                    register={{
                      name: "requested_start_time",
                      value: formData.requested_start_time,
                      onChange: handleInputChange,
                      required: true
                    }}
                  />

                  <InputText
                    id="requested_end_time"
                    label="Hora Fin *"
                    type="time"
                    value={formData.requested_end_time}
                    disabled={submitting}
                    register={{
                      name: "requested_end_time",
                      value: formData.requested_end_time,
                      onChange: handleInputChange,
                      required: true
                    }}
                  />
                </div>

                <InlineNote type="important" title="Nota importante:">
                  <span>Solicitud con un mínimo de <strong>2 semanas (14 días) de anticipación</strong>.</span>
                </InlineNote>

                <Button 
                  type="submit" 
                  disabled={loadingCinemas || loadingRooms || submitting}
                  isLoading={submitting}
                  text={submitting ? 'Enviando solicitud...' : (loadingCinemas ? 'Cargando sucursales...' : 'Solicitar Alquiler')}
                  className="w-full !rounded-xl !py-3.5 !text-xs md:!text-sm"
                />
            </form>

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
      
      {/* 3. Inyección del Drawer Lateral para Consultar Solicitudes */}
      <MyRentRequestsModal 
        isOpen={isRequestsOpen} 
        onClose={() => setIsRequestsOpen(false)} 
        fetchService={getMyRentRequest}
      />
    </div>
  )
}