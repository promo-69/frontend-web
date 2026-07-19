import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  validateID,
  validateBirthdate,
  validatePassword,
} from '../../validators/authValidators'
import Button from '../ui/Button'
import { useNavigate, useLocation } from 'react-router-dom'
import ModalMessage from '../ui/ModalMessage'
import InputPassword from '../ui/InputPassword'
import { resolveAuthRedirect, saveAuthRedirect } from '../../utils/authNavigation'

import { registerRequest } from '../../services/auth.service'

function RegisterForm2() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const step1Data = location.state || {}
  const fromRoute = resolveAuthRedirect(step1Data.from || location.state?.from, '/')

  useEffect(() => {
    if (fromRoute) {
      saveAuthRedirect(fromRoute)
    }
  }, [fromRoute])

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

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [modalType, setModalType] = useState('success')

  const onSubmit = async (values) => {
    setIsLoading(true)
    const cleanedIdNumber = values.idNumber
      ? values.idNumber.replace(/\s+/g, '').trim()
      : ''

    const payload = {
      firstName: step1Data?.name,
      lastName: step1Data?.lastname,
      email: step1Data?.email,
      phoneNumber: step1Data?.countryCode + step1Data?.phone,
      documentNumber: values.idPrefix + cleanedIdNumber,
      birthDate: values.birthdate,
      password: values.password,
      gender: step1Data?.gender ? Number(step1Data.gender) : null,
    }

    try {
      const res = await registerRequest(payload)

      // Se evalúa la respuesta según la estructura de Axios
      if (!res || res.success === false) {
        setModalType('error')
        setModalMessage(res?.message || 'Error al registrar')
        setShowSuccessModal(true)
      } else {
        setModalType('success')
        setModalMessage('¡Registro exitoso!')
        setShowSuccessModal(true)
        sessionStorage.setItem('pending_email', step1Data?.email || '')
        sessionStorage.setItem('pending_password', values.password || '')
        sessionStorage.setItem('pending_from', fromRoute)
      }
    } catch (error) {
      console.error('Error capturado en la petición de registro:', error)

      setModalType('error')
      
      setModalMessage(error.response?.data?.message || 'Error inesperado')
      setShowSuccessModal(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
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
                onClick={() => setIsIdOpen(!isIdOpen)}
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
                      setValue('idPrefix', 'V')
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
            <input type="hidden" {...register('idPrefix')} />
            <input
              type="text"
              id="idNumber"
              inputMode="numeric"
              pattern="[0-9]*"
              {...register('idNumber', {
                setValueAs: (value) =>
                  typeof value === 'string'
                    ? value.replace(/\s+/g, '').trim()
                    : value,
                validate: (value) => {
                  const prefix = watch('idPrefix') || 'V'
                  const fullId = prefix + (value || '')
                  return validateID(fullId) === true || validateID(fullId)
                },
              })}
              placeholder=" "
              className="peer w-full bg-transparent border-none text-white focus:ring-0 focus:outline-none font-montserrat py-1 text-base"
            />

            {/* LABEL FLOTANTE (Corregido el auto-cierre) */}
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
        <InputPassword
          id="password"
          label="Contraseña"
          register={register('password', {
            validate: (value) =>
              validatePassword(value) === true || validatePassword(value),
          })}
          error={errors.password?.message}
          value={passwordValue}
        />
        {/* Confirmar Contraseña */}
        <InputPassword
          id="confirmPassword"
          label="Confirmar contraseña"
          register={register('confirmPassword', {
            validate: (value) => {
              const password = getValues('password')
              if (!value) return 'Confirmación requerida'
              if (value !== password) return 'No coinciden'
              return true
            },
          })}
          error={errors.confirmPassword?.message}
          value={confirmPasswordValue}
        />
      </div>

      <div className="w-full flex items-center justify-center gap-3 pt-4">
        <Button
          text="Cancelar"
          type="button"
          className="bg-gray-500 text-white"
          onClick={() => window.history.back()}
        />
        <Button
          text={isLoading ? 'Guardando...' : 'Guardar'}
          type="submit"
          disabled={isLoading}
          isLoading={isLoading}
          className="text-lg font-montserrat font-semibold"
        />
      </div>
      {showSuccessModal && (
        <ModalMessage
          type={modalType}
          message={modalMessage}
          onClose={() => {
            setShowSuccessModal(false)

            // Si guardó los datos redirige a la página de verificación de email
            if (modalType === 'success') {
              localStorage.removeItem('registerFormStep1')
              navigate('/email-check', {
                state: { email: step1Data?.email, from: fromRoute },
              })
            }
          }}
        />
      )}
    </form>
  )
}

export default RegisterForm2
