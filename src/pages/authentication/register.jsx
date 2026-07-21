import registerImage from '../../assets/images/RegisterHD.webp'
import logotipo from '../../assets/images/logotype/logoCiineflix.png'
import RegisterForm from '../../components/forms/RegisterForm'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { resolveAuthRedirect } from '../../utils/authNavigation'
import useDocumentTitle from '../../hooks/useDocumentTitle';


function Register() {
  useDocumentTitle('Registro');

  const navigate = useNavigate()
  const location = useLocation()
  const fromRoute = resolveAuthRedirect(location.state?.from, '/')
  return (
    <>
      <div className="bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_50%,#231640_100%)] min-h-screen flex">
        <div className="hidden lg:block lg:w-1/2 lg:h-screen lg:sticky lg:top-0 overflow-hidden">
          <img
            src={registerImage}
            className="h-full w-full object-cover"
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
            <h1 className="text-center text-[#D9982F] text-4xl leading-tight font-montserrat font-bold">
              Registro
            </h1>
            <p className="text-center text-white/70 text-sm leading-relaxed font-montserrat max-w-md">
              Crea tu cuenta para acceder a todas las funciones y el mejor
              contenido.
            </p>
            <RegisterForm />
            <p className="text-[#D9982F] text-base opacity-80 hover:opacity-100">
              ¿Ya tienes cuenta?
              <Link to="/login" state={{ from: fromRoute }} className="text-[#D9982F] underline">
                Inicia sesión
              </Link>
            </p>
            <p className="text-[#D9982F] text-sm opacity-80 hover:opacity-100">
              2026. Todos los derechos reservados
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register
