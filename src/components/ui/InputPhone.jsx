import React, { useState, useRef, useEffect } from 'react'
import { FiChevronDown } from 'react-icons/fi'

export default function InputPhone({
  id,
  label,
  valueSelect,
  onChangeSelect,
  options,
  valueText,
  registerText,
  error,
  disabled = false,
}) {
  const isDisabled = disabled || (registerText && registerText.disabled)
  
  const handleBlur = (e) => {
    const val = e.target.value;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      
      e.target.value = '';
      e.target.value = trimmed;

      if (registerText?.onChange) {
        registerText.onChange({
          ...e,
          target: {
            ...e.target,
            value: trimmed,
            name: e.target.name || id
          }
        });
      }
    }
    if (registerText?.onBlur) {
      registerText.onBlur(e);
    }
  }

  const [isSelectOpen, setIsSelectOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsSelectOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectClick = () => {
    if (!isDisabled) setIsSelectOpen(!isSelectOpen)
  }

  const handleSelectOption = (value) => {
    if (onChangeSelect) {
      onChangeSelect({ target: { value } })
    }
    setIsSelectOpen(false)
  }

  const selectedOption = options.find(o => o.desc === valueSelect)

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-[10px] uppercase font-bold text-yellow-500 ml-1">{label}</label>}
      
      <div className={`flex items-stretch w-full rounded-xl border transition-all
        ${isDisabled ? 'border-transparent bg-white/5' : 'border-white/10 bg-white/10 focus-within:border-yellow-400 focus-within:ring-1 focus-within:ring-yellow-400'}
        ${error && !isDisabled ? 'border-red-500/80 focus-within:border-red-500 focus-within:ring-red-500' : ''}
      `}>
        
        {/* Custom Select portion */}
        <div className="relative flex items-center shrink-0 border-r border-white/10" ref={containerRef}>
          {isDisabled ? (
            <div className="py-3 px-3 text-sm text-white/70">
              {selectedOption?.name || valueSelect}
            </div>
          ) : (
            <>
              <div 
                onClick={handleSelectClick}
                className="flex items-center justify-between bg-transparent w-full text-white cursor-pointer select-none py-3 pl-4 pr-3 min-w-[90px]"
              >
                <span className="text-sm font-montserrat">{selectedOption?.desc || valueSelect}</span>
                <FiChevronDown className={`ml-2 text-white/50 transition-transform duration-300 ${isSelectOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {isSelectOpen && (
                <div className="absolute top-full left-0 z-50 min-w-[120px] mt-2 bg-[#231640] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  {options.map((opt, i) => (
                    <div
                      key={i}
                      onClick={() => handleSelectOption(opt.desc)}
                      className={`px-4 py-3 text-sm cursor-pointer transition-colors hover:bg-white/10 ${opt.desc === valueSelect ? 'text-yellow-400 font-bold bg-white/5' : 'text-white/80'}`}
                    >
                      {opt.name}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Text Input portion */}
        <div className="flex-1 flex items-center min-w-0">
          {isDisabled ? (
            <div className="w-full py-3 px-4 text-sm text-white/70 truncate">
              {valueText}
            </div>
          ) : (
            <input
              id={id}
              type="text"
              {...registerText}
              onBlur={handleBlur}
              disabled={isDisabled}
              placeholder=" "
              className="w-full bg-transparent border-none text-white focus:ring-0 focus:outline-none text-sm py-3 px-4 placeholder:text-white/30"
            />
          )}
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-xs font-medium ml-1 mt-1">
          {error}
        </p>
      )}
    </div>
  )
}
