import React from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

function Button({ text, onClick, type = 'button', className = '', disabled = false, isLoading = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`bg-[#D9982F] text-[#231640] font-bold rounded-full py-3 px-8 text-[13px] uppercase tracking-wider transition-all hover:bg-[#c28621] hover:scale-[1.02] active:scale-95 shadow-lg border border-transparent
                  ${disabled || isLoading ? 'opacity-60 cursor-not-allowed hover:scale-100' : ''} ${className}`}
    >
      {isLoading && <AiOutlineLoading3Quarters className="animate-spin inline mr-2" />}
      {text}
    </button>
  )
}

export default Button
