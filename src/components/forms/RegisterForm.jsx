import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import {
  validateName,
  validateEmail,
  validatePhone,
  validateGender,
} from '../../validators/authValidators'
import { cleanNumber } from '../../utils/helpers'
import FormActions from '../ui/FormActions'
import Button from '../ui/Button'
import { useNavigate, useLocation } from 'react-router-dom'
import { resolveAuthRedirect } from '../../utils/authNavigation'
import InputText from '../ui/InputText'

function RegisterForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const fromRoute = resolveAuthRedirect(location.state?.from, '/')

  const phoneRef = useRef(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: 'onSubmit',
    defaultValues: {
      gender: '',
      genderText: '',
    },
  })

  const nameValue = watch('name')
  const lastnameValue = watch('lastname')
  const emailValue = watch('email')
  const phoneValue = watch('phone')
  const genderValue = watch('gender')
  const genderTextValue = watch('genderText')

  const [isGenderOpen, setIsGenderOpen] = useState(false)

  const [countryCode, setCountryCode] = useState('+58')
  const [isOpen, setIsOpen] = useState(false)

  const onSubmit = (values) => {
    navigate('/register2', {
      state: { ...values, countryCode, gender: values.gender, from: fromRoute },
    })
  }

  // 1. EFECTO PARA MANEJAR EL CLICK OUTSIDE (Separado para que sea limpio)
  useEffect(() => {
    function handleClickOutside(e) {
      if (phoneRef.current && !phoneRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  //CARGAR LOS DATOS AL MONTAR EL COMPONENTE
  useEffect(() => {
    const saved = localStorage.getItem('registerFormStep1')
    if (saved) {
      const data = JSON.parse(saved)

      setValue('name', data.name || '')
      setValue('lastname', data.lastname || '')
      setValue('email', data.email || '')
      setValue('phone', data.phone || '')
      setValue('gender', data.gender || '')
      setValue('genderText', data.genderText || '')
      setCountryCode(data.countryCode || '+58')
    }
  }, [setValue]) 

  //GUARDAR EN LOCALSTORAGE CUANDO CAMBIEN LOS VALORES
  useEffect(() => {
    // Evitamos guardar si estan vacios los campos
    if (!nameValue && !lastnameValue && !emailValue && !phoneValue) return

    const formData = {
      name: nameValue,
      lastname: lastnameValue,
      email: emailValue,
      phone: phoneValue,
      gender: genderValue,
      genderText: genderTextValue,
      countryCode,
    }

    localStorage.setItem('registerFormStep1', JSON.stringify(formData))
  }, [
    nameValue,
    lastnameValue,
    emailValue,
    phoneValue,
    countryCode,
    genderValue,
    genderTextValue,
  ])

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center justify-center gap-4 w-full"
    >
      <div className="flex flex-col gap-5 w-full">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Nombre */}
          <InputText
            id="name"
            label="Nombre"
            filter="letters"
            register={register('name', {
              setValueAs: (value) => String(value ?? '').trim(),
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
            filter="letters"
            register={register('lastname', {
              setValueAs: (value) => String(value ?? '').trim(),
              validate: (value) =>
                validateName(value) === true || validateName(value),
            })}
            error={errors.lastname?.message}
            value={lastnameValue}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          {/* Teléfono */}
          <div ref={phoneRef} className="w-full relative">
            <InputText
              id="phone"
              label="Teléfono"
              type="tel"
              filter="numbers"
              register={register('phone', {
                setValueAs: (value) => cleanNumber(String(value ?? '')),
                validate: (value) => validatePhone(String(value ?? '').trim()),
              })}
              error={errors.phone?.message}
              value={phoneValue}
              prefixElement={
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="text-white flex items-center gap-1 focus:outline-none border-r border-white/10 pr-3 mr-1 shrink-0"
                >
                  <span>{countryCode === '+58' ? '🇻🇪' : '🇨🇴'}</span>
                  <span className="text-sm">{countryCode}</span>
                </button>
              }
            />
            {/* MENU DESPLEGABLE */}
            {isOpen && (
              <div className="absolute top-16 left-0 bg-[#231640] border border-[#D9982F] rounded shadow-lg z-50 p-2 flex flex-col gap-2">
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
          </div>

          {/* Género */}
          <div className="flex flex-col gap-1.5 w-full">
            <label htmlFor="gender" className="text-[10px] uppercase font-bold text-yellow-500 ml-1">
              Género
            </label>
            <div className="relative w-full">
              {/*Select personalizado */}
              <button
                type="button"
                onClick={() => setIsGenderOpen(!isGenderOpen)}
                className={`bg-white/10 w-full text-white outline-none py-3 px-4 text-sm rounded-xl border transition-all text-left flex justify-between items-center ${
                  errors.gender ? 'border-red-500/80 focus:border-red-500 focus:ring-1 focus:ring-red-500' : 'border-white/10 focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400'
                }`}
              >
                <span>{genderTextValue || 'Seleccionar'}</span>
                <span className="text-[10px] opacity-70">▼</span>
              </button>

                {/* Campos ocultos para react-hook-form */}
                <input
                  type="hidden"
                  {...register('gender', {
                    setValueAs: (value) => String(value ?? '').trim(),
                    validate: (value) =>
                      validateGender(value) === true || validateGender(value),
                  })}
                />
                <input type="hidden" {...register('genderText')} />

                {/* Menú Desplegable */}
                {isGenderOpen && (
                  <div className="absolute top-full left-0 w-full bg-[#231640] border border-[#D9982F] rounded shadow-2xl z-[100] mt-1 p-1 flex flex-col">
                    <button
                      type="button"
                      onClick={() => {
                        setValue('gender', '1', { shouldValidate: true })
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
                        setValue('gender', '2', { shouldValidate: true })
                        setValue('genderText', 'Femenino')
                        setIsGenderOpen(false)
                      }}
                      className="p-3 text-white hover:bg-[#7B1A82] transition-colors text-left font-medium border-b border-white/10"
                    >
                      Femenino
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setValue('gender', '3', { shouldValidate: true })
                        setValue('genderText', 'Prefiero no decirlo')
                        setIsGenderOpen(false)
                      }}
                      className="p-3 text-white hover:bg-[#7B1A82] transition-colors text-left font-medium"
                    >
                      Prefiero no decirlo
                    </button>
                  </div>
                )}
              </div>
              {errors.gender && (
                <p className="text-red-400 text-xs font-medium ml-1 mt-1">
                  {errors.gender.message}
                </p>
              )}
          </div>
        </div>

        {/* Email */}
        <InputText
          id="email"
          label="Correo"
          type="email"
          register={register('email', {
            setValueAs: (value) => String(value ?? '').trim(),
            validate: (value) =>
              validateEmail(value) === true || validateEmail(value),
          })}
          error={errors.email?.message}
          value={emailValue}
        />
      </div>

      <FormActions
        submitText="Siguiente"
      />
    </form>
  )
}

export default RegisterForm
