import passwordimage from '../../assets/images/password.png'
import logotipo from '../../assets/images/logotype/logoCiineflix.png'
import SendMailForm from '../../components/forms/forgotPassword/SendMailForm'


function ForgotPassword() {
  return (
    <>
      <div className="bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_18%,#231640_53%,#420946_79%,#231640_87%)] min-h-screen flex">
        <div className="w-1/2 flex items-center justify-center">
          <img
            src={passwordimage}
            className="w-full h-full object-cover"
            alt="register imagen"
          />
        </div>
        <div className="w-1/2 flex items-start justify-center pt-8">
          <div className="flex flex-col items-center space-y-6">
            <img src={logotipo} className="w-60 h-auto" alt="logotipo" />
            <h1 className="text-center text-[#D9982F] text-4xl leading-tight font-montserrat font-bold">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-center text-white text-4lg leading-relaxed font-montserrat max-w-md">
              Ingresa tu correo electrónico para enviarte un correo 
            </p>
            <SendMailForm />
            
            <p>2026. Todos los derechos reservados. Compañia anonima Cineflix</p>
          </div>
        </div>
      </div>
    </>
  )
}


export default ForgotPassword
