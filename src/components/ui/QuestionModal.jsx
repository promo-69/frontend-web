import React from 'react'

const QuestionIcon = ({ className }) => (
  <svg 
    className={className} 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth="2.5" 
    stroke="currentColor"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" 
    />
  </svg>
)

const QuestionModal = ({ 
  title = '¿Estás seguro?', 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Continuar', 
  cancelText = 'Cancelar' 
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel} 
    >
      <div
        className="bg-[#231640] p-10 rounded-xl flex flex-col items-center justify-center border border-[#7B1A82] shadow-2xl max-w-sm w-full mx-4 animate-fadeIn"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Ícono de interrogación con color sólido e intenso */}
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-xl bg-amber-500">
          <QuestionIcon className="w-10 h-10 text-[#231640]" />
        </div>

        {/* Título en blanco brillante puro */}
        {title && (
          <h4 className="text-white text-2xl font-black text-center leading-tight mb-3 uppercase tracking-wide">
            {title}
          </h4>
        )}

        <p className="text-white text-base font-semibold text-center leading-relaxed px-2">
          {message}
        </p>

        <div className="flex gap-4 mt-8 w-full">
          
          {/* Cancelar */}
          <button
            type="button"
            onClick={onCancel}
            className="w-1/2 font-bold rounded-full py-2.5 text-[14px] uppercase tracking-wider transition-all bg-white/10 border border-white/20 text-white hover:bg-white/20 active:scale-95 shadow-md"
          >
            {cancelText}
          </button>

          {/* Confirmar */}
          <button
            type="button"
            onClick={onConfirm}
            className="w-1/2 font-bold rounded-full py-2.5 text-[14px] uppercase tracking-wider transition-all bg-amber-500 text-[#231640] hover:brightness-110 active:scale-95 shadow-lg"
          >
            {confirmText}
          </button>

        </div>
      </div>
    </div>
  )
}

export default QuestionModal