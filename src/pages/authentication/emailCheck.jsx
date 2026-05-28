import registerImage from '../../assets/images/register.png'
import logotipo from '../../assets/images/logotype/logoCiineflix.png'
import { useNavigate, useLocation } from 'react-router-dom'
import Button from '../../components/ui/Button'
import { useEffect, useState } from 'react'
import { verifyAccountRequest } from '../../services/auth.service'

function EmailCheck() {
  const navigate = useNavigate()
  const location = useLocation()

  const email = location.state?.email || ''

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  const handleVerify = async () => {
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const res = await verifyAccountRequest({ email, token: code })
      setMessage('Cuenta verificada correctamente. Redirigiendo...')

      setTimeout(() => navigate('/login'), 2000)
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
            onClick={() => navigate('/login')}
            className="text-lg font-montserrat font-semibold w-full bg-white/20"
          />
        </div>
      </div>
    </div>
  )
}

export default EmailCheck
