import React, { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import Button from '../../ui/Button'
import { AuthContext } from '../../../context/AuthContext'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'
import { validatePassword } from '../../../validators/authValidators'

function NewPasswordForm({ email }) {
  const { resetPassword } = useContext(AuthContext)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ mode: 'onBlur' })

  const onSubmit = async (data) => {
    await resetPassword({ email, newPassword: data.password.trim(), code })
    alert('Contraseña actualizada exitosamente')
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center justify-center gap-10"
    >
      <div className="flex flex-col gap-12 items-center">
        <h1 className="text-center text-[#D9982F] text-4xl leading-tight font-montserrat font-bold">
          Cambia tu contraseña
        </h1>
        <p className="text-center text-white text-4lg leading-relaxed font-montserrat max-w-md">
          Identidad confirmada. Crea tu nueva contraseña.
        </p>

        <div className="w-80 flex flex-col gap-6">
          {/* Contraseña */}
          <div className="relative w-full">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              {...register('password', {
                validate: (value) =>
                  validatePassword(value) === true || validatePassword(value),
              })}
              className="w-full bg-transparent border-0 border-b-2 border-white text-white placeholder-white focus:outline-none pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-0 top-1/3 -translate-y-1/2 text-white text-xl opacity-80 hover:opacity-100"
            >
              {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>

          {/* Confirmación */}
          <div className="relative w-full">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirmar contraseña"
              {...register('confirmPassword', {
                validate: (value) => {
                  const password = getValues('password')
                  if (!value) return 'Confirmación requerida'
                  if (value !== password) return 'Las contraseñas no coinciden'
                  return true
                },
              })}
              className="w-full bg-transparent border-0 border-b-2 border-white text-white placeholder-white focus:outline-none pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-0 top-1/3 -translate-y-1/2 text-white text-xl opacity-80 hover:opacity-100"
            >
              {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
            </button>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <div className="w-full flex items-center justify-center gap-8 pt-6">
          <Button
            text="Cancelar"
            type="button"
            className="bg-gray-500 text-white"
            onClick={() => window.history.back()}
          />
          <Button
            text="Guardar"
            type="submit"
            className="text-lg font-montserrat font-semibold"
          />
        </div>
      </div>
    </form>
  )
}

export default NewPasswordForm
