import React, { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import Button from '../../ui/Button'
import { AuthContext } from '../../../context/AuthContext'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'
import { validatePassword } from '../../../validators/authValidators'

function NewPasswordForm({ email, code }) {
  const { resetPassword } = useContext(AuthContext)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors },
  } = useForm({ mode: 'onBlur' })

  const passwordValue = watch('password')
  const confirmPasswordValue = watch('confirmPassword')

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
                    <div className="flex items-center gap-2 border-b-2 border-white focus-within:border-[#D9982F] transition-colors py-2">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        {...register('password', {
                          validate: (value) =>
                            validatePassword(value) === true || validatePassword(value),
                        })}
                        placeholder=" "
                        className="peer w-full bg-transparent border-none text-white focus:ring-0 focus:outline-none font-montserrat py-1 text-base pr-10"
                      />
                      <label
                        htmlFor="password"
                        className={`absolute left-0 text-white transition-all duration-300 pointer-events-none font-montserrat
                  peer-focus:-top-5 peer-focus:text-sm peer-focus:text-[#D9982F]
                  ${passwordValue ? '-top-5 text-sm text-[#D9982F]' : 'top-2 text-base opacity-70'}`}
                      >
                        Contraseña
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-white text-xl opacity-80 hover:opacity-100"
                      >
                        {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="absolute left-0 -bottom-5 text-red-500">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
          
                  {/* Confirmación */}
                  <div className="relative w-full mt-2">
                    <div className="flex items-center gap-2 border-b-2 border-white focus-within:border-[#D9982F] transition-colors py-2">
                      <input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        {...register('confirmPassword', {
                          validate: (value) => {
                            const password = getValues('password')
                            if (!value) return 'Confirmación requerida'
                            if (value !== password) return 'No coinciden'
                            return true
                          },
                        })}
                        placeholder=" "
                        className="peer w-full bg-transparent border-none text-white focus:ring-0 focus:outline-none font-montserrat py-1 text-base pr-10"
                      />
                      <label
                        htmlFor="confirmPassword"
                        className={`absolute left-0 text-white transition-all duration-300 pointer-events-none font-montserrat
                  peer-focus:-top-5 peer-focus:text-sm peer-focus:text-[#D9982F]
                  ${confirmPasswordValue ? '-top-5 text-sm text-[#D9982F]' : 'top-2 text-base opacity-70'}`}
                      >
                        Confirmar contraseña
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-white text-xl opacity-80 hover:opacity-100"
                      >
                        {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="absolute left-0 -bottom-5 text-red-500">
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
