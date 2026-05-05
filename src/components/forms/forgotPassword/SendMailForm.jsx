import React, { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import Button from '../../ui/Button'
import { AuthContext } from '../../../context/AuthContext'
import { validateEmail } from '../../../validators/authValidators'
import InputText from '../../ui/InputText'
import ModalMessage from '../../ui/ModalMessage'

function SendMailForm({ onNext }) {
  const { sendRecoveryEmail } = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [modalType, setModalType] = useState('error')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: 'onBlur' })

  const emailValue = watch('email')

  {/*const onSubmit = async (data) => {
    await sendRecoveryEmail(data.email.trim())
    onNext(email) // avanzar al paso 2
  }*/}

  const onSubmit = async (data) => {
    const cleanEmail = data.email.trim()
    setIsLoading(true)

    try {
      const res = await sendRecoveryEmail(cleanEmail)
      if (!res.success) {
        setModalType('error')
        setModalMessage(res.message || 'No se pudo enviar el correo de recuperación')
        setShowModal(true)
        return
      }

      // El correo de recuperación se envió correctamente.
      onNext(cleanEmail)
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
      className="flex flex-col items-center justify-center gap-10"
    >
      <div className="flex flex-col gap-12 items-center">
        <h1 className="text-center text-[#D9982F] text-4xl leading-tight font-montserrat font-bold">
          ¿Olvidaste tu contraseña?
        </h1>
        <p className="text-center text-white text-4lg leading-relaxed font-montserrat max-w-md">
          Ingresa tu correo electrónico para enviarte un código de recuperación.
        </p>
        <div className="flex flex-col gap-6 items-center w-80">
          <div className="relative w-full">
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
          </div>
        </div>

        <div className="w-full flex items-center justify-center gap-8 pt-6">
          <Button
            text="Cancelar"
            type="button"
            className="bg-gray-500 text-white"
            onClick={() => window.history.back()}
          />
          <Button
            text={isLoading ? 'Enviando...' : 'Enviar correo'}
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
          onClose={() => setShowModal(false)}
        />
      )}
    </form>
  )
}

export default SendMailForm
