import React, { useState, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'
import {
  validateID,
  validateBirthdate,
  validatePassword,
} from '../../validators/authValidators'
import Button from '../ui/Button'
import { RegisterContext } from '../../context/RegisterContext'
import { useNavigate } from 'react-router-dom'

function RegisterForm2() {
  const [showPassword, setShowPassword] = useState(false)
  const { step1Data, registerCustomer } = useContext(RegisterContext)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onSubmit',
    defaultValues: { idPrefix: 'V' },
  })

  const idPrefix = watch('idPrefix')
  const idNumberValue = watch('idNumber')
  const [isIdOpen, setIsIdOpen] = useState(false)

  const passwordValue = watch('password')
  const confirmPasswordValue = watch('confirmPassword')

  const onSubmit = async (values) => {
    const payload = {
      firstName: step1Data.name,
      lastName: step1Data.lastname,
      email: step1Data.email,
      phoneNumber: step1Data.countryCode + step1Data.phone,
      documentNumber: values.idPrefix + values.idNumber,
      birthDate: values.birthdate,
      password: values.password,
      gender: 1,
    }

    const res = await registerCustomer(payload)

    if (!res.success) {
      alert(res.message)
    } else {
      alert('Registro exitoso')
      navigate('/login')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center justify-center gap-4"
    >
      <div className="flex flex-col gap-6 items-center w-80">
        {/* Cédula */}
        <div className="relative w-full">
          <div className="flex items-center gap-2 border-b-2 border-white focus-within:border-[#D9982F] transition-colors py-2">
            {/* MENU SELECTOR DE PREFIJO (V/E) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsIdOpen(!isIdOpen)} // Necesitas crear este estado: const [isIdOpen, setIsIdOpen] = useState(false)
                className="text-white flex items-center gap-1 focus:outline-none min-w-[40px] hover:opacity-80 transition-opacity"
              >
                <span className="text-base font-montserrat font-bold">
                  {idPrefix || 'V'}
                </span>
                <span className="text-[10px] opacity-70">▼</span>
              </button>

              {/* MENU DESPLEGABLE */}
              {isIdOpen && (
                <div className="absolute top-12 left-0 bg-[#231640] border border-[#D9982F] rounded shadow-lg z-50 p-1 flex flex-col min-w-[50px]">
                  <button
                    type="button"
                    onClick={() => {
                      setValue('idPrefix', 'V') // Si usas react-hook-form
                      setIsIdOpen(false)
                    }}
                    className="p-2 text-white hover:bg-[#7B1A82] transition-colors text-center font-bold"
                  >
                    V
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setValue('idPrefix', 'E')
                      setIsIdOpen(false)
                    }}
                    className="p-2 text-white hover:bg-[#7B1A82] transition-colors text-center font-bold"
                  >
                    E
                  </button>
                </div>
              )}
            </div>

            {/* INPUT DE NÚMERO DE CÉDULA */}
            <input
              type="text"
              id="idNumber"
              {...register('idNumber', {
                validate: (value) => {
                  const prefix = watch('idPrefix') || 'V'
                  const fullId = prefix + value
                  return validateID(fullId) === true || validateID(fullId)
                },
              })}
              placeholder=" "
              className="peer w-full bg-transparent border-none text-white focus:ring-0 focus:outline-none font-montserrat py-1 text-base"
            />

            {/* LABEL FLOTANTE */}
            <label
              htmlFor="idNumber"
              className={`absolute transition-all duration-300 pointer-events-none font-montserrat
        peer-focus:-top-6 peer-focus:left-0 peer-focus:text-sm peer-focus:text-[#D9982F]
        ${
          idNumberValue
            ? '-top-6 left-0 text-sm text-[#D9982F]'
            : 'top-3 left-12 text-base text-white opacity-70'
        }`}
            >
              Cédula
            </label>
          </div>
          {errors.idNumber && (
            <p className="absolute left-0 -bottom-5 text-red-500">
              {errors.idNumber.message}
            </p>
          )}
        </div>

        {/* Fecha */}
        <div className="w-full flex flex-col">
          <label
            htmlFor="birthdate"
            className="text-white font-montserrat mb-1"
          >
            Fecha de nacimiento
          </label>
          <input
            id="birthdate"
            type="date"
            {...register('birthdate', {
              validate: (value) =>
                validateBirthdate(value) === true || validateBirthdate(value),
            })}
            className="w-full bg-transparent border-b border-white text-white py-2 focus:outline-none"
          />
          {errors.birthdate && (
            <p className="text-red-500 text-sm">{errors.birthdate.message}</p>
          )}
        </div>

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

      <div className="w-full flex items-center justify-center gap-3 pt-4">
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
    </form>
  )
}

export default RegisterForm2
