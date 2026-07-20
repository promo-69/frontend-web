import React from 'react'

export default function InputText({
  id,
  label,
  type = 'text',
  register,
  error,
  value,
  disabled = false,
  filter = 'none',
  prefixElement = null,
}) {
  const isDisabled = disabled || (register && register.disabled)

  const handleInput = (e) => {
    if (filter === 'none') return;
    
    let val = e.target.value;
    
    if (filter === 'numbers') {
      val = val.replace(/[^0-9]/g, '');
    } else if (filter === 'letters') {
      val = val.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
    } else if (filter === 'alphanumeric') {
      val = val.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '');
    } else if (filter === 'decimals') {
      val = val.replace(/,/g, '.').replace(/[^0-9.]/g, '');
      const dotCount = (val.match(/\./g) || []).length;
      if (dotCount > 1) {
        val = val.replace(/\./g, (match, offset, str) => offset === str.lastIndexOf('.') ? '.' : '');
      }
    }

    if (e.target.value !== val) {
      e.target.value = val;
    }
  }
  const handleBlur = (e) => {
    const val = e.target.value;
    if (typeof val === 'string') {
      const trimmed = val.trim();
      
      // Se fuerza la actualización visual del DOM.
      // En inputs type="email", el navegador elimina los espacios en val nativamente, 
      // pero los mantiene visualmente. Esto fuerza a que la vista se limpie.
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
        <div className="bg-white/5 w-full text-white/70 py-3 px-4 text-sm rounded-xl border border-transparent truncate">
          {value || ' '}
        </div>
      ) : (
        <div className={`flex items-center bg-white/10 w-full text-white text-sm rounded-xl border transition-all focus-within:ring-1 
            ${error ? 'border-red-500/80 focus-within:border-red-500 focus-within:ring-red-500' : 'border-white/10 focus-within:border-yellow-400 focus-within:ring-yellow-400'}`}>
          
          {prefixElement && (
            <div className="pl-4 pr-1">
              {prefixElement}
            </div>
          )}

          <input
            id={id}
            type={type}
            {...register}
            onBlur={handleBlur}
            disabled={isDisabled}
            placeholder=" "
            onInput={handleInput}
            className={`bg-transparent w-full text-white outline-none py-3 placeholder:text-white/30 ${prefixElement ? 'pr-4' : 'px-4'}`}
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
