import React, { useContext } from 'react'
import { useForm } from 'react-hook-form'
import Button from '../../ui/Button'
import { AuthContext } from '../../../context/AuthContext'

function SendCode({ email, onNext }) {
  const { verifyRecoveryCode } = useContext(AuthContext)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onBlur' })

  const onSubmit = async (data) => {
    await verifyRecoveryCode(email, data.code.trim())
    onNext() // avanzar al paso 3
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center justify-center gap-10"
    >
      <div className="flex flex-col gap-12 items-center">
        <h1 className="text-center text-[#D9982F] text-4xl leading-tight font-montserrat font-bold">
          Revisa tu bandeja
        </h1>
        <p className="text-center text-white text-4lg leading-relaxed font-montserrat max-w-md">
          Hemos enviado un código de recuperación a tu correo. Ingresa el código
          para continuar.
        </p>

        <div className="w-80 flex flex-col gap-2">
          <input
            type="text"
            placeholder="Código de verificación"
            {...register('code', {
              required: 'El código es obligatorio',
              minLength: { value: 4, message: 'Código inválido' },
            })}
            className="w-full bg-transparent border-0 border-b-2 border-white text-white placeholder-white focus:outline-none font-montserrat"
          />
          {errors.code && (
            <p className="text-red-500 text-sm">{errors.code.message}</p>
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
            text="Validar"
            type="submit"
            className="text-lg font-montserrat font-semibold"
          />
        </div>
      </div>
    </form>
  )
}

export default SendCode
