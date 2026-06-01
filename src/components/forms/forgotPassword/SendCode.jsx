import React, { useContext, useState } from 'react'
import { useForm } from 'react-hook-form'
import Button from '../../ui/Button'
import { AuthContext } from '../../../context/AuthContext'
import ModalMessage from '../../ui/ModalMessage'

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

      onNext(res.data.data.resetToken) // avanzar al paso 3
    } catch (error) {
      setModalType('error')
      setModalMessage('Error al conectar con el servidor')
      setShowModal(true)
    } finally {
      setIsLoading(false)
    }
  }

  const [code, setCode] = useState(['', '', '', ''])
  const inputRefs = React.useRef([])

  const handleChange = (index, value) => {
    if (isNaN(value)) return 
    const newCode = [...code]
    newCode[index] = value.substring(value.length - 1)
    setCode(newCode)

    if (value && index < 3) {
      inputRefs.current[index + 1].focus()
    }

    setValue('code', newCode.join(''), { shouldValidate: true })
  }

  const handleKeyDown = (index, e) => {
    // Volver atrás con Backspace si está vacío
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1].focus()
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col items-center justify-center gap-10"
    >
      <div className="flex flex-col gap-12 items-center">
        <h1 className="text-center text-[#D9982F] text-4xl leading-tight font-montserrat font-bold">
          Revisa tu bandeja
        </h1>
        <p className="text-center text-white text-4lg leading-relaxed font-montserrat max-w-md">
          Hemos enviado un código de recuperación a tu correo. Ingresa el código
          para continuar.
        </p>

        <div className="relative w-full flex flex-col items-center gap-4">
          <div className="flex gap-4">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 bg-transparent border-2 border-white rounded-lg text-center text-2xl text-white font-bold font-montserrat focus:border-[#D9982F] focus:outline-none transition-colors"
              />
            ))}
          </div>

          {/* Input oculto para que react-hook-form siga funcionando */}
          <input
            type="hidden"
            {...register('code', {
              required: 'El código es obligatorio',
              minLength: { value: 4, message: 'Código incompleto' },
            })}
          />

          {errors.code && (
            <p className="absolute -bottom-6 text-red-500 text-[10px] font-montserrat italic">
              {errors.code.message}
            </p>
          )}
        </div>

        <div className="w-full flex items-center justify-center gap-8 pt-6">
          <Button
            text="Cancelar"
            type="button"
            className="bg-gray-500 text-white"
            onClick={() => window.history.back()}
          />
          <Button
            text={isLoading ? 'Validando...' : 'Validar'}
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

export default SendCode
