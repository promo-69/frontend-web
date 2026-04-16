import registerImage from '../../assets/images/register.png'
import logotipo from '../../assets/images/logotype/logoCiineflix.png'
import RegisterForm2 from '../../components/forms/RegisterForm2'
import { useNavigate } from 'react-router-dom'

function Register2() {
  const navigate = useNavigate()
  console.log(123123)
  return (
    <>
      <div className="bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_50%,#231640_100%)] min-h-screen flex">
        <div className="w-1/2 flex items-center justify-center">
          <img
            src={registerImage}
            className="w-full h-full object-cover"
            alt="register imagen"
          />
        </div>
        <div className="w-1/2 flex items-center justify-center pt-8">
          <div className="flex flex-col items-center space-y-6">
            <img
              src={logotipo}
              className="w-48 md:w-60 h-auto cursor-pointer hover:scale-105 transition-transform"
              alt="logotipo"
              onClick={() => navigate('/')}
            />
            <h1 className="text-center text-[#D9982F] text-4xl leading-tight font-montserrat font-bold">
              Registro
            </h1>
            <p className="text-center text-white text-4lg leading-relaxed font-montserrat max-w-md">
              Crea tu cuenta para acceder a todas las funciones y el mejor
              contenido.
            </p>
            <RegisterForm2 />
            <p className="text-[#D9982F] text-base opacity-80 hover:opacity-100 pt-5">
              ¿Ya tienes cuenta?
              <a href="/login" className="text-[#D9982F] underline">
                Inicia sesión
              </a>
            </p>
            <p className="text-[#D9982F] text-sm opacity-80 hover:opacity-100">2026. Todos los derechos reservados. Compañia Cineflix.</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register2
