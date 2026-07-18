import registerImage from '../../assets/images/register.png'
import logotipo from '../../assets/images/logotype/logoCiineflix.png'
import { useNavigate, useLocation } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { useContext, useEffect, useState } from 'react'
import { verifyAccountRequest } from '../../services/auth.service'
import { AuthContext } from '../../context/AuthContext'

function EmailCheck() {
  const navigate = useNavigate()
  const location = useLocation()
  console.log('¿Qué viene exactamente en el state?:', location.state)

  const [email] = useState(() => {
    if (location.state?.email) {
      sessionStorage.setItem('pending_email', location.state.email)
      return location.state.email
    }
    return sessionStorage.getItem('pending_email') || ''
  })

  const { login } = useContext(AuthContext)
  const [fromRoute] = useState(() => {
    const from = location.state?.from || sessionStorage.getItem('pending_from') || '/'
    if (location.state?.from) {
      sessionStorage.setItem('pending_from', location.state.from)
    }
    return from
  })
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
      console.log('DATOS ENVIADOS:', { email, code: code.trim() })
      const res = await verifyAccountRequest({ email, code: code.trim() })
      setMessage('Cuenta verificada correctamente. Redirigiendo...')

      if (pendingPassword) {
        try {
          const loginResult = await login({ email, password: pendingPassword })
          if (loginResult?.success) {
            setTimeout(() => {
              sessionStorage.removeItem('pending_email')
              sessionStorage.removeItem('pending_password')
              sessionStorage.removeItem('pending_from')
              navigate(fromRoute, { replace: true })
            }, 1200)
            return
          }
        } catch (loginError) {
          console.error('Error auto-login tras verificación:', loginError)
        }
      }

      setTimeout(() => {
        sessionStorage.removeItem('pending_from')
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

          <p className="text-center text-white text-lg leading-relaxed font-montserrat max-w-md">
            Te enviamos un código para validar tu cuenta. Ingresa el código que
            recibiste por correo.
          </p>

          {/* INPUT DEL CÓDIGO */}
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ingresa el código"
            className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white text-lg focus:outline-none focus:border-[#D9982F]"
          />

          {/* MENSAJES */}
          {error && <p className="text-red-400">{error}</p>}
          {message && <p className="text-green-400">{message}</p>}

          {/* BOTÓN VALIDAR */}
          <Button
            text={loading ? 'Validando...' : 'Validar cuenta'}
            onClick={handleVerify}
            className="text-lg font-montserrat font-semibold w-full"
          />

          {/* BOTÓN IR AL LOGIN */}
          <Button
            text="Volver al inicio"
            onClick={() => navigate('/login', { state: { from: fromRoute } })}
            className="text-lg font-montserrat font-semibold w-full bg-white/20"
          />
        </div>
      </div>
    </div>
  )
}

export default EmailCheck
