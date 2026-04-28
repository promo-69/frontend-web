import React from 'react'
export default function InputText({
  id,
  label,
  type = 'text',
  register,
  error,
  value,
}) {
  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 border-b-2 border-white focus-within:border-[#D9982F] transition-colors py-2">
        <input
          id={id}
          type={type}
          {...register}
          placeholder=" "
          className="peer w-full bg-transparent border-none text-white focus:ring-0 focus:outline-none font-montserrat py-1 text-base"
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
      </div>

      {error && (
        <p className="absolute left-0 -bottom-5 text-red-500 text-sm">
          {error}
        </p>
      )}
    </div>
  )
}
