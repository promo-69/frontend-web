import registerImage from '../../assets/images/register.png'
import logotipo from '../../assets/images/logotype/logoCiineflix.png'
import { useNavigate, useLocation } from 'react-router-dom'
import Button from '../../components/ui/Button'
import InputCode from '../../components/ui/InputCode'
import FormActions from '../../components/ui/FormActions'
import { useContext, useEffect, useState } from 'react'
import { verifyAccountRequest } from '../../services/auth.service'
import { AuthContext } from '../../context/AuthContext'
import { resolveAuthRedirect, clearAuthRedirect, saveAuthRedirect } from '../../utils/authNavigation'
import useDocumentTitle from '../../hooks/useDocumentTitle';


function EmailCheck() {
  useDocumentTitle('Verifica tu correo');

  const navigate = useNavigate()
  const location = useLocation()

  const [email] = useState(() => {
    if (location.state?.email) {
      sessionStorage.setItem('pending_email', location.state.email)
      return location.state.email
    }
    return sessionStorage.getItem('pending_email') || ''
  })

  const { login } = useContext(AuthContext)
  const [fromRoute] = useState(() => resolveAuthRedirect(location.state?.from, '/'))
  const [pendingPassword] = useState(() => {
    return sessionStorage.getItem('pending_password') || ''
  })

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const handleVerify = async () => {
    // Si por alguna razón extrema el email sigue vacío, alertamos visualmente antes de disparar el error
    if (!email) {
      setError(
        'No se encontró un correo asociado. Por favor, regresa al registro.',
      )
      return
    }
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const res = await verifyAccountRequest({ email, code: code.trim() })
      setMessage('Cuenta verificada correctamente. Redirigiendo...')

      if (pendingPassword) {
        try {
          const loginResult = await login({ email, password: pendingPassword })
          if (loginResult?.success) {
            setTimeout(() => {
              sessionStorage.removeItem('pending_email')
              sessionStorage.removeItem('pending_password')
              clearAuthRedirect()
              navigate(fromRoute, { replace: true })
            }, 1200)
            return
          }
        } catch (loginError) {
          console.error('Error auto-login tras verificación:', loginError)
        }
      }

      setTimeout(() => {
        clearAuthRedirect()
        navigate('/login', { state: { from: fromRoute } })
      }, 2000)
    } catch (err) {
      setError('Código incorrecto o expirado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_50%,#231640_100%)] min-h-screen flex">
      {/* Imagen lateral */}
      <div className="hidden lg:block lg:w-1/2 lg:h-screen lg:sticky lg:top-0 overflow-hidden">
        <img
          src={registerImage}
          className="w-full h-full object-cover"
          alt="register imagen"
        />
      </div>

      {/* Contenido */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center py-12 px-6 lg:px-0">
        <div className="flex flex-col items-center space-y-6 w-full max-w-md">
          <img
            src={logotipo}
            className="w-48 md:w-60 h-auto cursor-pointer hover:scale-105 transition-transform"
            alt="logotipo"
            onClick={() => navigate('/')}
          />

          <h1 className="text-center text-[#D9982F] text-4xl leading-tight font-montserrat font-bold">
            ¡Revisa tu bandeja de entrada!
          </h1>

          <p className="text-center text-white/70 text-sm leading-relaxed font-montserrat max-w-md">
            Te enviamos un código para validar tu cuenta. Ingresa el código que
            recibiste por correo.
          </p>

          {/* INPUT DEL CÓDIGO */}
          <InputCode
            id="code"
            length={4}
            onChange={(val) => setCode(val)}
          />

          {/* MENSAJES */}
          {error && <p className="text-red-400">{error}</p>}
          {message && <p className="text-green-400">{message}</p>}

          <FormActions
            onCancel={() => navigate('/login', { state: { from: fromRoute } })}
            onSubmit={handleVerify}
            cancelText="Volver al inicio"
            submitText="Validar cuenta"
            isLoading={loading}
            loadingText="Validando..."
          />
        </div>
      </div>
    </div>
  )
}

export default EmailCheck
