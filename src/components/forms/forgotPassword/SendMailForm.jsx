import React, { useContext } from 'react'
import { useForm } from 'react-hook-form'
import Button from '../../ui/Button'
import { AuthContext } from '../../../context/AuthContext'
import { validateEmail } from '../../../validators/authValidators'

function SendMailForm({ onNext }) {
  const { sendRecoveryEmail } = useContext(AuthContext)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onBlur' })

  const onSubmit = async (data) => {
    await sendRecoveryEmail(data.email.trim())
    onNext(email) // avanzar al paso 2
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center justify-center gap-10"
    >
      <div className="flex flex-col gap-12 items-center">
        <h1 className="text-center text-[#D9982F] text-4xl leading-tight font-montserrat font-bold">
          ¿Olvidaste tu contraseña?
        </h1>
        <p className="text-center text-white text-4lg leading-relaxed font-montserrat max-w-md">
          Ingresa tu correo electrónico para enviarte un código de recuperación.
        </p>

        <div className="w-80 flex flex-col gap-2">
          <input
            type="email"
            placeholder="Correo"
            {...register('email', {
              validate: (value) =>
                validateEmail(value) === true || validateEmail(value),
            })}
            className="w-full bg-transparent border-0 border-b-2 border-white text-white placeholder-white focus:outline-none font-montserrat"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="w-full flex items-center justify-center gap-8 pt-6">
          <Button
            text="Cancelar"
            type="button"
            className="bg-gray-500 text-white"
            onClick={() => window.history.back()}
          />
          <Button
            text="Enviar correo"
            type="submit"
            className="text-lg font-montserrat font-semibold"
          />
        </div>
      </div>
    </form>
  )
}

export default SendMailForm
