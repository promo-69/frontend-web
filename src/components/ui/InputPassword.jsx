import React from 'react'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'
import { useState } from 'react'

export default function InputPassword({ id, label, register, error, value, disabled = false }) {
  const [showPassword, setShowPassword] = useState(false)
  const isDisabled = disabled || (register && register.disabled)

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-[10px] uppercase font-bold text-yellow-500 ml-1">{label}</label>}
      
      <div className="relative flex items-center w-full">
        {isDisabled ? (
          <div className="bg-white/5 w-full text-white/70 py-3 px-4 text-sm rounded-xl border border-transparent truncate pr-12">
            {value ? '••••••••' : ''}
          </div>
        ) : (
          <input
            id={id}
            type={showPassword ? 'text' : 'password'}
            {...register}
            disabled={isDisabled}
            placeholder=" "
            className={`bg-white/10 w-full text-white outline-none py-3 px-4 pr-12 text-sm rounded-xl border transition-all placeholder:text-white/30
              ${error ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/10 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400'}`}
          />
        )}

        {!isDisabled && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 text-white/50 hover:text-white transition-colors focus:outline-none"
          >
            {showPassword ? <AiFillEyeInvisible size={18} /> : <AiFillEye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-xs font-medium ml-1 mt-1">
          {error}
        </p>
      )}
    </div>
  )
}
