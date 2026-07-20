import React, { useState, useContext, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'
import {
  validateEmail,
  validateLoginPassword,
} from '../../validators/authValidators'
import Button from '../ui/Button'
import FormActions from '../ui/FormActions'
import { AuthContext } from '../../context/AuthContext'
import InputPassword from '../ui/InputPassword'
import InputText from '../ui/InputText'
import ModalMessage from '../ui/ModalMessage'
import { useNavigate, useLocation } from 'react-router-dom'
import { resolveAuthRedirect, clearAuthRedirect } from '../../utils/authNavigation'

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useContext(AuthContext)

  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [modalType, setModalType] = useState('error')

  const navigate = useNavigate()
  const location = useLocation()
  const fromRoute = resolveAuthRedirect(location.state?.from, '/')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: 'onBlur' })

  const emailValue = watch('email', '')
  const passwordValue = watch('password', '')

  const submittedEmailRef = useRef('')

  const onSubmit = async (data) => {
    setIsLoading(true)

    submittedEmailRef.current = data.email.trim()

    const payload = {
      email: submittedEmailRef.current,
      password: data.password,
    }

    try {
      const res = await login(payload)

      if (!res) {
        setModalType('error')
        setModalMessage('Hubo un problema de conexión con el servidor.')
        setShowModal(true)
        return
      }

      if (!res.success) {
        const lowerMessage = res.message?.toLowerCase() || ''
        const errorCode = res.code || ''

        // ⭐ DETECCIÓN DE CUENTA NO VERIFICADA
        if (
          errorCode === 'UNVERIFIED_ACCOUNT' ||
          lowerMessage.includes('no verificada')
        ) {
          //setRedirectToVerification(true)
          setModalType('warning')
          setModalMessage(
            'Tu cuenta no ha sido verificada aún. Revisa tu correo ingresa el código',
          )
          setShowModal(true)

          return
        }

        // ⭐ CUENTA BORRADA AUTOMÁTICAMENTE
        if (
          res.status === 404 ||
          lowerMessage.includes('no encontrado') ||
          lowerMessage.includes('registrado')
        ) {
          setModalType('error')
          setModalMessage(
            'Credenciales inválidas. Por favor, regístrate de nuevo.',
          )
          setShowModal(true)
          return
        }

        // ⭐ ERROR GENÉRICO DE LOGIN
        setModalType('error')
        setModalMessage(
          res.message || 'Usuario no encontrado / Credenciales inválidas',
        )
        setShowModal(true)
        return
      }

      // ⭐ LOGIN EXITOSO
      const loggedUser = res.user
      setModalType('success')
      setModalMessage('Inicio de sesión exitoso')
      setShowModal(loggedUser)
    } catch (error) {
      console.error('ERROR LOGIN FORM:', error)
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
      className="flex flex-col w-full gap-6"
    >
      <div className="flex flex-col gap-8 w-full">
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
          className="text-[#D9982F] text-sm opacity-80 hover:opacity-100 text-center w-full"
        >
          ¿Olvidaste tu contraseña?
        </a>

        <FormActions
          isLoading={isLoading}
          loadingText="Iniciando..."
          submitText="Iniciar sesión"
        />
      </div>
      {showModal && (
        <ModalMessage
          type={modalType}
          message={modalMessage}
          onClose={() => {
            const userContextData =
              typeof showModal === 'object' ? showModal : null
            setShowModal(false)

            // Redirecciones basadas en el tipo de respuesta 
            if (modalType === 'warning') {
              navigate('/email-check', {
                state: {
                  email: submittedEmailRef.current,
                  from: fromRoute,
                },
              })
              return
            }

            if (modalType === 'success') {
              clearAuthRedirect()
              navigate(fromRoute, { replace: true })
            }
          }}
        />
      )}
    </form>
  )
}

export default LoginForm
