import React, { useState, useEffect, useContext } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import registerImage from '../../assets/images/register.png'
import logotipo from '../../assets/images/logotype/logoCiineflix.png'
import Button from '../../components/ui/Button'
import { AuthContext } from '../../context/AuthContext'
import useDocumentTitle from '../../hooks/useDocumentTitle';


function VerifyAccount() {
  useDocumentTitle('Verificación de Cuenta');

  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { verifyAccount } = useContext(AuthContext)

  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    const email = searchParams.get('email')
    const token = searchParams.get('token')

    if (!email || !token) {
      setIsLoading(false)
      setMessage('Datos inválidos en el enlace')
      setIsSuccess(false)
      return
    }

    const validateToken = async () => {
      const res = await verifyAccount({ email, token })
      setIsLoading(false)

      if (res.success) {
        setMessage('Cuenta verificada exitosamente')
        setIsSuccess(true)
      } else {
        setMessage(res.message || 'Error al verificar la cuenta')
        setIsSuccess(false)
      }
    }

    validateToken()
  }, [])


  return (
    <div className="bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_50%,#231640_100%)] min-h-screen flex">
      <div className="hidden lg:block lg:w-1/2 lg:h-screen lg:sticky lg:top-0 overflow-hidden">
        <img
          src={registerImage}
          className="w-full h-full object-cover"
          alt="register imagen"
        />
      </div>
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center py-12 px-6 lg:px-0">
        <div className="flex flex-col items-center space-y-6 w-full max-w-md">
          <img
            src={logotipo}
            className="w-48 md:w-60 h-auto cursor-pointer hover:scale-105 transition-transform"
            alt="logotipo"
            onClick={() => navigate('/')}
          />

          <div className="flex flex-col items-center space-y-6">
            {isLoading ? (
              <div className="flex flex-col items-center space-y-4">
                <AiOutlineLoading3Quarters className="animate-spin text-[#D9982F] text-6xl" />
                <p className="text-white text-lg font-montserrat">Validando token...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-6">
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center ${
                    isSuccess ? 'bg-[#D9982F]' : 'bg-red-500'
                  }`}
                >
                  {isSuccess ? (
                    <span className="text-white text-2xl">✓</span>
                  ) : (
                    <span className="text-white text-2xl">✗</span>
                  )}
                </div>
                <p className="text-white text-xl font-montserrat text-center">
                  {message}
                </p>
                <Button
                  text="Ir al login"
                  onClick={() => navigate('/login')}
                  className="text-lg font-montserrat font-semibold"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyAccount
