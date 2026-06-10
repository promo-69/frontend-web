import React, { useState } from 'react';

export default function RoomRequest() {
  const [formData, setFormData] = useState({
    eventName: '',
    branch: '',
    room: '',
    date: '',
    time: '',
    details: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Aquí irá la lógica de conexión con tu backend (room.service / reservation.service)
    console.log("Datos de solicitud a enviar (Formato 24h garantizado):", formData);
    
    setTimeout(() => {
      setIsSubmitting(false);
      alert("¡Solicitud enviada con éxito!");
      setFormData({ eventName: '', branch: '', room: '', date: '', time: '', details: '' });
    }, 1500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#231640] text-white justify-between font-['Montserrat']">
      
      {/* Sección principal de Contenido */}
      <section className="bg-[#231640] px-4 md:px-8 lg:px-16 w-full flex-grow flex flex-col py-16">
        <div className="max-w-4xl mx-auto w-full">
          
          {/* Encabezado */}
          <div className="border-l-4 border-[#F6AD38] pl-4 text-left mb-12 flex-shrink-0">
            <h3 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tight text-white leading-none">
              Solicitud de <span className="text-[#F6AD38]">Salas</span>
            </h3>
            <p className="text-xs md:text-sm text-gray-400 mt-2 uppercase tracking-wider font-semibold">
              Reserva nuestros espacios para tus eventos privados, conferencias o proyecciones exclusivas.
            </p>
          </div>

          {/* Formulario */}
          <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Fila 1: Nombre del Evento */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Nombre del Evento
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  required
                  placeholder="Ej. Conferencia Anual de Tecnología"
                  className="w-full bg-[#231640]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#F6AD38] focus:ring-1 focus:ring-[#F6AD38] transition-colors"
                />
              </div>

              {/* Fila 2: Sucursal y Sala */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Sucursal
                  </label>
                  <select
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#231640]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F6AD38] focus:ring-1 focus:ring-[#F6AD38] transition-colors appearance-none"
                  >
                    <option value="" disabled className="text-gray-500">Selecciona una sucursal</option>
                    {/* Aquí mapearás las sucursales reales de tu backend */}
                    <option value="1">Cineflix Centro</option>
                    <option value="2">Cineflix Este</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Sala de Preferencia
                  </label>
                  <select
                    name="room"
                    value={formData.room}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#231640]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F6AD38] focus:ring-1 focus:ring-[#F6AD38] transition-colors appearance-none"
                  >
                    <option value="" disabled>Selecciona una sala</option>
                    <option value="1">Sala 1 (IMAX)</option>
                    <option value="2">Sala 2 (VIP)</option>
                  </select>
                </div>
              </div>

              {/* Fila 3: Día y Hora */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Día del Evento
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#231640]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F6AD38] focus:ring-1 focus:ring-[#F6AD38] transition-colors [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Hora (Formato 24h)
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className="w-full bg-[#231640]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F6AD38] focus:ring-1 focus:ring-[#F6AD38] transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Fila 4: Detalles */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Detalles Adicionales
                </label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Cuéntanos un poco más sobre el evento, requerimientos técnicos, catering, etc."
                  className="w-full bg-[#231640]/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#F6AD38] focus:ring-1 focus:ring-[#F6AD38] transition-colors resize-none"
                ></textarea>
              </div>

              {/* Botón de Enviar */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto md:px-12 py-3.5 bg-white text-[#231640] font-bold text-sm rounded-xl shadow-lg hover:bg-[#F6AD38] transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Procesando...' : 'Enviar Solicitud'}
                </button>
              </div>

            </form>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 border-t border-white/10 text-xs md:text-sm bg-[#231640] flex-shrink-0">
        <p>&copy; 2026 CINEFLIX - Todos los derechos reservados.</p>
      </footer>

    </div>
  );
}