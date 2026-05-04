import React, { useState, useContext } from 'react'
import { useForm } from 'react-hook-form'
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai'
import {
  validateEmail,
  validatePassword,
} from '../../validators/authValidators'
import Button from '../ui/Button'
import { AuthContext } from '../../context/AuthContext'
import InputPassword from '../ui/InputPassword'
import InputText from '../ui/InputText'
import ModalMessage from '../ui/ModalMessage'
import { useNavigate } from 'react-router-dom'

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useContext(AuthContext)

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
  const passwordValue = watch('password')

  const onSubmit = async (data) => {
    const payload = {
      email: data.email.trim(),
      password: data.password,
    }

    const res = await login(payload)

    if (!res.success) {
      
      setModalType('error');
      setModalMessage(res.message || 'Usuario no encontrado / Credenciales inválidas');
      setShowModal(true);
      return;
    }

    // ÉXITO
    setModalType('success')
    setModalMessage('Inicio de sesión exitoso')
    setShowModal(true)
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
              validatePassword(value) === true || validatePassword(value),
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
            text="Iniciar sesión"
            type="submit"
            className="text-lg font-montserrat font-semibold"
          />
        </div>
      </div>
      {showModal && (
        <ModalMessage
          type={modalType}
          message={modalMessage}
          onClose={() => {
            setShowModal(false);

            // login exitoso, redirige
            if (modalType === 'success') {
              navigate('/'); 
            }
          }}
        />
      )}
    </form>
  )
}

export default LoginForm
