import React from 'react'

export default function InputTextArea({
  id,
  label,
  register,
  error,
  value,
  disabled = false,
  rows = 3,
  placeholder,
}) {
  const isDisabled = disabled || (register && register.disabled)

  const handleBlur = (e) => {
    const val = e.target.value;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      
      e.target.value = '';
      e.target.value = trimmed;

      if (register?.onChange) {
        register.onChange({
          ...e,
          target: {
            ...e.target,
            value: trimmed,
            name: e.target.name || id
          }
        });
      }
    }
    if (register?.onBlur) {
      register.onBlur(e);
    }
  }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label htmlFor={id} className="text-[10px] uppercase font-bold text-yellow-500 ml-1">{label}</label>}
      
      {isDisabled ? (
        <div className={`bg-white/5 w-full text-white/70 py-3 px-4 text-sm rounded-xl border border-transparent whitespace-pre-wrap min-h-[5rem]`}>
          {value || ' '}
        </div>
      ) : (
        <div className={`flex items-start bg-white/10 w-full text-white text-sm rounded-xl border transition-all focus-within:ring-1 
            ${error ? 'border-red-500/80 focus-within:border-red-500 focus-within:ring-red-500' : 'border-white/10 focus-within:border-yellow-400 focus-within:ring-yellow-400'}`}>
          
          <textarea
            id={id}
            {...register}
            onBlur={handleBlur}
            disabled={isDisabled}
            placeholder={placeholder || register?.placeholder || ""}
            rows={rows}
            className="bg-transparent w-full text-white outline-none py-3 px-4 placeholder:text-white/30 resize-none"
          />
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
