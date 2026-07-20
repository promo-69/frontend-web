import React from 'react'
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

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-[10px] uppercase font-bold text-yellow-500 ml-1">{label}</label>}
      
      <div className={`flex items-stretch w-full rounded-xl border transition-all
        ${isDisabled ? 'border-transparent bg-white/5' : 'border-white/10 bg-white/10 focus-within:border-yellow-400 focus-within:ring-1 focus-within:ring-yellow-400'}
        ${error && !isDisabled ? 'border-red-500/80 focus-within:border-red-500 focus-within:ring-red-500' : ''}
      `}>
        
        {/* Select portion */}
        <div className="relative flex items-center shrink-0 border-r border-white/10">
          {isDisabled ? (
            <div className="py-3 px-3 text-sm text-white/70">
              {options.find(o => o.desc === valueSelect)?.name || valueSelect}
            </div>
          ) : (
            <>
              <select
                value={valueSelect}
                onChange={onChangeSelect}
                disabled={isDisabled}
                className="bg-transparent border-none text-white outline-none cursor-pointer text-sm font-montserrat focus:ring-0 appearance-none py-3 pl-4 pr-8 relative z-10"
              >
                {options.map((opt, i) => (
                  <option key={i} value={opt.desc} className="bg-[#231640]">
                    {opt.name}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 text-white/50 pointer-events-none z-0" />
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
