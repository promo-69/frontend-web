import React, { useContext } from 'react'
import { useForm } from 'react-hook-form'
import Button from '../../ui/Button'
import { AuthContext } from '../../../context/AuthContext'

function SendMailForm() {
  const { sendRecoveryEmail } = useContext(AuthContext) 

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onBlur' })

  const onSubmit = async (data) => {
    const payload = {
      email: data.email.trim(),
    }

    console.log('Enviando correo de recuperación:', payload)

    // Llamada al backend
    await sendRecoveryEmail(payload.email)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center justify-center gap-6"
    >
      <div className="flex flex-col gap-8 items-center">
        {/* EMAIL */}
        <div className="w-80">
          <input
            type="email"
            placeholder="Correo"
            {...register('email', {
              validate: (value) =>
                validateEmail(value) === true || validateEmail(value),
            })}
            className="w-full bg-transparent border-0 border-b-2 border-white text-white placeholder-white focus:outline-none focus:border-white font-montserrat"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* BOTONES */}
        <div className="w-full flex items-center justify-center gap-3 pt-4">
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
