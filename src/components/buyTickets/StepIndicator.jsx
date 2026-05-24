import { CheckCircle } from 'lucide-react'

const steps = [
  { id: 1, label: 'Película' },
  { id: 2, label: 'Asientos' },
  { id: 3, label: 'Confitería' },
  { id: 4, label: 'Pago' },
]

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {steps.map((step, index) => {
        const isDone = currentStep > step.id
        const isActive = currentStep === step.id
        return (
          <div key={step.id} className="flex items-center">
            {/* Círculo */}
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300
                  ${isDone ? 'bg-[#F6AD38] border-[#F6AD38] text-[#1d1430]' : ''}
                  ${isActive ? 'bg-[#7B1A82] border-[#F6AD38] text-white scale-110 shadow-lg shadow-[#F6AD38]/30' : ''}
                  ${!isDone && !isActive ? 'bg-white/10 border-white/20 text-gray-400' : ''}
                `}
              >
                {isDone ? <CheckCircle className="w-5 h-5" /> : step.id}
              </div>
              <span
                className={`text-[10px] mt-1 font-bold uppercase tracking-wider transition-colors
                  ${isActive ? 'text-[#F6AD38]' : isDone ? 'text-[#F6AD38]/70' : 'text-gray-500'}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Línea conectora */}
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-1 mb-5 transition-all duration-500
                  ${currentStep > step.id ? 'bg-[#F6AD38]' : 'bg-white/15'}
                `}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
