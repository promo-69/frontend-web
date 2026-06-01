import React, { useState, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'
import {
  validateEmail,
  validateLoginPassword,
} from '../../validators/authValidators'
import Button from '../ui/Button'
import { AuthContext } from '../../context/AuthContext'
import InputPassword from '../ui/InputPassword'
import InputText from '../ui/InputText'
import ModalMessage from '../ui/ModalMessage'
import { useNavigate } from 'react-router-dom'

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login, user } = useContext(AuthContext)

  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [modalType, setModalType] = useState('error')

  //const [loggedUser, setLoggedUser] = useState(null)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: 'onBlur' })

  const emailValue = watch('email')
  const passwordValue = watch('password')

  const onSubmit = async (data) => {
    setIsLoading(true)
    const payload = {
      email: data.email.trim(),
      password: data.password,
    }

    try {
      const res = await login(payload)

      if (!res.success) {
        const lowerMessage = res.message?.toLowerCase() || ''

        //  ESCENARIO 2: Cuenta existe pero "signup_verified_at" es null
        // Detectamos si el mensaje del servidor hace referencia a que no está verificado
        if (
          lowerMessage.includes('verific') ||
          lowerMessage.includes('activar')
        ) {
          setModalType('warning')
          setModalMessage(
            'Tu cuenta no ha sido verificada aún. Redirigiéndote para que ingreses tu código...',
          )
          setShowModal(true)
          return
        }

        // ESCENARIO 3:el registro se borró automáticamente
        if (
          lowerMessage.includes('no encontrado') ||
          lowerMessage.includes('registrado')
        ) {
          setModalType('error')
          setModalMessage(
            'Credenciales invalidas. Por favor, regístrate de nuevo.',
          )
          setShowModal(true)
          return
        }

        // Error por defecto de credenciales/contraseña incorrecta
        setModalType('error')
        setModalMessage(
          res.message || 'Usuario no encontrado / Credenciales inválidas',
        )
        setShowModal(true)
        return
      }

      //ESCENARIO 1: Cuenta existe y está verificada ("signup_verified_at" tiene fecha)
      // ÉXITO
      setModalType('success')
      setModalMessage('Inicio de sesión exitoso')
      setShowModal(true)
    } catch (error) {
      setModalType('error')
      setModalMessage('Error inesperado')
      setShowModal(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center justify-center gap-6"
    >
      <div className="flex flex-col gap-8 items-center">
        {/* EMAIL */}
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

        {/* PASSWORD */}
        <InputPassword
          id="password"
          label="Contraseña"
          register={register('password', {
            validate: (value) =>
              validateLoginPassword(value) === true ||
              validateLoginPassword(value),
          })}
          error={errors.password?.message}
          value={passwordValue}
        />

        {/* LINK OLVIDASTE CONTRASEÑA */}
        <a
          href="/forgot-password"
          className="text-[#D9982F] text-sm opacity-80 hover:opacity-100"
        >
          ¿Olvidaste tu contraseña?
        </a>

        {/* BOTONES */}
        <div className="w-full flex items-center justify-center gap-3 pt-4">
          <Button
            text="Cancelar"
            type="button"
            className="bg-gray-500 text-white"
            onClick={() => window.history.back()}
          />
          <Button
            text={isLoading ? 'Iniciando...' : 'Iniciar sesión'}
            type="submit"
            disabled={isLoading}
            isLoading={isLoading}
            className="text-lg font-montserrat font-semibold"
          />
        </div>
      </div>
      {showModal && (
        <ModalMessage
          type={modalType}
          message={modalMessage}
          onClose={() => {
            setShowModal(false)

            // Redirecciones basadas en el tipo de respuesta que procesamos
            if (modalType === 'success') {
              if (!user?.hasSelectedGenres) {
                navigate('/favorites')
              } else {
                navigate('/')
              }
            } else if (modalType === 'warning') {
              // Si el modal fue de advertencia por falta de verificación, mandamos a EmailCheck
              navigate('/email-check', { state: { email: emailValue.trim() } })
            }
          }}
        />
      )}
    </form>
  )
}

export default LoginForm
