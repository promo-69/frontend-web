import React from 'react'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'

function Button({ text, onClick, type = 'button', className = '', disabled = false, isLoading = false }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`bg-[#D9982F] text-white px-5 py-2.5 rounded-full 
                  text-sm font-montserrat font-medium
                  hover:opacity-80 transition ${className}
                  ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isLoading && <AiOutlineLoading3Quarters className="animate-spin inline mr-2" />}
      {text}
    </button>
  )
}

export default Button
