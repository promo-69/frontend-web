import React, { useEffect, useState, useCallback } from 'react'
import { FiCalendar, FiMapPin, FiClock, FiUsers, FiTag, FiBookOpen, FiInfo, FiList, FiPlus, FiChevronLeft, FiChevronRight, FiHash } from 'react-icons/fi'
import Footer from '../../../components/ui/Footer'
import PageHeader from '../../../components/ui/PageHeader'
import SuccessModal from '../../../components/ui/SuccessModal'
import cinemaPeopleImg from '../../../assets/images/room-rent.webp'
import { getCinemas, getRoomsByCinema, createRequestRentRoom, getMyRentRequest } from '../../../services/info.service'
import InputText from '../../../components/ui/InputText'
import InputSelect from '../../../components/ui/InputSelect'
import InputTextArea from '../../../components/ui/InputTextArea'
import Button from '../../../components/ui/Button'
import InlineNote from '../../../components/ui/InlineNote'
import useDocumentTitle from '../../../hooks/useDocumentTitle';


const EVENT_TYPES = [
  { id: 1, name: "Corporativo" },
  { id: 2, name: "Cumpleaños" },
  { id: 3, name: "Evento Privado" },
  { id: 4, name: "Lanzamiento de Producto" },
]

export default function RoomRent() {
  useDocumentTitle('Mis Alquileres de Sala');

  const [viewMode, setViewMode] = useState('list') // 'list' | 'form'
  
  // -- ESTADOS DEL FORMULARIO --
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

  // -- ESTADOS DE LA LISTA DE SOLICITUDES --
  const [requests, setRequests] = useState([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  // Utilidades de Formulario
  const getMinEventDate = () => {
    const minDate = new Date()
    minDate.setDate(minDate.getDate() + 14)
    return minDate.toISOString().split('T')[0]
  }

  // Carga inicial de Cines
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

  // Carga de Salas al seleccionar cine
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

  // Carga de Solicitudes (Modo Lista)
  const loadRequests = useCallback(async () => {
    setLoadingRequests(true)
    try {
      const data = await getMyRentRequest()
      setRequests(data || [])
    } catch (error) {
      console.error("❌ Error recuperando mis solicitudes de alquiler:", error)
      setRequests([])
    } finally {
      setLoadingRequests(false)
    }
  }, [])

  useEffect(() => {
    if (viewMode === 'list') {
      loadRequests()
      setCurrentPage(1)
    }
  }, [viewMode, loadRequests])

  // Handlers Formulario
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
      
      // Volver a la lista al terminar
      setTimeout(() => setViewMode('list'), 2000)

    } catch (error) {
      console.error('❌ Error al enviar la solicitud al servidor:', error)
      alert(error?.response?.data?.message || 'Hubo un inconveniente al procesar tu solicitud de alquiler. Por favor, intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  // Utilidades para la Vista de Lista
  const formatEventDate = (dateISO) => {
    if (!dateISO) return ''
    const dateObj = new Date(dateISO)
    return dateObj.toLocaleDateString('es-VE', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true
    }).replace('.', '')
  }

  const getStatusStyles = (statusDesc) => {
    const desc = statusDesc?.toLowerCase() || ''
    
    // Verde (Pagado/Aprobada)
    if (desc.includes('pagado') || desc.includes('aprobada') || desc.includes('completada')) {
      return {
        badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        box: "border-emerald-500/30 bg-emerald-500/5 text-emerald-300/90",
        message: "¡Tu pago ha sido procesado o la solicitud fue aprobada! Nuestro equipo se pondrá en contacto."
      }
    }
    // Rojo (Rechazada/Cancelada)
    if (desc.includes('rechazada') || desc.includes('cancelada') || desc.includes('rechazado')) {
      return {
        badge: "bg-rose-500/10 text-rose-400 border-rose-500/30",
        box: "border-rose-500/40 bg-rose-500/5 text-rose-300/90",
        message: "Esta solicitud no fue aprobada. Puedes intentar con otra fecha o sucursal."
      }
    }
    // Azul (Pendiente de pago)
    if (desc.includes('pago')) {
      return {
        badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        box: "border-blue-500/30 bg-blue-500/5 text-blue-300/90",
        message: "Tu solicitud fue revisada y aprobada. Por favor, procede con el pago para confirmarla."
      }
    }
    // Amarillo por defecto (En revisión)
    return {
      badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      box: "border-amber-500/30 bg-amber-500/5 text-amber-300/90",
      message: "Tu solicitud ha sido recibida y está siendo evaluada. Te notificaremos pronto."
    }
  }

  // Paginación lógica
  const totalPages = Math.ceil(requests.length / itemsPerPage)
  const paginatedRequests = requests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#2A154B] via-[#7B1A82] to-[#231640] text-white font-['Montserrat'] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />
      
      <section className="px-4 md:px-8 lg:px-16 w-full flex-grow relative z-10 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Cabecera Dinámica */}
          <PageHeader
            className="mb-12"
            titlePrefix="Alquiler"
            titleHighlight="de Sala"
            subtitle={viewMode === 'form' 
              ? 'Organiza tus eventos privados con la mejor tecnología cinematográfica. Planifica tu evento perfecto en nuestras instalaciones.'
              : 'Consulta el historial y estado de tus reservas de sala.'}
            rightContent={
              viewMode === 'list' ? (
                <button
                  onClick={() => setViewMode('form')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-[#231640] text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md shadow-yellow-500/10 active:scale-95"
                >
                  <FiPlus className="w-4 h-4" /> Elaborar solicitud
                </button>
              ) : (
                <button
                  onClick={() => setViewMode('list')}
                  className="flex items-center gap-2 px-5 py-2.5 border border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95"
                >
                  <FiList className="w-4 h-4" /> Volver a mis solicitudes
                </button>
              )
            }
          />

          {/* VISTAS */}
          {viewMode === 'list' ? (
            /* ========================================================
               VISTA DE LISTA (PAGINADA EN CUADRÍCULA)
               ======================================================== */
            <div className="flex flex-col gap-6">
              {loadingRequests ? (
                <div className="py-20 flex flex-col justify-center items-center gap-4">
                  <div className="animate-spin inline-block w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full" />
                  <p className="text-sm text-gray-400 tracking-wider uppercase font-bold">Consultando solicitudes...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="py-20 px-4 border border-white/10 bg-[#231640]/50 rounded-[2rem] text-center shadow-xl">
                  <FiBookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
                  <p className="text-gray-400 italic">Aún no has realizado solicitudes de alquiler de sala.</p>
                  <button 
                    onClick={() => setViewMode('form')}
                    className="mt-6 text-yellow-500 hover:text-yellow-400 font-bold underline underline-offset-4"
                  >
                    Crea tu primera solicitud aquí
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedRequests.map((req) => {
                      const statusCfg = getStatusStyles(req.status?.description)
                      
                      return (
                        <div key={req.id} className="bg-[#231640] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-4 hover:border-yellow-500/30 transition-colors">
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                            <h5 className="font-bold text-lg text-white leading-tight break-words w-full sm:w-auto">
                              {req.event_name}
                            </h5>
                            <span className={`w-fit shrink-0 text-[9px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider border ${statusCfg.badge}`}>
                              {req.status?.description || 'Pendiente'}
                            </span>
                          </div>
                          
                          <div className="flex flex-col gap-2 mt-2">
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <FiHash className="text-yellow-500 w-4 h-4 shrink-0" />
                              <span>Referencia: <strong className="text-white">#{req.id}</strong></span>
                            </div>
                            <div className="flex items-start gap-2 text-sm text-gray-300">
                              <FiCalendar className="text-yellow-500 w-4 h-4 mt-0.5 shrink-0" />
                              <span>{formatEventDate(req.requested_start_time)}</span>
                            </div>
                          </div>

                          <div className={`mt-auto pt-3 pb-3 px-4 rounded-xl border text-xs leading-relaxed ${statusCfg.box}`}>
                            {statusCfg.message}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Paginación */}
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button 
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 bg-[#231640] border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
                    >
                      <FiChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-bold text-gray-300">
                      Página {currentPage} de {totalPages || 1}
                    </span>
                    <button 
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="p-2 bg-[#231640] border border-white/10 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 transition-colors"
                    >
                      <FiChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* ========================================================
               VISTA DE FORMULARIO (Diseño Original)
               ======================================================== */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-stretch items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
              <form 
                onSubmit={handleSubmit} 
                className="bg-[#231640] p-6 md:p-8 lg:p-8 rounded-[2rem] border border-white/10 shadow-2xl lg:order-1 flex flex-col gap-4 lg:gap-3.5 justify-between lg:h-full"
              >
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
          )}
        </div>
      </section>

      <Footer />
      {!!successModalMessage && <SuccessModal message={successModalMessage} onClose={() => setSuccessModalMessage('')} />}
    </div>
  )
}