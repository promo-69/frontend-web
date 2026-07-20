import React from 'react'

export default function InputSelect({
  id,
  label,
  options = [],
  register,
  error,
  value,
  disabled = false,
}) {
  const isDisabled = disabled || (register && register.disabled)

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-[10px] uppercase font-bold text-yellow-500 ml-1">{label}</label>}
      
      {isDisabled ? (
        <div className="bg-white/5 w-full text-white/70 py-3 px-4 text-sm rounded-xl border border-transparent truncate">
          {options.find(o => String(o.value) === String(value))?.label || value || ' '}
        </div>
      ) : (
        <div className="relative w-full">
          <select
            id={id}
            {...register}
            disabled={isDisabled}
            className={`bg-white/10 w-full text-white outline-none py-3 px-4 text-sm rounded-xl border transition-all appearance-none cursor-pointer
              ${error ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/10 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400'}`}
          >
            <option value="" disabled className="text-black bg-white">Seleccionar</option>
            {options.map((opt, i) => (
              <option key={i} value={opt.value} className="text-black bg-white">{opt.label}</option>
            ))}
          </select>
          {/* Custom chevron to match styling since appearance is none */}
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
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
