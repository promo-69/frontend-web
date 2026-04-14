import { IconCheck } from './IconosProyect';

const SuccessModal = ({ message, onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose} // Cierra al hacer clic fuera del modal
    >
      <div 
        className="bg-[#231640] p-10 rounded-xl flex flex-col items-center justify-center border border-[#7B1A82] shadow-2xl max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()} // Evita que el clic dentro del modal lo cierre
      >
        {/* Círculo Dorado con Icono */}
        <div className="bg-[#D9982F] w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-lg">
          <IconCheck className="w-12 h-12 text-[#231640]" />
        </div>

        {/* Mensaje */}
        <p className="text-white text-2xl font-bold text-center leading-tight mb-2">
          {message}
        </p>
        
        {/* Botón de Cerrar con el estilo solicitado */}
        <button 
          type="button"
          onClick={onClose}
          className="mt-8 w-full bg-[#D9982F] text-[#231640] font-bold rounded-full py-2 text-[13px] uppercase transition-all active:scale-95 shadow-lg"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;