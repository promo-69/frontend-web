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
import InputText from '../ui/InputText'
import FormActions from '../ui/FormActions'
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
      className="flex flex-col items-center justify-center gap-4 w-full"
    >
      <div className="flex flex-col gap-5 w-full">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Cédula */}
          <div className="w-full relative">
            <InputText
              id="idNumber"
              label="Cédula"
              type="text"
              filter="numbers"
              register={register('idNumber', {
                setValueAs: (value) =>
                  typeof value === 'string'
                    ? value.replace(/\D+/g, '').trim()
                    : value,
                validate: (value) => {
                  const prefix = watch('idPrefix') || 'V'
                  const fullId = prefix + (String(value || '').trim())
                  return validateID(fullId) === true || validateID(fullId)
                },
              })}
              error={errors.idNumber?.message}
              value={idNumberValue}
              prefixElement={
                <div className="relative flex items-center">
                  <button
                    type="button"
                    onClick={() => setIsIdOpen(!isIdOpen)}
                    className="text-white flex items-center gap-1 focus:outline-none min-w-[30px] hover:opacity-80 transition-opacity border-r border-white/10 pr-3 mr-1 shrink-0"
                  >
                    <span className="text-sm font-bold">
                      {idPrefix || 'V'}
                    </span>
                    <span className="text-[10px] opacity-70">▼</span>
                  </button>
                </div>
              }
            />
            <input type="hidden" {...register('idPrefix', { setValueAs: (value) => String(value ?? '').trim() })} />
            
            {/* MENU DESPLEGABLE PREFIJO */}
            {isIdOpen && (
              <div className="absolute top-16 left-0 bg-[#231640] border border-[#D9982F] rounded shadow-lg z-50 p-1 flex flex-col min-w-[50px]">
                <button
                  type="button"
                  onClick={() => {
                    setValue('idPrefix', 'V', { shouldValidate: true })
                    setIsIdOpen(false)
                  }}
                  className="p-2 text-white hover:bg-[#7B1A82] transition-colors text-center font-bold"
                >
                  V
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setValue('idPrefix', 'E', { shouldValidate: true })
                    setIsIdOpen(false)
                  }}
                  className="p-2 text-white hover:bg-[#7B1A82] transition-colors text-center font-bold"
                >
                  E
                </button>
              </div>
            )}
          </div>

          {/* Fecha */}
          <div className="flex flex-col gap-1.5 w-full">
            <label
              htmlFor="birthdate"
              className="text-[10px] uppercase font-bold text-yellow-500 ml-1"
            >
              Fecha de nacimiento
            </label>
            <input
              id="birthdate"
              type="date"
              {...register('birthdate', {
                setValueAs: (value) => String(value ?? '').trim(),
                validate: (value) =>
                  validateBirthdate(value) === true || validateBirthdate(value),
              })}
              className={`bg-white/10 w-full text-white outline-none py-3 px-4 text-sm rounded-xl border transition-all ${
                errors.birthdate ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/10 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400'
              }`}
            />
            {errors.birthdate && (
              <p className="text-red-400 text-xs font-medium ml-1 mt-1">{errors.birthdate.message}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Contraseña */}
          <InputPassword
            id="password"
            label="Contraseña"
            register={register('password', {
              setValueAs: (value) => String(value ?? '').trim(),
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
              setValueAs: (value) => String(value ?? '').trim(),
              validate: (value) => {
                const password = String(getValues('password') ?? '').trim()
                const confirm = String(value ?? '').trim()
                if (!confirm) return 'Confirmación requerida'
                if (confirm !== password) return 'No coinciden'
                return true
              },
            })}
            error={errors.confirmPassword?.message}
            value={confirmPasswordValue}
          />
        </div>
      </div>

      <FormActions
        isLoading={isLoading}
        loadingText="Guardando..."
        submitText="Guardar"
      />
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
