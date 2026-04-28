import React from 'react'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'
import { useState } from 'react'

export default function InputPassword({ id, label, register, error, value }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 border-b-2 border-white focus-within:border-[#D9982F] transition-colors py-2">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          {...register}
          placeholder=" "
          className="peer w-full bg-transparent border-none text-white focus:ring-0 focus:outline-none font-montserrat py-1 text-base pr-10"
        />

        <label
          htmlFor={id}
          className={`absolute left-0 text-white transition-all duration-300 pointer-events-none font-montserrat
            peer-focus:-top-5 peer-focus:text-sm peer-focus:text-[#D9982F]
            ${value ? '-top-5 text-sm text-[#D9982F]' : 'top-2 text-base opacity-70'}
          `}
        >
          {label}
        </label>

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-white text-xl opacity-80 hover:opacity-100"
        >
          {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
        </button>
      </div>

      {error && (
        <p className="absolute left-0 -bottom-5 text-red-500 text-sm">
          {error}
        </p>
      )}
    </div>
  )
}
