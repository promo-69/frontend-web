import React, { useState, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'
import {
  validateEmail,
  validatePassword,
} from '../../validators/authValidators'
import Button from '../ui/Button'
import { AuthContext } from '../../context/AuthContext'

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useContext(AuthContext)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: 'onBlur' })

  const emailValue = watch('email')
  const passwordValue = watch('password')

  const onSubmit = async (data) => {
    const payload = {
      email: data.email.trim(),
      password: data.password,
    }

    const res = await login(payload)

    if (!res.success) {
      alert(res.message)
    } else {
      alert('Login exitoso')
      // Aquí puedes redirigir si quieres:
      // navigate('/dashboard')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center justify-center gap-6"
    >
      <div className="flex flex-col gap-8 items-center">
        {/* EMAIL */}
        <div className="relative w-80">
          <input
            type="email"
            id="email"
            {...register('email', {
              validate: (value) =>
                validateEmail(value) === true || validateEmail(value),
            })}
            placeholder=" "
            className="peer w-full bg-transparent border-0 border-b-2 border-white text-white focus:outline-none focus:border-[#D9982F] font-montserrat py-2 transition-colors pr-10"
          />
          <label
            htmlFor="email"
            className={`absolute left-0 top-2 text-white font-montserrat transition-all duration-300 pointer-events-none
              peer-focus:-top-4 peer-focus:text-sm peer-focus:text-[#D9982F]
              ${emailValue ? '-top-4 text-sm text-[#D9982F]' : 'top-2 text-base opacity-70'}`}
          >
            Correo
          </label>
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* PASSWORD */}
        <div className="relative w-80">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            {...register('password', {
              validate: (value) =>
                validatePassword(value) === true || validatePassword(value),
            })}
            placeholder=" "
            className="peer w-full bg-transparent border-0 border-b-2 border-white text-white focus:outline-none focus:border-[#D9982F] font-montserrat py-2 transition-colors pr-10"
          />
          <label
            htmlFor="password"
            className={`absolute left-0 top-2 text-white font-montserrat transition-all duration-300 pointer-events-none
              peer-focus:-top-4 peer-focus:text-sm peer-focus:text-[#D9982F]
              ${passwordValue ? '-top-4 text-sm text-[#D9982F]' : 'top-2 text-base opacity-70'}`}
          >
            Contraseña
          </label>

          {/* Botón mostrar/ocultar */}
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-0 top-1/4 -translate-y-1/2 text-white text-xl opacity-80 hover:opacity-100"
            aria-label={
              showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
            }
          >
            {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
          </button>

          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* LINK OLVIDASTE CONTRASEÑA */}
        <a
          href="/forgot-password"
          className="text-[#D9982F] text-sm opacity-80 hover:opacity-100"
        >
          ¿Olvidaste tu contraseña?
        </a>

        {/* BOTONES */}
        <div className="w-full flex items-center justify-center gap-3 pt-4">
          <Button
            text="Cancelar"
            type="button"
            className="bg-gray-500 text-white"
            onClick={() => window.history.back()}
          />
          <Button
            text="Iniciar sesión"
            type="submit"
            className="text-lg font-montserrat font-semibold"
          />
        </div>
      </div>
    </form>
  )
}

export default LoginForm
