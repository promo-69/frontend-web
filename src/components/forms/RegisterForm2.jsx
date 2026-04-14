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
    formState: { errors },
  } = useForm({ mode: 'onSubmit' })

  const onSubmit = async (values) => {
    const payload = {
      firstName: step1Data.name,
      lastName: step1Data.lastname,
      email: step1Data.email,
      phoneNumber: step1Data.phone,
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
        <div className="flex items-center gap-2 w-full">
          <div className="relative">
            <select
              {...register('idPrefix')}
              className="bg-transparent border-b border-white text-white py-2 pl-2 pr-10 focus:outline-none appearance-none"
            >
              <option className="text-black" value="V">
                V
              </option>
              <option className="text-black" value="E">
                E
              </option>
            </select>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/20 border border-white rounded-md p-1 pointer-events-none">
              <span className="text-white text-sm">▼</span>
            </div>
          </div>

          <input
            type="text"
            placeholder="Cédula"
            {...register('idNumber', {
              validate: (value) => {
                const prefix = getValues('idPrefix')
                const fullId = prefix + value
                return validateID(fullId) === true || validateID(fullId)
              },
            })}
            className="flex-1 bg-transparent border-b border-white text-white py-2 focus:outline-none"
          />
        </div>
        {errors.idNumber && (
          <p className="text-red-500 text-sm w-full">
            {errors.idNumber.message}
          </p>
        )}

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
