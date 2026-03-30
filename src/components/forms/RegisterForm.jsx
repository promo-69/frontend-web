import React from 'react'
import { useForm } from 'react-hook-form'
import { validateName, validateEmail, validatePhone } from '../../validators/authValidators'
import { cleanNumber } from '../../utils/helpers'
import Button from '../ui/Button'

function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: 'onBlur'
  })

  const onSubmit = (values) => {
    console.log('Registro válido:', values)
    // Lógica de envío (fetch/API)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center justify-center gap-4"
    >
      <div className="flex flex-col gap-6 items-center w-80">
        <div className="w-full">
          <input
            type="text"
            placeholder="Nombre"
            {...register('name', {
              validate: (value) => validateName(value) === true || validateName(value)
            })}
            className="w-full bg-transparent border-0 border-b-2 border-white text-white placeholder-white focus:outline-none focus:border-white font-montserrat"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        <div className="w-full">
          <input
            type="text"
            placeholder="Apellido"
            {...register('lastname', {
              validate: (value) => validateName(value) === true || validateName(value)
            })}
            className="w-full bg-transparent border-0 border-b-2 border-white text-white placeholder-white focus:outline-none focus:border-white font-montserrat"
          />
          {errors.lastname && (
            <p className="text-red-500 text-sm">{errors.lastname.message}</p>
          )}
        </div>

        <div className="w-full">
          <input
            type="email"
            placeholder="Correo"
            {...register('email', {
              validate: (value) => validateEmail(value) === true || validateEmail(value)
            })}
            className="w-full bg-transparent border-0 border-b-2 border-white text-white placeholder-white focus:outline-none focus:border-white font-montserrat"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div className="w-full">
          <input
            type="tel"
            placeholder="Teléfono"
            {...register('phone', {
              validate: (value) => {
                const cleaned = cleanNumber(value)
                const phoneValidation = validatePhone(cleaned)
                if (phoneValidation !== true) return phoneValidation
                if (cleaned.length < 7 || cleaned.length > 15) return 'Teléfono debe tener entre 7 y 15 dígitos'
                return true
              }
            })}
            className="w-full bg-transparent border-0 border-b-2 border-white text-white placeholder-white focus:outline-none focus:border-white font-montserrat"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone.message}</p>
          )}
        </div>
      </div>

      <div className="w-full flex items-center justify-center gap-3 pt-4">
        <Button
          text="Cancelar"
          type="button"
          className="bg-gray-500 text-white"
          onClick={() => window.history.back()}
        />
        <Button
          text="Siguiente"
          type="submit"
          className="text-lg font-montserrat font-semibold"
        />
      </div>
    </form>
  )
}

export default RegisterForm
