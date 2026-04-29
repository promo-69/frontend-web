import React, { useContext } from 'react'
import { useForm } from 'react-hook-form'
import Button from '../../ui/Button'
import { AuthContext } from '../../../context/AuthContext'
import { validateEmail } from '../../../validators/authValidators'
import InputText from '../../ui/InputText'

function SendMailForm({ onNext }) {
  const { sendRecoveryEmail } = useContext(AuthContext)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: 'onBlur' })

  const emailValue = watch('email')

  {/*const onSubmit = async (data) => {
    await sendRecoveryEmail(data.email.trim())
    onNext(email) // avanzar al paso 2
  }*/}

  const onSubmit = async (data) => {
    const cleanEmail = data.email.trim()

    await sendRecoveryEmail(cleanEmail)

    // Pasamos el correo al paso 2
    onNext(cleanEmail)
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
        <div className="flex flex-col gap-6 items-center w-80">
          <div className="relative w-full">
            <InputText
                      id="email"
                      label="Correo"
                      type="email"
                      register={register('email', {
                        validate: (value) =>
                          validateEmail(value) === true || validateEmail(value),
                      })}
                      error={errors.email?.message}
                      value={emailValue}
                    />
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
