import React, { useState } from 'react'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (email === '' || password === '') {
      setError('Por favor llena todos los campos')
      return
    }

    //lógica de autenticación (fetch, API, etc.)
    console.log('Iniciando sesión con:', { email, password })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center gap-6"
    >
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="flex flex-col gap-10 items-center">
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-transparent border-0 border-b-2 border-white text-white placeholder-white focus:outline-none focus:border-white font-montserrat w-80"
        />

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
        <a href="/forgot-password" className="text-[#D9982F] text-sm opacity-80 hover:opacity-100">
          ¿Olvidaste tu contraseña?
        </a>
      </div>
    </form>
  )
}

export default LoginForm
