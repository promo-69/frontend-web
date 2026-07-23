import React, { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import Button from '../../ui/Button'
import { AuthContext } from '../../../context/AuthContext'
import { validatePassword } from '../../../validators/authValidators'
import ModalMessage from '../../ui/ModalMessage'
import InputPassword from '../../ui/InputPassword'
import FormActions from '../../ui/FormActions'

function NewPasswordForm({ email, resetToken }) {
  const navigate = useNavigate()
  const { resetPassword, login } = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [modalType, setModalType] = useState('success')

  const {
    register,
    handleSubmit,
    getValues,
    watch,
    formState: { errors },
  } = useForm({ mode: 'onBlur' })

  const passwordValue = watch('password')
  const confirmPasswordValue = watch('confirmPassword')

  const onSubmit = async (data) => {
    setIsLoading(true)
    const newPassword = data.password.trim()

    try {
      const res = await resetPassword({ email, newPassword, resetToken })

      if (!res.success) {
        setModalType('error')
        setModalMessage(res.message || 'No se pudo cambiar la contraseña')
        setShowModal(true)
        return
      }

      setModalType('success')
      setModalMessage('Contraseña actualizada. Iniciando sesión...')
      setShowModal(true)
      
      // Intentar iniciar sesión automáticamente
      try {
        const loginRes = await login({ email, password: newPassword })
        if (loginRes?.success) {
          // Redirigir al home automáticamente después de 1.5s
          setTimeout(() => {
            navigate('/', { replace: true })
          }, 1500)
          return
        }
      } catch (loginError) {
        console.error('Error en auto-login:', loginError)
      }

    } catch (error) {
      setModalType('error')
      setModalMessage('Error al conectar con el servidor')
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
        <h1 className="text-center text-[#D9982F] text-4xl leading-tight font-montserrat font-bold">
          Cambia tu contraseña
        </h1>
        <p className="text-center text-white/70 text-sm leading-relaxed font-montserrat max-w-md mx-auto">
          Identidad confirmada. Crea tu nueva contraseña.
        </p>

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

        <FormActions
          isLoading={isLoading}
          loadingText="Guardando..."
          submitText="Guardar"
        />
      </div>
      {showModal && (
        <ModalMessage
          type={modalType}
          message={modalMessage}
          onClose={() => {
            setShowModal(false)
            if (modalType === 'success') {
              navigate('/', { replace: true })
            }
          }}
        />
      )}
    </form>
  )
}

export default NewPasswordForm
