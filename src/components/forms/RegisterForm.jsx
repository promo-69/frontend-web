import React, { useContext, useState } from 'react'
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
import InputText from '../ui/InputText'

function RegisterForm() {
  const { saveStep1 } = useContext(RegisterContext)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ mode: 'onBlur' })

  const nameValue = watch('name')
  const lastnameValue = watch('lastname')
  const emailValue = watch('email')
  const phoneValue = watch('phone')

  const [gender, setGender] = useState('Masculino')
  const [isGenderOpen, setIsGenderOpen] = useState(false)

  const [countryCode, setCountryCode] = useState('+58') 
  const [isOpen, setIsOpen] = useState(false)

  const onSubmit = (values) => {
    saveStep1({ ...values, countryCode, gender })
    navigate('/register2')
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center justify-center gap-4"
    >
      <div className="flex flex-col gap-6 items-center w-80">
        {/* Nombre */}
        <InputText
          id="name"
          label="Nombre"
          register={register('name', {
            validate: (value) =>
              validateName(value) === true || validateName(value),
          })}
          error={errors.name?.message}
          value={nameValue}
        />

        {/* Apellido */}
        <InputText
          id="lastname"
          label="Apellido"
          register={register('lastname', {
            validate: (value) =>
              validateName(value) === true || validateName(value),
          })}
          error={errors.lastname?.message}
          value={lastnameValue}
        />

        {/* Género */}
        <div className="relative w-full">
          <div className="flex flex-col">
            <label htmlFor="gender" className="text-white font-montserrat mb-1">
              Género
            </label>
            <div className="relative">
              {/*Select personalizado */}
              <button
                type="button"
                onClick={() => setIsGenderOpen(!isGenderOpen)}
                className="w-full bg-transparent border-b border-white text-white py-2 text-left flex justify-between items-center focus:outline-none"
              >
                <span>{watch('genderText') || 'Seleccionar'}</span>
                <span className="text-[10px] opacity-70">▼</span>
              </button>

              {/* Menú Desplegable */}
              {isGenderOpen && (
                <div className="absolute top-full left-0 w-full bg-[#231640] border border-[#D9982F] rounded shadow-2xl z-[100] mt-1 p-1 flex flex-col">
                  <button
                    type="button"
                    onClick={() => {
                      setValue('gender', 1)
                      setValue('genderText', 'Masculino')
                      setIsGenderOpen(false)
                    }}
                    className="p-3 text-white hover:bg-[#7B1A82] transition-colors text-left font-medium border-b border-white/10"
                  >
                    Masculino
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setValue('gender', 2)
                      setValue('genderText', 'Femenino')
                      setIsGenderOpen(false)
                    }}
                    className="p-3 text-white hover:bg-[#7B1A82] transition-colors text-left font-medium"
                  >
                    Femenino
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Email */}
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

        {/* Teléfono */}
        <div className="relative w-full">
          <div className="flex items-center gap-2 border-b-2 border-white focus-within:border-[#D9982F] transition-colors py-2">
            {/* MENU SELECTOR */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white flex items-center gap-1 focus:outline-none"
            >
              <span>{countryCode === '+58' ? '🇻🇪' : '🇨🇴'}</span>
              <span className="text-sm">{countryCode}</span>
            </button>

            {/* MENU DESPLEGABLE */}
            {isOpen && (
              <div className="absolute top-12 left-0 bg-[#231640] border border-[#D9982F] rounded shadow-lg z-50 p-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCountryCode('+58')
                    setIsOpen(false)
                  }}
                  className="flex items-center gap-2 text-white hover:text-[#D9982F]"
                >
                  <span>🇻🇪</span> +58
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCountryCode('+57')
                    setIsOpen(false)
                  }}
                  className="flex items-center gap-2 text-white hover:text-[#D9982F]"
                >
                  <span>🇨🇴</span> +57
                </button>
              </div>
            )}

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
              className="peer w-full bg-transparent border-none text-white focus:ring-0 focus:outline-none font-montserrat py-1 text-base"
            />
            <label
              htmlFor="phone"
              className={`absolute left-0 top-0 text-white font-montserrat transition-all duration-300 pointer-events-none
              peer-focus:-top-6 peer-focus:text-sm peer-focus:text-[#D9982F]
              ${phoneValue ? '-top-6 text-sm text-[#D9982F]' : 'top-1 text-base opacity-70'}`}
            >
              Teléfono
            </label>
            {errors.phone && (
              <p className="absolute left-0 -bottom-5 text-red-500">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="w-full flex items-center justify-center gap-3 pt-4">
        <Button
          text="Cancelar"
          type="button"
          className="bg-gray-500 text-white"
          onClick={() => navigate('/')}
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
