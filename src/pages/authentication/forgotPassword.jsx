import { useState } from 'react'
import passwordimage from '../../assets/images/backforgetpassword.png'
import logotipo from '../../assets/images/logotype/logoCiineflix.png'

import SendMailForm from '../../components/forms/forgotPassword/SendMailForm'
import SendCode from '../../components/forms/forgotPassword/SendCode'
import NewPasswordForm from '../../components/forms/forgotPassword/NewPasswordForm'

function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState(' ')

  return (
    <div className="bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_50%,#231640_100%)] min-h-screen flex">
      {/* Imagen izquierda */}
      <div className="hidden lg:block lg:w-1/2 lg:h-screen lg:sticky lg:top-0 overflow-hidden">
        <img
          src={passwordimage}
          className="w-full h-full object-cover"
          alt="forgot password"
        />
      </div>

      {/* Contenido derecha */}
      <div className="w-full lg:w-1/2 min-h-screen flex items-center justify-center py-12 px-6 lg:px-0">
        <div className="flex flex-col items-center space-y-6 w-full max-w-md">
          {/* Logo */}
          <img
            src={logotipo}
            className="w-48 md:w-60 h-auto cursor-pointer hover:scale-105 transition-transform"
            alt="logotipo"
            onClick={() => navigate('/')}
          />

          {/* Render dinámico del paso */}
          {step === 1 && (
            <SendMailForm
              onNext={(enteredEmail) => {
                setEmail(enteredEmail)
                setStep(2)
              }}
            />
          )}

          {step === 2 && <SendCode email={email} onNext={() => setStep(3)} />}

          {step === 3 && <NewPasswordForm email={email} />}

          {/* Footer */}
          <p className="text-white text-sm opacity-70 pt-6">
            2026. Todos los derechos reservados. Compañía Anónima Cineflix.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
