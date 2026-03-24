import React, { useState } from 'react'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'

function RegisterForm() {
  const [name, setName] = useState('')
  const [lastname, setLastname] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (name === '' || lastname === '' || email === '' || phone === '') {
      setError('Por favor llena todos los campos')
      return
    }

    //lógica de autenticación (fetch, API, etc.)
    console.log('Iniciando sesión con:', { email })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col items-center justify-center gap-4"
    >
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div className="flex flex-col gap-8 items-center">
        <input
          type="name"
          placeholder="Nombre"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-transparent border-0 border-b-2 border-white text-white placeholder-white focus:outline-none focus:border-white font-montserrat w-80"
        />
        <input
          type="lastname"
          placeholder="Apellido"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          className="bg-transparent border-0 border-b-2 border-white text-white placeholder-white focus:outline-none focus:border-white font-montserrat w-80"
        />
        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-transparent border-0 border-b-2 border-white text-white placeholder-white focus:outline-none focus:border-white font-montserrat w-80"
        />
        <input
          type="phone"
          placeholder="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="bg-transparent border-0 border-b-2 border-white text-white placeholder-white focus:outline-none focus:border-white font-montserrat w-80"
        />

        <div className="relative w-80">
        </div>
      </div>
    </form>
  )
}

export default RegisterForm
