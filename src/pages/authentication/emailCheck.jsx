import registerImage from '../../assets/images/register.png'
import logotipo from '../../assets/images/logotype/logoCiineflix.png'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'

function EmailCheck() {
  const navigate = useNavigate()
  const handleSubmit = (e) => {
    if (e) e.preventDefault() 
    navigate('/favorites')
  }
  return (
    <>
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
            <h1 className="text-center text-[#D9982F] text-4xl leading-tight font-montserrat font-bold">
              ¡Revisa tu bandeja de entrada!
            </h1>
            <p className="text-center text-white text-4lg leading-relaxed font-montserrat max-w-md">
              Te enviamos un correo para validar y culminar tu registro. Si no
              lo ves, revisa tu carpeta de spam.
            </p>
            <Button
              text="..."
              type="button"
              onClick={handleSubmit}
              className="text-lg font-montserrat font-semibold"
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default EmailCheck
