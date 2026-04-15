import { useState } from 'react'
import passwordimage from '../../assets/images/password.png'
import logotipo from '../../assets/images/logotype/logoCiineflix.png'

import SendMailForm from '../../components/forms/forgotPassword/SendMailForm'
import SendCode from '../../components/forms/forgotPassword/SendCode'
import NewPasswordForm from '../../components/forms/forgotPassword/NewPasswordForm'

function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')

  return (
    <div className="bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_18%,#231640_53%,#420946_79%,#231640_87%)] min-h-screen flex">
      {/* Imagen izquierda */}
      <div className="w-1/2 flex items-center justify-center">
        <img
          src={passwordimage}
          className="w-full h-full object-cover"
          alt="forgot password"
        />
      </div>

      {/* Contenido derecha */}
      <div className="w-1/2 flex items-center justify-center pt-8">
        <div className="flex flex-col items-center space-y-10">
          {/* Logo */}
          <img src={logotipo} className="w-60 h-auto" alt="logotipo" />

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
            2026. Todos los derechos reservados. Compañía Anónima Cineflix
          </p>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
