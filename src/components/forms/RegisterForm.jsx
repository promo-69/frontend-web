import React, { useContext } from 'react'
import { useForm } from 'react-hook-form'
import {
  validateName,
  validateEmail,
  validatePhone,
} from '../../validators/authValidators'
import { cleanNumber } from '../../utils/helpers'
import Button from '../ui/Button'
import { RegisterContext } from '../../context/RegisterContext'
import { useNavigate } from 'react-router-dom'

function RegisterForm() {
  const { saveStep1 } = useContext(RegisterContext)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: 'onBlur' })

  const nameValue = watch('name')
  const lastnameValue = watch('lastname')
  const emailValue = watch('email')
  const phoneValue = watch('phone')

  const onSubmit = (values) => {
    saveStep1(values)
    navigate('/register2')
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center justify-center gap-4"
    >
      <div className="flex flex-col gap-6 items-center w-80">
        {/* Nombre */}
        <div className="relative w-full">
          <input
            type="text"
            id="name"
            {...register('name', {
              validate: (value) =>
                validateName(value) === true || validateName(value),
            })}
            placeholder=" "
            className="peer w-full bg-transparent border-0 border-b-2 border-white text-white focus:outline-none focus:border-[#D9982F] font-montserrat py-2 transition-colors pr-10"
          />
          <label
            htmlFor="name"
            className={`absolute left-0 top-2 text-white font-montserrat transition-all duration-300 pointer-events-none
              peer-focus:-top-4 peer-focus:text-sm peer-focus:text-[#D9982F]
              ${nameValue ? '-top-4 text-sm text-[#D9982F]' : 'top-2 text-base opacity-70'}`}
          >
            Nombre
          </label>
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        {/* Apellido */}
        <div className="relative w-full">
          <input
            type="text"
            id="lastname"
            {...register('lastname', {
              validate: (value) =>
                validateName(value) === true || validateName(value),
            })}
            placeholder=" "
            className="peer w-full bg-transparent border-0 border-b-2 border-white text-white focus:outline-none focus:border-[#D9982F] font-montserrat py-2 transition-colors pr-10"
          />
          <label
            htmlFor="lastname"
            className={`absolute left-0 top-2 text-white font-montserrat transition-all duration-300 pointer-events-none
              peer-focus:-top-4 peer-focus:text-sm peer-focus:text-[#D9982F]
              ${lastnameValue ? '-top-4 text-sm text-[#D9982F]' : 'top-2 text-base opacity-70'}`}
          >
            Apellido
          </label>
          {errors.lastname && (
            <p className="text-red-500 text-sm">{errors.lastname.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="relative w-full">
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

        {/* Teléfono */}
        <div className="relative w-full">
          <input
            type="tel"
            id="phone"
            {...register('phone', {
              validate: (value) => {
                const cleaned = cleanNumber(value)
                const phoneValidation = validatePhone(cleaned)
                if (phoneValidation !== true) return phoneValidation
                if (cleaned.length < 7 || cleaned.length > 15)
                  return 'Teléfono debe tener entre 7 y 15 dígitos'
                return true
              },
            })}
            placeholder=" "
            className="peer w-full bg-transparent border-0 border-b-2 border-white text-white focus:outline-none focus:border-[#D9982F] font-montserrat py-2 transition-colors pr-10"
          />
          <label
            htmlFor="phone"
            className={`absolute left-0 top-2 text-white font-montserrat transition-all duration-300 pointer-events-none
              peer-focus:-top-4 peer-focus:text-sm peer-focus:text-[#D9982F]
              ${phoneValue ? '-top-4 text-sm text-[#D9982F]' : 'top-2 text-base opacity-70'}`}
          >
            Teléfono
          </label>
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
