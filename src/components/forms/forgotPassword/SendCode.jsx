import React, { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import Button from '../../ui/Button'
import { AuthContext } from '../../../context/AuthContext'
import ModalMessage from '../../ui/ModalMessage'
import FormActions from '../../ui/FormActions'
import InputCode from '../../ui/InputCode'

function SendCode({ email, onNext }) {
  const { verifyRecoveryCode } = useContext(AuthContext)
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [modalType, setModalType] = useState('error')

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ mode: 'onBlur' })

  const onSubmit = async (data) => {
    setIsLoading(true)

    try {
      const res = await verifyRecoveryCode(email, data.code.trim())
      if (!res.success) {
        setModalType('error')
        setModalMessage(res.message || 'Código de verificación inválido')
        setShowModal(true)
        return
      }

      onNext(res.data.data?.data?.resetToken) // avanzar al paso 3
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
          Revisa tu bandeja
        </h1>
        <p className="text-center text-white/70 text-sm leading-relaxed font-montserrat max-w-md mx-auto">
          Hemos enviado un código de recuperación a tu correo. Ingresa el código
          para continuar.
        </p>

        <InputCode
          id="code"
          length={4}
          register={register}
          setValue={setValue}
          error={errors.code?.message}
        />

        <FormActions
          isLoading={isLoading}
          loadingText="Validando..."
          submitText="Validar"
        />
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

export default SendCode
