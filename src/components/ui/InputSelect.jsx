import React, { useState, useRef, useEffect } from 'react'
import { FiChevronDown } from 'react-icons/fi'

export default function InputSelect({
  id,
  label,
  options = [],
  register,
  error,
  value,
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)
  
  const isDisabled = disabled || (register && register.disabled)
  
  const currentValue = value !== undefined ? value : register?.value
  const selectedOption = options.find(o => String(o.value) === String(currentValue))
  const displayLabel = selectedOption ? selectedOption.label : 'Seleccionar'

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (optionValue) => {
    if (isDisabled) return
    
    if (register?.onChange) {
      register.onChange({
        target: {
          name: register.name || id,
          value: optionValue
        }
      })
    }
    setIsOpen(false)
  }

  return (
    <div className="flex flex-col gap-1.5 w-full" ref={containerRef}>
      {label && <label className="text-[10px] uppercase font-bold text-yellow-500 ml-1">{label}</label>}
      
      {isDisabled ? (
        <div className="bg-white/5 w-full text-white/70 py-3 px-4 text-sm rounded-xl border border-transparent truncate">
          {displayLabel}
        </div>
      ) : (
        <div className="relative w-full">
          <input type="hidden" id={id} {...register} value={currentValue || ''} />
          
          <div 
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center justify-between bg-white/10 w-full text-white outline-none py-3 px-4 text-sm rounded-xl border transition-all cursor-pointer select-none
              ${error ? 'border-red-500/80 ring-1 ring-red-500' : (isOpen ? 'border-yellow-400 ring-1 ring-yellow-400' : 'border-white/10 hover:border-white/30')}`}
          >
            <span className={!selectedOption ? 'text-white/30' : ''}>{displayLabel}</span>
            <FiChevronDown className={`text-white/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
          
          {isOpen && (
            <div className="absolute z-50 w-full mt-2 bg-[#231640] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {options.map((opt, i) => (
                <div
                  key={i}
                  onClick={() => handleSelect(opt.value)}
                  className={`px-4 py-3 text-sm cursor-pointer transition-colors hover:bg-white/10 ${String(opt.value) === String(currentValue) ? 'text-yellow-400 font-bold bg-white/5' : 'text-white/80'}`}
                >
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-400 text-xs font-medium ml-1 mt-1">
          {error}
        </p>
      )}
    </div>
  )
}
