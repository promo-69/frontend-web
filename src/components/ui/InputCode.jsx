import React, { useState, useRef, useEffect } from 'react'

function InputCode({ id = 'code', length = 4, error, register, setValue, onChange }) {
  const [code, setCode] = useState(Array(length).fill(''))
  const inputRefs = useRef([])

  const handleChange = (index, value) => {
    if (value !== '' && isNaN(value)) return 
    
    const newCode = [...code]
    newCode[index] = value.substring(value.length - 1)
    setCode(newCode)

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    if (setValue) {
      setValue(id, newCode.join(''), { shouldValidate: true })
    }
    if (onChange) {
      onChange(newCode.join(''))
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length)
    if (!pastedData) return

    const newCode = [...code]
    for (let i = 0; i < length; i++) {
      newCode[i] = pastedData[i] || ''
    }
    setCode(newCode)
    
    const nextIndex = Math.min(pastedData.length, length - 1)
    inputRefs.current[nextIndex]?.focus()

    if (setValue) {
      setValue(id, newCode.join(''), { shouldValidate: true })
    }
    if (onChange) {
      onChange(newCode.join(''))
    }
  }

  return (
    <div className="relative w-full flex flex-col items-center gap-4">
      <div className="flex gap-4">
        {code.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-12 h-14 bg-white/10 border border-white/20 rounded-xl text-center text-2xl text-white font-bold font-montserrat focus:border-[#D9982F] focus:ring-1 focus:ring-[#D9982F] focus:outline-none transition-all"
          />
        ))}
      </div>

      {register && (
        <input
          type="hidden"
          {...register(id, {
            required: 'El código es obligatorio',
            minLength: { value: length, message: 'Código incompleto' },
          })}
        />
      )}

      {error && (
        <p className="absolute -bottom-6 text-red-500 text-[10px] font-montserrat italic text-center w-full">
          {error}
        </p>
      )}
    </div>
  )
}

export default InputCode
