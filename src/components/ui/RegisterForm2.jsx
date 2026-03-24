import React, { useState } from 'react'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'

function RegisterForm2() {
    const [id, setId] = useState('')
    const [birthdate, setBirthdate] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (id === '' || birthdate === '' || password === '' || confirmPassword === '') {
      setError('Por favor llena todos los campos')
      return
    }
    
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center gap-4"
    >
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="flex flex-col gap-8 items-center">
        <div className="flex items-center gap-2 w-80">
            <div className="relative">
              <select className="bg-transparent border-b border-white text-white py-2 pl-2 pr-10 focus:outline-none appearance-none">
                <option className="text-black">V</option>
                <option className="text-black">E</option>
              </select>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/20 border border-white rounded-md p-1 pointer-events-none">
                <span className="text-white text-sm">▼</span>
              </div>
            </div>
          <input
            type="text"
            placeholder="Cédula"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="flex-1 bg-transparent border-b border-white text-white py-2 focus:outline-none"
          />
        </div>
        <div className="w-80 flex flex-col">
          <label className=" text-white font-montserrat mb-1">
            Fecha de nacimiento
          </label>
          <input
            type="date"
            placeholder="Fecha de nacimiento"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            className="w-full bg-transparent border-b border-white text-white [color-scheme:dark] py-2 focus:outline-none"
          />
        </div>
        <div className="relative w-80">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border-0 border-b-2 border-white text-white placeholder-white focus:outline-none focus:border-white font-montserrat pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-white text-xl opacity-80 hover:opacity-100"
            aria-label={
              showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
          >
            {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
          </button>
        </div>
        <div className="relative w-80">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-transparent border-0 border-b-2 border-white text-white placeholder-white focus:outline-none focus:border-white font-montserrat pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-white text-xl opacity-80 hover:opacity-100"
            aria-label={
              showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
          >
            {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
          </button>
        </div>
      </div>
    </form>
  )
}

export default RegisterForm2
